// ===== SITEFLY CORE APPLICATION =====
// Gestión de estado, navegación y utilidades globales

// ===== CONFIGURACIÓN GLOBAL =====
const APP_CONFIG = {
    VERSION: '2.0.0',
    STORAGE_KEY: 'sitefly_state',
    DEFAULT_CURRENCY: 'USD',
    DEFAULT_LANGUAGE: 'es',
    SESSION_TIMEOUT: 3600000, // 1 hora en ms
    MAX_CART_ITEMS: 50,
    TOAST_DURATION: 3000
};

// ===== GESTIÓN DE ESTADO CENTRALIZADA =====
class AppState {
    constructor() {
        this.state = this.loadState();
        this.listeners = new Map();
        this.initSession();
    }

    loadState() {
        try {
            const saved = localStorage.getItem(APP_CONFIG.STORAGE_KEY);
            if (saved) {
                return {
                    ...this.getDefaultState(),
                    ...JSON.parse(saved),
                    lastSync: Date.now()
                };
            }
        } catch (error) {
            console.warn('Error cargando estado guardado:', error);
        }
        return this.getDefaultState();
    }

    getDefaultState() {
        return {
            user: null,
            cart: [],
            favorites: [],
            currentView: 'home',
            theme: 'light',
            language: APP_CONFIG.DEFAULT_LANGUAGE,
            notifications: [],
            lastSync: null,
            sessionStart: Date.now()
        };
    }

    saveState() {
        try {
            const stateToSave = { ...this.state };
            delete stateToSave.notifications; // No guardar notificaciones temporales
            localStorage.setItem(APP_CONFIG.STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Error guardando estado:', error);
        }
    }

    getState() {
        return { ...this.state };
    }

    setState(newState, shouldSave = true) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        if (shouldSave) {
            this.saveState();
        }

        // Notificar a los listeners sobre los cambios
        Object.keys(newState).forEach(key => {
            const event = new CustomEvent(`statechange:${key}`, {
                detail: { 
                    oldValue: prevState[key], 
                    newValue: this.state[key] 
                }
            });
            document.dispatchEvent(event);
        });

        const fullEvent = new CustomEvent('statechange', {
            detail: { prevState: prevState, currentState: this.state }
        });
        document.dispatchEvent(fullEvent);
    }

    subscribe(key, callback) {
        const handler = (event) => callback(event.detail);
        document.addEventListener(`statechange:${key}`, handler);
        this.listeners.set(`${key}_${callback.name}`, handler);
        return () => this.unsubscribe(key, callback);
    }

    unsubscribe(key, callback) {
        const handlerKey = `${key}_${callback.name}`;
        const handler = this.listeners.get(handlerKey);
        if (handler) {
            document.removeEventListener(`statechange:${key}`, handler);
            this.listeners.delete(handlerKey);
        }
    }

    initSession() {
        // Verificar timeout de sesión
        const now = Date.now();
        if (this.state.sessionStart && (now - this.state.sessionStart) > APP_CONFIG.SESSION_TIMEOUT) {
            this.clearSession();
        }
        
        // Actualizar timestamp de sesión
        this.setState({ sessionStart: now }, false);
        
        // Auto-guardado periódico
        setInterval(() => this.saveState(), 30000); // Cada 30 segundos
    }

    clearSession() {
        const defaultState = this.getDefaultState();
        this.setState({
            user: null,
            cart: [],
            sessionStart: Date.now(),
            notifications: []
        });
        localStorage.removeItem(APP_CONFIG.STORAGE_KEY);
    }
}

// ===== MANEJADOR DE ERRORES GLOBAL =====
class ErrorHandler {
    constructor() {
        this.errorCount = 0;
        this.maxErrors = 10;
        this.init();
    }

