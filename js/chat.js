// ===== SITEFLY 2.0 - CHAT / ONBOARDING / GENERATION =====
// Pega este archivo completo reemplazando el actual

// ===== HELPERS =====
function sf_escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function sf_slugify(text) {
    return String(text ?? '')
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

function sf_randomSlugSuffix() {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function sf_validWhatsapp(value) {
    return /^[0-9+\-\s()]{8,20}$/.test(String(value ?? '').trim());
}

function sf_safeCreateIcons() {
    if (typeof lucide !== 'undefined' && lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
}

function sf_safeCall(fnName, ...args) {
    try {
        const fn = window[fnName];
        if (typeof fn === 'function') return fn(...args);
    } catch (err) {
        console.warn(`SiteFly: error en ${fnName}`, err);
    }
    return undefined;
}

function sf_getSupabaseClient() {
    if (window.supabaseClient) return window.supabaseClient;

    const clientFactory =
        (typeof supabase !== 'undefined' && supabase && typeof supabase.createClient === 'function')
            ? supabase.createClient
            : (typeof supabaseJs !== 'undefined' && supabaseJs && typeof supabaseJs.createClient === 'function')
                ? supabaseJs.createClient
                : null;

    if (!clientFactory) return null;

    try {
        const client = clientFactory(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabaseClient = client;
        window.supabase = client; // Compatibilidad con otros archivos
        return client;
    } catch (err) {
        console.error('SiteFly: no se pudo inicializar Supabase', err);
        return null;
    }
}

function sf_getCategoryContent(cat) {
    return (window.sf_ai_content && window.sf_ai_content[cat]) || (window.sf_ai_content && window.sf_ai_content.default);
}

// ===== CONFIGURATION =====
const SUPABASE_URL = 'https://kyvcrzvpqkmfvnlqictl.supabase.co';
const SUPABASE_ANON_KEY = 'PON_AQUI_TU_ANON_KEY_PUBLICA';

// Inicialización segura de Supabase
const supabaseClient = sf_getSupabaseClient();

if (supabaseClient) {
    console.log('SiteFly: Supabase conectado correctamente');
} else {
    console.warn('SiteFly: Supabase no disponible, modo demo activado');
    window.supabaseClient = {
        from: () => ({
            select: () => Promise.reject(new Error('Supabase no disponible')),
            insert: () => Promise.reject(new Error('Supabase no disponible')),
            update: () => Promise.reject(new Error('Supabase no disponible')),
            delete: () => Promise.reject(new Error('Supabase no disponible'))
        }),
        auth: {
            signInWithOtp: () => Promise.reject(new Error('Supabase no disponible'))
        }
    };
    window.supabase = window.supabaseClient;
}

// ===== PRICING PLANS =====
const SF_PRICING = {
    FREE: {
        name: 'Gratuito',
        price: 0,
        features: ['Hasta 5 productos', 'Pedidos por WhatsApp', 'Plantilla básica', 'SEO básico'],
        limit: 5,
        recommended: false
    },
    PRO: {
        name: 'Pro',
        price: 9,
        features: ['Productos ilimitados', 'Pedidos ilimitados', 'Plantillas premium', 'SEO avanzado', 'Soporte prioritario', 'Sin comisión'],
        limit: Infinity,
        recommended: true
    }
};

// ===== ESTADO GLOBAL =====
if (typeof window.sf_state === 'undefined') {
    window.sf_state = {
        view: 'chat',
        chatStep: 1,
        userId: null,
        businessId: null,
        userData: {
            category: '',
            name: '',
            location: '',
            whatsapp: '',
            description: ''
        },
        products: [],
        cart: [],
        orders: [],
        currentTemplate: '',
        adminTab: 'negocio',
        plan: 'free',
        planExpiresAt: null,
        session: null,
        coupons: [],
        pageViews: [],
        analytics: {
            today: 0,
            week: 0,
            conversion: 0
        }
    };
}

const sf_state = window.sf_state;

// ===== AI CONTENT DATABASE =====
window.sf_ai_content = window.sf_ai_content || {
    Restaurante: {
        templates: [{ name: 'Midnight', theme: 'theme-midnight', accent: '#d4a574', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80' }],
        benefits: ['Ingredientes 100% frescos', 'Ambiente familiar y acogedor', 'Chef con experiencia internacional'],
        defaultProducts: [
            { name: 'Plato del Día', desc: 'Incluye bebida y postre', price: 8.5 },
            { name: 'Hamburguesa Especial', desc: 'Con papas fritas y queso', price: 12 }
        ],
        faqs: [
            { q: '¿Hacen reservas?', a: 'Sí, aceptamos reservas para grupos.' },
            { q: '¿Tienen parqueo?', a: 'Contamos con parqueo privado.' }
        ]
    },
    Soda: {
        templates: [{ name: 'Tico', theme: 'theme-modern', accent: '#16a34a', img: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80' }],
        benefits: ['Comida casera como la de mamá', 'Refrescos naturales de fruta real', 'Servicio rápido y amable'],
        defaultProducts: [
            { name: 'Casado Tradicional', desc: 'Arroz, frijoles, plátano, ensalada', price: 5.5 },
            { name: 'Refresco Natural', desc: 'De temporada', price: 2 }
        ],
        faqs: [{ q: '¿Aceptan tarjetas?', a: 'Sí, aceptamos todas las tarjetas y SINPE.' }]
    },
    Cafetería: {
        templates: [{ name: 'Latte', theme: 'theme-modern', accent: '#92400e', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&q=80' }],
        benefits: ['Café de especialidad 100% arábica', 'Ambiente perfecto para trabajar', 'Pastelería artesanal diaria'],
        defaultProducts: [
            { name: 'Café Americano', desc: 'Grano de altura', price: 2.5 },
            { name: 'Croissant', desc: 'Horneado diariamente', price: 3 }
        ],
        faqs: [{ q: '¿Tienen WiFi?', a: 'Sí, WiFi de alta velocidad gratuito.' }]
    },
    Barbería: {
        templates: [{ name: 'Garage', theme: 'theme-garage', accent: '#eab308', img: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&q=80' }],
        benefits: ['Cortes clásicos y modernos', 'Perfilado de barba con toalla caliente', 'Productos de primera calidad'],
        defaultProducts: [
            { name: 'Corte de Cabello', desc: 'Estilo clásico o moderno', price: 10 },
            { name: 'Perfilado de Barba', desc: 'Con toalla caliente', price: 7 }
        ],
        faqs: [{ q: '¿Necesito cita?', a: 'Recomendamos cita, pero aceptamos walk-ins.' }]
    },
    Sublimado: {
        templates: [{ name: 'Print', theme: 'theme-print', accent: '#6366f1', img: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=1200&q=80' }],
        benefits: ['Impresión de alta definición', 'Tintas resistentes al lavado', 'Diseños 100% personalizados'],
        defaultProducts: [
            { name: 'Taza Personalizada', desc: 'Cerámica de alta calidad', price: 8 },
            { name: 'Camiseta Sublimada', desc: 'Tela dry-fit', price: 12 }
        ],
        faqs: [{ q: '¿Puedo enviar mi diseño?', a: 'Sí, aceptamos archivos en PNG o AI.' }]
    },
    default: {
        templates: [{ name: 'Moderno', theme: 'theme-midnight', accent: '#6366f1', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80' }],
        benefits: ['Servicio profesional garantizado', 'Atención personalizada', 'Calidad premium'],
        defaultProducts: [
            { name: 'Servicio Básico', desc: 'Consultar detalles', price: 20 },
            { name: 'Servicio Premium', desc: 'Incluye garantía', price: 35 }
        ],
        faqs: [{ q: '¿Tiempo de entrega?', a: 'Generalmente 24-48 horas.' }]
    }
};

[
    'Panadería',
    'Belleza',
    'Tienda de ropa',
    'Ferretería',
    'Taller mecánico',
    'Profesional independiente',
    'Consultorio',
    'Veterinaria',
    'Gimnasio',
    'Hotel',
    'Turismo',
    'Otro'
].forEach((cat) => {
    if (!window.sf_ai_content[cat]) {
        window.sf_ai_content[cat] = {
            templates: [{ name: 'Premium', theme: 'theme-midnight', accent: '#6366f1', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80' }],
            benefits: ['Servicio profesional garantizado', 'Atención personalizada', 'Calidad premium'],
            defaultProducts: [{ name: 'Servicio Principal', desc: 'Nuestro servicio más solicitado', price: 25 }],
            faqs: [{ q: '¿Cómo agendar?', a: 'Directamente por WhatsApp.' }]
        };
    }
});

// ===== INICIALIZACIÓN =====
function sf_initChat() {
    const container = document.getElementById('sf-chat-messages');
    if (!container) return;

    container.innerHTML = '';
    sf_addAiMessage('¡Hola! 👋 Soy SiteFly, tu empleado digital.');

    setTimeout(() => {
        sf_addAiMessage('Voy a crear tu negocio digital completo con textos, SEO y diseño profesional. Primero, ¿qué tipo de negocio tienes?');
        sf_showCategoryButtons();
    }, 800);
}

// ===== MENSAJES =====
function sf_addAiMessage(text) {
    const container = document.getElementById('sf-chat-messages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'flex gap-3 sf-animate-up';
    div.innerHTML = `<div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">AI</div><div class="sf-bubble-ai text-white px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-lg">${sf_escapeHtml(text)}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function sf_addUserMessage(text) {
    const container = document.getElementById('sf-chat-messages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'flex justify-end sf-animate-up';
    div.innerHTML = `<div class="sf-bubble-user bg-indigo-600 text-white px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-lg">${sf_escapeHtml(text)}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function sf_addTypingIndicator() {
    const container = document.getElementById('sf-chat-messages');
    if (!container) return;

    if (document.getElementById('sf-typing-indicator')) return;

    const div = document.createElement('div');
    div.id = 'sf-typing-indicator';
    div.className = 'flex gap-3 sf-animate-up';
    div.innerHTML = `<div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">AI</div><div class="sf-bubble-ai px-4 py-3 rounded-2xl flex items-center gap-1.5"><div class="w-2 h-2 bg-slate-400 rounded-full sf-typing-dot"></div><div class="w-2 h-2 bg-slate-400 rounded-full sf-typing-dot"></div><div class="w-2 h-2 bg-slate-400 rounded-full sf-typing-dot"></div></div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function sf_removeTypingIndicator() {
    const el = document.getElementById('sf-typing-indicator');
    if (el) el.remove();
}

// ===== CATEGORÍAS =====
function sf_showCategoryButtons() {
    const container = document.getElementById('sf-chat-input-container');
    if (!container) return;

    const cats = ['Restaurante', 'Soda', 'Cafetería', 'Panadería', 'Barbería', 'Belleza', 'Tienda de ropa', 'Ferretería', 'Taller mecánico', 'Sublimado', 'Veterinaria', 'Gimnasio', 'Otro'];

    container.innerHTML = `
        <div class="w-full grid grid-cols-2 md:grid-cols-3 gap-2 p-1 max-h-64 overflow-y-auto animate-fade-in">
            ${cats
                .map(
                    (c) =>
                        `<button type="button" onclick="sf_selectCategory('${sf_escapeHtml(c)}')" class="bg-slate-800 hover:bg-slate-700 text-white text-xs md:text-sm px-3 py-3 rounded-xl text-center transition-colors border border-slate-700">${sf_escapeHtml(c)}</button>`
                )
                .join('')}
        </div>`;
}

function sf_selectCategory(cat) {
    sf_state.userData.category = cat;
    sf_addUserMessage(cat);

    const inputContainer = document.getElementById('sf-chat-input-container');
    if (inputContainer) inputContainer.innerHTML = '';

    sf_state.chatStep = 2;

    const content = sf_getCategoryContent(cat) || sf_getCategoryContent('default');
    sf_state.products = (content?.defaultProducts || []).map((p, idx) => ({
        id: `temp-${Date.now()}-${idx}`,
        name: p.name,
        description: p.desc || p.description || '',
        price: Number(p.price || 0)
    }));

    sf_nextQuestion();
}

// ===== FLUJO DE PREGUNTAS =====
function sf_nextQuestion() {
    sf_addTypingIndicator();

    setTimeout(() => {
        sf_removeTypingIndicator();
        const inputContainer = document.getElementById('sf-chat-input-container');
        if (!inputContainer) return;

        switch (sf_state.chatStep) {
            case 2:
                sf_addAiMessage(`¡Perfecto! ¿Cómo se llama tu ${sf_state.userData.category}?`);
                inputContainer.innerHTML = sf_textInput('Ej: Burger King...', 2);
                break;
            case 3:
                sf_addAiMessage('¿En qué ciudad o zona se encuentra? (Esto optimizará tu SEO local)');
                inputContainer.innerHTML = sf_textInput('Ej: San José, Centro...', 3);
                break;
            case 4:
                sf_addAiMessage('¿Cuál es tu número de WhatsApp para recibir pedidos?');
                inputContainer.innerHTML = sf_textInput('+506 8888 8888', 4);
                break;
            case 5:
                sf_addAiMessage('¡Listo! Estoy generando tu página web con textos persuasivos, beneficios, FAQs y optimización SEO.');
                inputContainer.innerHTML = `
                    <button type="button" onclick="sf_finishChat()" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-4 rounded-xl text-sm font-bold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2">
                        <i data-lucide="sparkles" class="w-4 h-4"></i> Crear mi negocio digital
                    </button>`;
                sf_safeCreateIcons();
                break;
            default:
                break;
        }
    }, 800);
}

function sf_textInput(placeholder, step) {
    return `
        <div class="flex gap-2 w-full animate-fade-in">
            <input
                type="text"
                id="sf-chat-text-input"
                placeholder="${sf_escapeHtml(placeholder)}"
                class="flex-1 bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                onkeypress="if(event.key==='Enter') sf_submitText(${step})"
                autofocus
            >
            <button type="button" onclick="sf_submitText(${step})" class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl transition-colors flex items-center gap-2">
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
        </div>`;
}

function sf_submitText(step) {
    const input = document.getElementById('sf-chat-text-input');
    if (!input || !input.value.trim()) {
        input?.classList.add('border-red-500');
        setTimeout(() => input?.classList.remove('border-red-500'), 500);
        return;
    }

    const value = input.value.trim();

    if (step === 4 && !sf_validWhatsapp(value)) {
        input.classList.add('border-red-500');
        sf_addAiMessage('Ese número de WhatsApp no parece válido. Escríbelo con código de país, por favor.');
        setTimeout(() => input.classList.remove('border-red-500'), 600);
        return;
    }

    sf_addUserMessage(value);

    const inputContainer = document.getElementById('sf-chat-input-container');
    if (inputContainer) inputContainer.innerHTML = '';

    if (step === 2) sf_state.userData.name = value;
    if (step === 3) sf_state.userData.location = value;
    if (step === 4) sf_state.userData.whatsapp = value;

    sf_state.chatStep = step + 1;
    sf_nextQuestion();
}

function sf_finishChat() {
    sf_addUserMessage('¡Crear mi negocio!');

    const inputContainer = document.getElementById('sf-chat-input-container');
    if (inputContainer) inputContainer.innerHTML = '';

    setTimeout(() => {
        if (typeof sf_showView === 'function') {
            sf_showView('generating');
            sf_runGeneration();
        } else {
            alert('Error: Función sf_showView no definida. Asegúrate de cargar app.js primero.');
        }
    }, 500);
}

// ===== GENERACIÓN Y BASE DE DATOS =====
async function sf_runGeneration() {
    const container = document.getElementById('sf-gen-steps');
    if (!container) return;

    const steps = [
        { text: 'Generando textos persuasivos...', icon: 'file-text' },
        { text: 'Optimizando SEO local...', icon: 'search' },
        { text: 'Diseñando interfaz...', icon: 'palette' },
        { text: 'Guardando en base de datos...', icon: 'database' },
        { text: 'Publicando sitio...', icon: 'rocket' }
    ];

    container.innerHTML = steps.map((step, idx) => `
        <div id="sf-gen-step-${idx}" class="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-xl opacity-30 transition-all duration-500">
            <div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center transition-colors" id="sf-gen-icon-${idx}">
                <i data-lucide="${step.icon}" class="w-5 h-5 text-slate-400"></i>
            </div>
            <span class="text-sm text-slate-300 font-medium">${sf_escapeHtml(step.text)}</span>
            <div class="ml-auto" id="sf-gen-check-${idx}"></div>
        </div>
    `).join('');

    sf_safeCreateIcons();

    const content = sf_getCategoryContent(sf_state.userData.category) || sf_getCategoryContent('default');
    sf_state.userData.description = `El mejor ${sf_state.userData.category.toLowerCase()} en ${sf_state.userData.location}. Especialistas en servicio de calidad.`;
    sf_state.currentTemplate = content?.templates?.[0]?.name || 'Moderno';

    for (let i = 0; i < steps.length; i++) {
        await new Promise((r) => setTimeout(r, 1000));

        const el = document.getElementById(`sf-gen-step-${i}`);
        const iconEl = document.getElementById(`sf-gen-icon-${i}`);
        const checkEl = document.getElementById(`sf-gen-check-${i}`);

        if (!el || !iconEl || !checkEl) continue;

        el.style.opacity = '1';
        el.classList.add('border-indigo-500/50', 'bg-slate-800');
        iconEl.classList.add('bg-indigo-600', 'shadow-lg', 'shadow-indigo-500/30');
        iconEl.innerHTML = `<div class="sf-loading" style="width:20px;height:20px;border-width:2px;border-style:solid;border-color:white transparent transparent transparent;border-radius:9999px;"></div>`;

        if (i === 3) {
            try {
                await sf_createBusiness();

                if (sf_state.businessId) {
                    for (const product of sf_state.products) {
                        await sf_saveProduct(product);
                    }
                }
            } catch (e) {
                console.error('Error guardando:', e);
                sf_addAiMessage('Hubo un problema al guardar tu negocio, pero voy a terminar la parte visual.');
            }
        }

        setTimeout(() => {
            iconEl.className = 'w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30 transition-all';
            iconEl.innerHTML = `<i data-lucide="check" class="w-5 h-5 text-white"></i>`;
            checkEl.innerHTML = '<span class="text-xs text-green-400 font-bold">Completado</span>';
            sf_safeCreateIcons();
        }, 400);
    }

    setTimeout(() => {
        if (typeof sf_showView === 'function') {
            sf_showView('admin');
            sf_safeCall('sf_initAdmin');
            setTimeout(() => {
                sf_safeCall('sf_showPreview');
            }, 1000);
        }
    }, 800);
}

// ===== FUNCIONES DE BASE DE DATOS (ROBUSTAS) =====
async function sf_createBusiness() {
    const client = window.supabaseClient || sf_getSupabaseClient();
    if (!client || !client.from) {
        console.warn('Supabase no conectado, usando modo demo');
        sf_state.businessId = `demo-id-${Date.now()}`;
        return { id: sf_state.businessId };
    }

    const baseSlug = sf_slugify(sf_state.userData.name);
    const slug = `${baseSlug}-${sf_randomSlugSuffix()}`;

    const buildPayload = (useAddress = true) => ({
        name: sf_state.userData.name,
        category: sf_state.userData.category,
        description: sf_state.userData.description,
        ...(useAddress
            ? { address: sf_state.userData.location }
            : { city: sf_state.userData.location }),
        whatsapp: sf_state.userData.whatsapp,
        slug,
        status: 'active',
        template_id: sf_state.currentTemplate
    });

    // Intento 1: esquema con address
    let result = await client
        .from('businesses')
        .insert(buildPayload(true))
        .select()
        .single();

    // Si falla porque el campo address no existe, reintenta con city
    if (result.error) {
        const msg = String(result.error.message || '').toLowerCase();
        const columnError = msg.includes('column') && msg.includes('does not exist');

        if (columnError || msg.includes('address')) {
            result = await client
                .from('businesses')
                .insert(buildPayload(false))
                .select()
                .single();
        }
    }

    if (result.error) throw result.error;

    sf_state.businessId = result.data.id;
    return result.data;
}

async function sf_saveProduct(product) {
    const client = window.supabaseClient || sf_getSupabaseClient();
    if (!client || !sf_state.businessId) return null;

    const payload = {
        business_id: sf_state.businessId,
        name: product.name,
        description: product.description,
        price: Number(product.price || 0),
        active: true
    };

    const { data, error } = await client
        .from('products')
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return data;
}
