// ===== SITEFLY CONFIGURATION =====

// Cambia esta llave por tu ANON key real de Supabase
const SUPABASE_URL = 'https://kyvcrzvpqkmfvnlqictl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5dmNyenZwcWttZnZubHFpY3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDAzMjUsImV4cCI6MjA5NTU3NjMyNX0.BppEWjs6MgNzB1KIlnBvDlUjdKaACBnwQemRXybfn14';

const APP_NAME = 'Sitefly'; // Corregido: Uso exacto de tu marca comercial
const DEFAULT_CURRENCY = 'USD';

// ===== CATEGORIES =====
const CATEGORIES = [
    'Restaurante', 'Cafetería', 'Panadería', 'Soda', 'Barbería', 
    'Belleza', 'Tienda de ropa', 'Ferretería', 'Taller mecánico', 
    'Veterinaria', 'Gimnasio', 'Turismo', 'Hotel', 
    'Profesional independiente', 'Otro'
];

// ===== TEMPLATES =====
const TEMPLATES = [
    { id: 'rest-modern-dark', name: 'Restaurante Oscuro Moderno', category: 'Restaurante' },
    { id: 'rest-classic-light', name: 'Clásico Luminoso', category: 'Restaurante' },
    { id: 'rest-fast-food', name: 'Comida Rápida Vibrante', category: 'Restaurante' },
    { id: 'cafe-minimal', name: 'Café Minimalista', category: 'Cafetería' },
    { id: 'cafe-rustic', name: 'Rústico Acogedor', category: 'Cafetería' },
    { id: 'cafe-urban', name: 'Urbano Industrial', category: 'Cafetería' },
    { id: 'bakery-warm', name: 'Panadería Cálida', category: 'Panadería' },
    { id: 'bakery-french', name: 'Estilo Francés', category: 'Panadería' },
    { id: 'bakery-sweet', name: 'Dulces y Pasteles', category: 'Panadería' },
    { id: 'soda-tico', name: 'Soda Típica', category: 'Soda' },
    { id: 'soda-grill', name: 'Grill & Bar', category: 'Soda' },
    { id: 'soda-family', name: 'Familiar Económico', category: 'Soda' },
    { id: 'barber-vintage', name: 'Barbería Vintage', category: 'Barbería' },
    { id: 'barber-modern', name: 'Salón Moderno', category: 'Barbería' },
    { id: 'barber-luxury', name: 'Lujo & Estilo', category: 'Barbería' },
    { id: 'beauty-spa', name: 'Spa & Relax', category: 'Belleza' },
    { id: 'beauty-nails', name: 'Uñas & Pestañas', category: 'Belleza' },
    { id: 'beauty-glam', name: 'Glamour Total', category: 'Belleza' },
    { id: 'fashion-boutique', name: 'Boutique Elegante', category: 'Tienda de ropa' },
    { id: 'fashion-street', name: 'Streetwear', category: 'Tienda de ropa' },
    { id: 'fashion-kids', name: 'Moda Infantil', category: 'Tienda de ropa' },
    { id: 'hardware-pro', name: 'Ferretería Pro', category: 'Ferretería' },
    { id: 'hardware-home', name: 'Hogar & Construcción', category: 'Ferretería' },
    { id: 'hardware-tools', name: 'Herramientas Expertas', category: 'Ferretería' },
    { id: 'mechanic-auto', name: 'Automotriz General', category: 'Taller mecánico' },
    { id: 'mechanic-moto', name: 'Motos & Racing', category: 'Taller mecánico' },
    { id: 'mechanic-detail', name: 'Detailing & Lavado', category: 'Taller mecánico' },
    { id: 'vet-care', name: 'Cuidado Animal', category: 'Veterinaria' },
    { id: 'vet-petshop', name: 'Petshop & Vet', category: 'Veterinaria' },
    { id: 'vet-clinic', name: 'Clínica Especializada', category: 'Veterinaria' },
    { id: 'gym-crossfit', name: 'CrossFit Box', category: 'Gimnasio' },
    { id: 'gym-yoga', name: 'Yoga & Pilates', category: 'Gimnasio' },
    { id: 'gym-body', name: 'Bodybuilding Gym', category: 'Gimnasio' },
    { id: 'travel-adventure', name: 'Aventura Extrema', category: 'Turismo' },
    { id: 'travel-tours', name: 'Tours Guiados', category: 'Turismo' },
    { id: 'travel-eco', name: 'Ecoturismo', category: 'Turismo' },
    { id: 'hotel-boutique', name: 'Hotel Boutique', category: 'Hotel' },
    { id: 'hotel-resort', name: 'Resort Playero', category: 'Hotel' },
    { id: 'hotel-city', name: 'Hotel de Ciudad', category: 'Hotel' },
    { id: 'pro-lawyer', name: 'Bufete Legal', category: 'Profesional independiente' },
    { id: 'pro-doctor', name: 'Consultorio Médico', category: 'Profesional independiente' },
    { id: 'pro-design', name: 'Estudio de Diseño', category: 'Profesional independiente' },
    { id: 'other-generic', name: 'Negocio General', category: 'Otro' },
    { id: 'other-services', name: 'Servicios Varios', category: 'Otro' },
    { id: 'other-startup', name: 'Startup Tech', category: 'Otro' }
];