    init() {
        window.onerror = (message, source, lineno, colno, error) => {
            this.handleError(error || new Error(message), { source, lineno, colno });
            return true; // Prevenir el manejador por defecto del navegador
        };

        window.onunhandledrejection = (event) => {
            this.handleError(event.reason || new Error('Promesa rechazada sin manejar'), {
                type: 'unhandledrejection'
            });
            event.preventDefault();
        };
    }

    handleError(error, context = {}) {
        this.errorCount++;
        
        const errorInfo = {
            message: error.message || 'Error desconocido',
            stack: error.stack,
            context,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // Log en consola (en producción podría enviarse a un servicio de monitoreo)
        console.error('[SiteFly Error]', errorInfo);

        // Guardar errores críticos en localStorage para debugging
        if (this.errorCount <= this.maxErrors) {
            this.saveError(errorInfo);
        }

        // Notificar al usuario si es un error crítico
        if (this.isCriticalError(error)) {
            this.showUserNotification('Ha ocurrido un error. Por favor, recarga la página.');
        }

        // Dispatch evento para que otros componentes puedan reaccionar
        document.dispatchEvent(new CustomEvent('app:error', { detail: errorInfo }));
    }

    isCriticalError(error) {
        const criticalPatterns = [
            /NetworkError/,
            /QuotaExceededError/,
            /SecurityError/,
            /IndexedDB/
        ];
        return criticalPatterns.some(pattern => pattern.test(error.message || ''));
    }

    saveError(errorInfo) {
        try {
            const errors = JSON.parse(localStorage.getItem('sitefly_errors') || '[]');
            errors.push(errorInfo);
            localStorage.setItem('sitefly_errors', JSON.stringify(errors.slice(-10))); // Mantener últimos 10
        } catch (e) {
            console.warn('No se pudo guardar el error:', e);
        }
    }

    showUserNotification(message) {
        // Usar el sistema de toast si está disponible
        if (window.showToast) {
            window.showToast(message, 'error');
        } else {
            alert(message);
        }
    }

    getRecentErrors() {
        try {
            return JSON.parse(localStorage.getItem('sitefly_errors') || '[]');
        } catch (e) {
            return [];
        }
    }

    clearErrors() {
        localStorage.removeItem('sitefly_errors');
        this.errorCount = 0;
    }
}

// ===== SISTEMA DE NAVEGACIÓN SPA =====
class NavigationManager {
    constructor(appState) {
        this.appState = appState;
        this.routes = new Map();
        this.currentRoute = null;
        this.history = [];
        this.init();
    }

    init() {
        // Manejar navegación con botones atrás/adelante
        window.addEventListener('popstate', (event) => {
            if (event.state?.route) {
                this.navigate(event.state.route, false);
            }
        });

        // Navegación inicial
        const initialRoute = window.location.hash.slice(1) || 'home';
        this.navigate(initialRoute, false);
    }

    registerRoute(routeName, config) {
        this.routes.set(routeName, {
            name: routeName,
            ...config
        });
    }

    async navigate(routeName, pushToHistory = true) {
        const route = this.routes.get(routeName);
        
        if (!route) {
            console.warn(`Ruta "${routeName}" no registrada`);
            this.navigate('home', pushToHistory);
            return false;
        }

        // Ejecutar guards de navegación
        if (route.guard && !await route.guard()) {
            this.showAccessDenied(routeName);
            return false;
        }

        // Ejecutar beforeLeave de la ruta actual
        if (this.currentRoute?.beforeLeave) {
            const canLeave = await this.currentRoute.beforeLeave();
            if (!canLeave) {
                return false;
            }
        }

        const previousRoute = this.currentRoute?.name;
        this.currentRoute = route;

        // Actualizar estado de la aplicación
        this.appState.setState({ currentView: routeName });

        // Actualizar URL
        if (pushToHistory) {
            history.pushState({ route: routeName }, '', `#${routeName}`);
            this.history.push(routeName);
        }

        // Actualizar título de la página
        document.title = route.title ? `${route.title} | SiteFly` : 'SiteFly';

        // Ejecutar beforeEnter de la nueva ruta
        if (route.beforeEnter) {
            await route.beforeEnter();
        }

        // Renderizar la vista
        await this.renderRoute(route);

        // Ejecutar afterEnter
        if (route.afterEnter) {
            await route.afterEnter();
        }

        // Dispatch evento de navegación
        document.dispatchEvent(new CustomEvent('app:navigate', {
            detail: { 
                from: previousRoute, 
                to: routeName,
                route: route
            }
        }));

        // Scroll al top
        window.scrollTo(0, 0);

        return true;
    }

    async renderRoute(route) {
        const mainContainer = document.getElementById('app-container') || document.querySelector('main');
        
        if (!mainContainer) {
            console.error('No se encontró el contenedor principal para renderizar la ruta');
            return;
        }

        // Mostrar loading si está definido
        if (route.loading) {
            mainContainer.innerHTML = typeof route.loading === 'function' 
                ? await route.loading() 
                : route.loading;
        }

        // Renderizar contenido
        try {
            const content = typeof route.component === 'function'
                ? await route.component()
                : route.component;

            mainContainer.innerHTML = content;

            // Inicializar iconos de Lucide después de renderizar
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

            // Ejecutar scripts de la vista si existen
            if (route.onMount) {
                await route.onMount();
            }
        } catch (error) {
            console.error(`Error renderizando ruta ${route.name}:`, error);
            mainContainer.innerHTML = `
                <div class="error-container">
                    <h2>Error al cargar la página</h2>
                    <p>No se pudo cargar el contenido solicitado.</p>
                    <button onclick="window.location.reload()" class="btn btn-primary">
                        Recargar página
                    </button>
                </div>
            `;
        }
    }

    showAccessDenied(routeName) {
        window.showToast?.('No tienes permiso para acceder a esta sección', 'warning');
        this.navigate(this.appState.getState().user ? 'dashboard' : 'login', false);
    }

    back() {
        if (this.history.length > 1) {
            this.history.pop();
            const previousRoute = this.history[this.history.length - 1];
            history.back();
        } else {
            this.navigate('home');
        }
    }

    getCurrentRoute() {
        return this.currentRoute;
    }
}

// ===== VALIDADOR DE DATOS =====
class Validator {
    static rules = {
        required: (value) => {
            if (typeof value === 'string') return value.trim().length > 0;
            if (Array.isArray(value)) return value.length > 0;
            return value !== null && value !== undefined;
        },
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        minLength: (min) => (value) => String(value).length >= min,
        maxLength: (max) => (value) => String(value).length <= max,
        min: (min) => (value) => Number(value) >= min,
        max: (max) => (value) => Number(value) <= max,
        pattern: (regex) => (value) => regex.test(value),
        phone: (value) => /^[\d\s\-\+\(\)]{8,20}$/.test(value),
        url: (value) => {
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        },
        custom: (fn) => fn
    };

    static validate(data, schema) {
        const errors = {};
        
        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];
            const fieldErrors = [];

            const rulesArray = Array.isArray(rules) ? rules : [rules];

            for (const rule of rulesArray) {
                let ruleFn, errorMessage;

                if (typeof rule === 'string') {
                    ruleFn = this.rules[rule];
                    errorMessage = this.getDefaultMessage(field, rule);
                } else if (typeof rule === 'object' && rule.validator) {
                    ruleFn = rule.validator;
                    errorMessage = rule.message || this.getDefaultMessage(field, rule.type || 'custom');
                } else if (typeof rule === 'function') {
                    ruleFn = rule;
                    errorMessage = 'Campo inválido';
                } else {
                    continue;
                }

                if (ruleFn && !ruleFn(value)) {
                    fieldErrors.push(errorMessage);
                }
            }