// ===== TEMPLATE REGISTRY =====
// Corregido: Se añadieron los principales faltantes para evitar errores "undefined" en producción
const SF_TEMPLATE_REGISTRY = {
    default: { id: 'default', name: 'Moderno', theme: 'theme-modern', accent: '#4f46e5', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80', dark: false },
    'rest-modern-dark': { id: 'rest-modern-dark', name: 'Restaurante Oscuro Moderno', theme: 'theme-midnight', accent: '#d97706', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80', dark: true },
    'rest-classic-light': { id: 'rest-classic-light', name: 'Clásico Luminoso', theme: 'theme-modern', accent: '#c084fc', img: 'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?auto=format&fit=crop&w=1600&q=80', dark: false },
    'rest-fast-food': { id: 'rest-fast-food', name: 'Comida Rápida Vibrante', theme: 'theme-modern', accent: '#ef4444', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1600&q=80', dark: false },
    
    'cafe-minimal': { id: 'cafe-minimal', name: 'Café Minimalista', theme: 'theme-modern', accent: '#92400e', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1600&q=80', dark: false },
    'cafe-rustic': { id: 'cafe-rustic', name: 'Rústico Acogedor', theme: 'theme-modern', accent: '#b45309', img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=80', dark: false },
    'cafe-urban': { id: 'cafe-urban', name: 'Urbano Industrial', theme: 'theme-midnight', accent: '#64748b', img: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1600&q=80', dark: true },
    
    'bakery-warm': { id: 'bakery-warm', name: 'Panadería Cálida', theme: 'theme-modern', accent: '#f59e0b', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1600&q=80', dark: false },
    
    'soda-tico': { id: 'soda-tico', name: 'Soda Típica', theme: 'theme-modern', accent: '#16a34a', img: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80', dark: false },
    
    'barber-vintage': { id: 'barber-vintage', name: 'Barbería Vintage', theme: 'theme-garage', accent: '#eab308', img: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1600&q=80', dark: true },
    'barber-modern': { id: 'barber-modern', name: 'Salón Moderno', theme: 'theme-modern', accent: '#38bdf8', img: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1600&q=80', dark: false },
    'barber-luxury': { id: 'barber-luxury', name: 'Lujo & Estilo', theme: 'theme-midnight', accent: '#f43f5e', img: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=1600&q=80', dark: true },
    
    'beauty-spa': { id: 'beauty-spa', name: 'Spa & Relax', theme: 'theme-modern', accent: '#ec4899', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=80', dark: false },
    
    'fashion-boutique': { id: 'fashion-boutique', name: 'Boutique Elegante', theme: 'theme-print', accent: '#db2777', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80', dark: false },
    'fashion-clean': { id: 'fashion-clean', name: 'Moda Limpia', theme: 'theme-print', accent: '#db2777', img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=80', dark: false },
    
    'hardware-pro': { id: 'hardware-pro', name: 'Ferretería Pro', theme: 'theme-modern', accent: '#ea580c', img: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=1600&q=80', dark: false },
    
    'mechanic-industrial': { id: 'mechanic-industrial', name: 'Taller Industrial', theme: 'theme-midnight', accent: '#f97316', img: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1600&q=80', dark: true },
    'mechanic-auto': { id: 'mechanic-auto', name: 'Automotriz General', theme: 'theme-modern', accent: '#eab308', img: 'https://images.unsplash.com/photo-1503375837265-5c1cb087612f?auto=format&fit=crop&w=1600&q=80', dark: false },
    
    'vet-care': { id: 'vet-care', name: 'Cuidado Animal', theme: 'theme-modern', accent: '#10b981', img: 'https://images.unsplash.com/photo-1537151608804-ea6f11cc9888?auto=format&fit=crop&w=1600&q=80', dark: false },
    
    'gym-crossfit': { id: 'gym-crossfit', name: 'CrossFit Box', theme: 'theme-midnight', accent: '#ef4444', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=80', dark: true },
    
    'travel-tours': { id: 'travel-tours', name: 'Tours Guiados', theme: 'theme-modern', accent: '#0ea5e9', img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80', dark: false },
    
    'hotel-boutique': { id: 'hotel-boutique', name: 'Hotel Boutique', theme: 'theme-modern', accent: '#6366f1', img: 'https://images.unsplash.com/photo-1566073171639-4d8ef5435a29?auto=format&fit=crop&w=1600&q=80', dark: false },
    
    'pro-lawyer': { id: 'pro-lawyer', name: 'Bufete Legal', theme: 'theme-modern', accent: '#1e293b', img: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=1600&q=80', dark: false },
    
    'other-generic': { id: 'other-generic', name: 'Negocio General', theme: 'theme-modern', accent: '#64748b', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80', dark: false }
};

const SF_TEMPLATE_ALIASES = {
    Midnight: 'rest-modern-dark',
    Tico: 'soda-tico',
    Latte: 'cafe-minimal',
    Garage: 'barber-vintage',
    Print: 'fashion-clean',
    Moderno: 'default'
};

// ===== AI CONTENT FALLBACKS =====
const SF_AI_CONTENT = {
    default: {
        benefits: ['Calidad garantizada', 'Atención personalizada', 'Entrega rápida'],
        faqs: [{ q: '¿Hacen envíos?', a: 'Sí, realizamos envíos a todo el país.' }],
        templates: [SF_TEMPLATE_REGISTRY.default]
    },
    'Restaurante': {
        benefits: ['Ingredientes frescos', 'Recetas tradicionales', 'Ambiente familiar'],
        faqs: [{ q: '¿Tienen opciones vegetarianas?', a: 'Sí, contamos con un menú vegetariano.' }],
        templates: [
            SF_TEMPLATE_REGISTRY['rest-modern-dark'],
            SF_TEMPLATE_REGISTRY['rest-classic-light'],
            SF_TEMPLATE_REGISTRY['rest-fast-food']
        ]
    },
    'Cafetería': {
        benefits: ['Café de especialidad', 'Ambiente para trabajar', 'Pastelería artesanal'],
        faqs: [{ q: '¿Tienen WiFi?', a: 'Sí, WiFi de alta velocidad gratuito.' }],
        templates: [
            SF_TEMPLATE_REGISTRY['cafe-minimal'],
            SF_TEMPLATE_REGISTRY['cafe-rustic'],
            SF_TEMPLATE_REGISTRY['cafe-urban']
        ]
    },
    // Corregido: Agregada Panadería que estaba faltando
    'Panadería': {
        benefits: ['Pan recién horneado', 'Ingredientes de calidad', 'Recetas artesanales'],
        faqs: [{ q: '¿Aceptan encargos especiales?', a: 'Sí, con 24 a 48 horas de anticipación.' }],
        templates: [
            SF_TEMPLATE_REGISTRY['bakery-warm'],
            SF_TEMPLATE_REGISTRY.default
        ]
    },
    'Soda': {
        benefits: ['Comida casera', 'Ingredientes locales', 'Precios accesibles'],
        faqs: [{ q: '¿Aceptan tarjetas?', a: 'Sí, aceptamos tarjetas y SINPE.' }],
        templates: [SF_TEMPLATE_REGISTRY['soda-tico']]
    },
    'Barbería': {
        benefits: ['Cortes clásicos y modernos', 'Perfilado de barba', 'Atención rápida'],
        faqs: [{ q: '¿Necesito cita?', a: 'Recomendamos cita, pero aceptamos walk-ins.' }],
        templates: [
            SF_TEMPLATE_REGISTRY['barber-vintage'],
            SF_TEMPLATE_REGISTRY['barber-modern'],
            SF_TEMPLATE_REGISTRY['barber-luxury']
        ]
    },
    'Belleza': {
        benefits: ['Servicios personalizados', 'Atención premium', 'Resultados profesionales'],
        faqs: [{ q: '¿Atienden con cita?', a: 'Sí, recomendamos agendar por WhatsApp.' }],
        templates: [SF_TEMPLATE_REGISTRY['beauty-spa']]
    },
    'Tienda de ropa': {
        benefits: ['Catálogo actualizado', 'Estilo moderno', 'Envíos disponibles'],
        faqs: [{ q: '¿Tienen tallas?', a: 'Sí, trabajamos varias tallas y modelos.' }],
        templates: [
            SF_TEMPLATE_REGISTRY['fashion-boutique'],
            SF_TEMPLATE_REGISTRY['fashion-clean'],
            SF_TEMPLATE_REGISTRY.default
        ]
    },
    'Ferretería': {
        benefits: ['Productos duraderos', 'Asesoría técnica', 'Precios competitivos'],
        faqs: [{ q: '¿Hacen entregas?', a: 'Sí, entregamos según cobertura.' }],
        templates: [SF_TEMPLATE_REGISTRY['hardware-pro']]
    },
    'Taller mecánico': {
        benefits: ['Servicio confiable', 'Diagnóstico rápido', 'Atención especializada'],
        faqs: [{ q: '¿Atienden motos?', a: 'Sí, también trabajamos motos y vehículos.' }],
        templates: [SF_TEMPLATE_REGISTRY['mechanic-industrial'], SF_TEMPLATE_REGISTRY['mechanic-auto']]
    },
    'Veterinaria': {
        benefits: ['Cuidado animal', 'Atención profesional', 'Servicios completos'],
        faqs: [{ q: '¿Atienden emergencias?', a: 'Depende del horario. Escríbenos por WhatsApp.' }],
        templates: [SF_TEMPLATE_REGISTRY['vet-care']]
    },
    'Gimnasio': {
        benefits: ['Entrenamiento guiado', 'Ambiente motivador', 'Planes flexibles'],
        faqs: [{ q: '¿Tienen clases?', a: 'Sí, según disponibilidad y sede.' }],
        templates: [SF_TEMPLATE_REGISTRY['gym-crossfit']]
    },
    'Turismo': {
        benefits: ['Experiencias únicas', 'Rutas seleccionadas', 'Atención segura'],
        faqs: [{ q: '¿Reservas anticipadas?', a: 'Sí, recomendamos reservar con tiempo.' }],
        templates: [SF_TEMPLATE_REGISTRY['travel-tours']]
    },
    'Hotel': {
        benefits: ['Hospedaje cómodo', 'Reservas rápidas', 'Excelente ubicación'],
        faqs: [{ q: '¿Cómo reservo?', a: 'Escríbenos por WhatsApp para disponibilidad.' }],
        templates: [SF_TEMPLATE_REGISTRY['hotel-boutique']]
    },
    'Profesional independiente': {
        benefits: ['Atención personalizada', 'Servicio profesional', 'Contacto directo'],
        faqs: [{ q: '¿Atiendes por cita?', a: 'Sí, coordinamos por WhatsApp.' }],
        templates: [SF_TEMPLATE_REGISTRY['pro-lawyer']]
    },
    'Otro': {
        benefits: ['Servicio profesional garantizado', 'Atención personalizada', 'Calidad premium'],
        faqs: [{ q: '¿Cómo agendar?', a: 'Directamente por WhatsApp.' }],
        templates: [SF_TEMPLATE_REGISTRY['other-generic']]
    },
    'Sublimado': {
        benefits: ['Impresión de alta definición', 'Tintas resistentes al lavado', 'Diseños personalizados'],
        faqs: [{ q: '¿Puedo enviar mi diseño?', a: 'Sí, aceptamos archivos en PNG o AI.' }],
        templates: [
            SF_TEMPLATE_REGISTRY['fashion-clean'],
            SF_TEMPLATE_REGISTRY.default
        ]
    }
};

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
        .replace(/(^-|-$)/g, '')
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
        console.warn(`Sitefly: error en ${fnName}`, err);
    }
    return undefined;
}

function sf_money(amount) {
    const n = Number(amount || 0);
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: DEFAULT_CURRENCY,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(n);
}

function sf_showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-5 right-5 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300 translate-y-0 opacity-100 z-50 ${
        type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-600'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.transform = 'translateY(-100%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function sf_getCategoryContent(category) {
    return SF_AI_CONTENT[category] || SF_AI_CONTENT.default;
}

function sf_getTemplateMeta(templateId, category) {
    const raw = String(templateId || '').trim();
    const alias = SF_TEMPLATE_ALIASES[raw] || raw;

    // Corregido: Asignación de fallbacks a las IDs correctas que ahora sí existen en el registro
    const categoryFallbackMap = {
        'Restaurante': 'rest-modern-dark',
        'Soda': 'soda-tico',
        'Cafetería': 'cafe-minimal',
        'Panadería': 'bakery-warm',
        'Barbería': 'barber-vintage',
        'Belleza': 'beauty-spa',
        'Tienda de ropa': 'fashion-boutique',
        'Ferretería': 'hardware-pro',
        'Taller mecánico': 'mechanic-auto',
        'Veterinaria': 'vet-care',
        'Gimnasio': 'gym-crossfit',
        'Turismo': 'travel-tours',
        'Hotel': 'hotel-boutique',
        'Profesional independiente': 'pro-lawyer',
        'Otro': 'other-generic'
    };

    const key = SF_TEMPLATE_REGISTRY[alias]
        ? alias
        : (categoryFallbackMap[category] || 'default');

    return SF_TEMPLATE_REGISTRY[key] || SF_TEMPLATE_REGISTRY.default;
}

function sf_getTemplateById(templateId) {
    return SF_TEMPLATE_REGISTRY[templateId] || SF_TEMPLATE_REGISTRY.default;
}

function sf_getBusinessSlug() {
    const params = new URLSearchParams(window.location.search);
    return params.get('slug') || params.get('id') || '';
}

// ===== SUPABASE INIT =====
let supabaseClient = null;

try {
    if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabaseClient = supabaseClient;
    } else {
        console.warn('Sitefly: Supabase CDN no cargó.');
    }
} catch (error) {
    console.error('Sitefly: Supabase no pudo inicializarse:', error);
}

// ===== GLOBAL STATE =====
window.sf_state = window.sf_state || {};
Object.assign(window.sf_state, {
    supabase: supabaseClient,
    user: window.sf_state.user || null,
    business: window.sf_state.business || null,
    businessId: window.sf_state.businessId || null,
    view: window.sf_state.view || 'chat',
    chatStep: window.sf_state.chatStep || 1,
    userData: window.sf_state.userData || {
        category: '',
        name: '',
        description: '',
        location: '',
        address: '',
        city: '',
        whatsapp: '',
        hours: 'Lun - Dom: 8:00 AM - 10:00 PM',
        schedule: 'Lun - Dom: 8:00 AM - 10:00 PM',
        logo: '',
        brandColor: '#6366f1',
        template: '',
        template_id: ''
    },
    products: window.sf_state.products || [],
    cart: window.sf_state.cart || [],
    orders: window.sf_state.orders || [],
    currentTemplate: window.sf_state.currentTemplate || 'default',
    adminTab: window.sf_state.adminTab || 'negocio',
    plan: window.sf_state.plan || 'free',
    planExpiresAt: window.sf_state.planExpiresAt || null,
    session: window.sf_state.session || null,
    coupons: window.sf_state.coupons || [],
    pageViews: window.sf_state.pageViews || [],
    analytics: window.sf_state.analytics || {
        today: 0,
        week: 0,
        conversion: 0
    },
    // Corregido: Consolidado para evitar asignación duplicada
    config: {
        categories: [...CATEGORIES],
        templates: [...TEMPLATES]
    }
});

// ===== GLOBAL UTILS =====
window.sf_utils = window.sf_utils || {};
Object.assign(window.sf_utils, {
    generateSlug: sf_slugify,
    showToast: sf_showToast,
    money: sf_money,
    escapeHtml: sf_escapeHtml,
    validateWhatsapp: sf_validWhatsapp,
    getBusinessSlug: sf_getBusinessSlug,
    getTemplateMeta: sf_getTemplateMeta,
    getCategoryContent: sf_getCategoryContent,
    getTemplateById: sf_getTemplateById
});

window.sf_ai_content = window.sf_ai_content || SF_AI_CONTENT;

console.log(`✅ ${APP_NAME} Core Initialized`);