            if (fieldErrors.length > 0) {
                errors[field] = fieldErrors;
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    static getDefaultMessage(field, rule) {
        const messages = {
            required: `${field} es requerido`,
            email: `${field} debe ser un email válido`,
            minLength: `${field} es demasiado corto`,
            maxLength: `${field} es demasiado largo`,
            min: `${field} es demasiado pequeño`,
            max: `${field} es demasiado grande`,
            pattern: `${field} tiene formato inválido`,
            phone: `${field} debe ser un número de teléfono válido`,
            url: `${field} debe ser una URL válida`
        };
        return messages[rule] || `${field} es inválido`;
    }

    static sanitizeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    static sanitizeObject(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item));
        }

        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                sanitized[key] = this.sanitizeHTML(value);
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = this.sanitizeObject(value);
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
}

// ===== SISTEMA DE NOTIFICACIONES TOAST =====
class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.init();
    }

    init() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = APP_CONFIG.TOAST_DURATION) {
        const toast = document.createElement('div');
        const id = `toast-${Date.now()}-${Math.random()}`;
        
        const icons = {
            success: 'check-circle',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        toast.id = id;
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border-left: 4px solid ${colors[type]};
            min-width: 300px;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;

        toast.innerHTML = `
            <i data-lucide="${icons[type]}" style="color: ${colors[type]}; flex-shrink: 0;"></i>
            <span style="flex: 1;">${Validator.sanitizeHTML(message)}</span>
            <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                color: #6b7280;
            ">
                <i data-lucide="x" style="width: 16px; height: 16px;"></i>
            </button>
        `;

        this.container.appendChild(toast);
        this.toasts.push({ id, element: toast });

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Auto-remover después del duration
        setTimeout(() => this.remove(id), duration);

        return id;
    }

    remove(id) {
        const toastIndex = this.toasts.findIndex(t => t.id === id);
        if (toastIndex === -1) return;

        const toast = this.toasts[toastIndex].element;
        toast.style.animation = 'slideOut 0.3s ease-out';
        
        setTimeout(() => {
            toast.remove();
            this.toasts = this.toasts.filter(t => t.id !== id);
        }, 300);
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Añadir estilos de animación para toasts
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(toastStyles);

// ===== UTILIDADES GLOBALES =====
const Utils = {
    // Debounce para funciones
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle para funciones
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Formatear moneda
    formatCurrency(amount, currency = APP_CONFIG.DEFAULT_CURRENCY, locale = 'es-ES') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    // Formatear fecha
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(date).toLocaleDateString(APP_CONFIG.DEFAULT_LANGUAGE, {
            ...defaultOptions,
            ...options
        });
    },

    // Generar ID único
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    // Deep clone
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Comprobar si está en móvil
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    // Copiar al portapapeles
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Error al copiar:', err);
            return false;
        }
    },

    // Download file
    downloadFile(content, filename, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    // Comprobar conexión a internet
    isOnline() {
        return navigator.onLine;
    },

    // Esperar un tiempo
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// ===== INICIALIZACIÓN DE LA APLICACIÓN =====
let appState, errorHandler, navigationManager, toastManager;

async function initializeApp() {
    try {
        // Inicializar manejador de errores primero
        errorHandler = new ErrorHandler();

        // Inicializar estado
        appState = new AppState();

        // Inicializar sistema de notificaciones
        toastManager = new ToastManager();
        window.showToast = (message, type = 'info', duration) => toastManager.show(message, type, duration);
        window.showToastSuccess = (message, duration) => toastManager.success(message, duration);
        window.showToastError = (message, duration) => toastManager.error(message, duration);
        window.showToastWarning = (message, duration) => toastManager.warning(message, duration);

        // Inicializar navegación
        navigationManager = new NavigationManager(appState);

        // Registrar rutas básicas
        registerDefaultRoutes();

        // Exponer globalmente para acceso desde otros módulos
        window.appState = appState;
        window.navigationManager = navigationManager;
        window.Validator = Validator;
        window.Utils = Utils;

        // Suscribirse a cambios de estado importantes
        appState.subscribe('user', ({ newValue }) => {
            if (!newValue) {
                window.showToast('Sesión cerrada correctamente', 'info');
            }
        });

        appState.subscribe('theme', ({ newValue }) => {
            document.documentElement.setAttribute('data-theme', newValue);
        });

        // Aplicar tema guardado
        if (appState.getState().theme !== 'light') {
            document.documentElement.setAttribute('data-theme', appState.getState().theme);
        }

        // Inicializar iconos de Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        console.log(`✅ SiteFly v${APP_CONFIG.VERSION} inicializado correctamente`);

        // Dispatch evento de app lista
        document.dispatchEvent(new CustomEvent('app:ready', {
            detail: {
                version: APP_CONFIG.VERSION,
                state: appState.getState()
            }
        }));

    } catch (error) {
        console.error('❌ Error fatal inicializando la aplicación:', error);
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                font-family: system-ui, -apple-system, sans-serif;
            ">
                <div style="text-align: center; padding: 40px;">
                    <h1 style="color: #ef4444; margin-bottom: 16px;">Error de Inicio</h1>
                    <p style="color: #6b7280; margin-bottom: 24px;">
                        No se pudo iniciar la aplicación. Por favor, recarga la página.
                    </p>
                    <button onclick="window.location.reload()" style="
                        padding: 12px 24px;
                        background: #3b82f6;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 16px;
                    ">Recargar Página</button>
                </div>
            </div>
        `;
    }
}

function registerDefaultRoutes() {
    // Ruta Home
    navigationManager.registerRoute('home', {
        title: 'Inicio',
        component: async () => {
            // El contenido real lo maneja app.js o index.html
            return document.getElementById('home-view')?.innerHTML || '<h1>Inicio</h1>';
        }
    });

    // Ruta Login
    navigationManager.registerRoute('login', {
        title: 'Iniciar Sesión',
        component: async () => {
            return document.getElementById('login-view')?.innerHTML || '<h1>Login</h1>';
        }
    });

    // Ruta Dashboard (requiere autenticación)
    navigationManager.registerRoute('dashboard', {
        title: 'Panel de Control',
        guard: () => !!appState.getState().user,
        component: async () => {
            return document.getElementById('dashboard-view')?.innerHTML || '<h1>Dashboard</h1>';
        }
    });

    // Ruta Carrito
    navigationManager.registerRoute('cart', {
        title: 'Carrito',
        component: async () => {
            return document.getElementById('cart-view')?.innerHTML || '<h1>Carrito</h1>';
        }
    });

    // Ruta Admin (requiere autenticación y rol admin)
    navigationManager.registerRoute('admin', {
        title: 'Administración',
        guard: () => {
            const user = appState.getState().user;
            return user && (user.role === 'admin' || user.isAdmin);
        },
        component: async () => {
            return document.getElementById('admin-view')?.innerHTML || '<h1>Admin</h1>';
        }
    });

    // Ruta 404
    navigationManager.registerRoute('404', {
        title: 'Página no encontrada',
        component: async () => `
            <div style="text-align: center; padding: 60px 20px;">
                <h1 style="font-size: 4rem; color: #3b82f6; margin-bottom: 16px;">404</h1>
                <h2 style="margin-bottom: 16px;">Página no encontrada</h2>
                <p style="color: #6b7280; margin-bottom: 32px;">
                    La página que buscas no existe o ha sido movida.
                </p>
                <button onclick="navigationManager.navigate('home')" style="
                    padding: 12px 24px;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                ">Volver al Inicio</button>
            </div>
        `
    });
}

// Iniciar aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Exportar para módulos ES6 si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppState,
        ErrorHandler,
        NavigationManager,
        Validator,
        ToastManager,
        Utils,
        APP_CONFIG,
        initializeApp
    };
}
