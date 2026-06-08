// ===== SITEFLY CONFIGURATION =====

// Credenciales de Supabase
const SUPABASE_URL = 'https://kyvcrzvpqkmfvnlqictl.supabase.co';
const SUPABASE_ANON_KEY =
  'TU_SUPABASE_ANON_KEY_AQUI';

// Inicializar Supabase de forma segura
let supabaseClient = null;

try {
    if (
        typeof window !== 'undefined' &&
        window.supabase &&
        typeof window.supabase.createClient === 'function'
    ) {
        supabaseClient = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );

        console.log('✅ Supabase conectado correctamente');
    } else {
        console.error('❌ El CDN de Supabase no se cargó.');
    }
} catch (error) {
    console.error('❌ Error inicializando Supabase:', error);
}

// Estado global
window.sf_state = {
    supabase: supabaseClient,
    user: null,
    business: null,
    onboarding: {
        step: 0,
        answers: {},
        sessionToken: null
    },
    config: {
        categories: CATEGORIES,
        templates: TEMPLATES
    }
};

// 2. Definición de Categorías y Plantillas (SiteFly 2.0)
const CATEGORIES = [
    "Restaurante", "Cafetería", "Panadería", "Soda", "Barbería", 
    "Belleza", "Tienda de ropa", "Ferretería", "Taller mecánico", "Veterinaria", 
    "Gimnasio", "Turismo", "Hotel", "Profesional independiente", "Otro"
];

const TEMPLATES = [
    // Restaurante (3)
    { id: "rest-modern-dark", name: "Restaurante Oscuro Moderno", category: "Restaurante" },
    { id: "rest-classic-light", name: "Clásico Luminoso", category: "Restaurante" },
    { id: "rest-fast-food", name: "Comida Rápida Vibrante", category: "Restaurante" },
    // Cafetería (3)
    { id: "cafe-minimal", name: "Café Minimalista", category: "Cafetería" },
    { id: "cafe-rustic", name: "Rústico Acogedor", category: "Cafetería" },
    { id: "cafe-urban", name: "Urbano Industrial", category: "Cafetería" },
    // Panadería (3)
    { id: "bakery-warm", name: "Panadería Cálida", category: "Panadería" },
    { id: "bakery-french", name: "Estilo Francés", category: "Panadería" },
    { id: "bakery-sweet", name: "Dulces y Pasteles", category: "Panadería" },
    // Soda (3)
    { id: "soda-tico", name: "Soda Típica", category: "Soda" },
    { id: "soda-grill", name: "Grill & Bar", category: "Soda" },
    { id: "soda-family", name: "Familiar Económico", category: "Soda" },
    // Barbería (3)
    { id: "barber-vintage", name: "Barbería Vintage", category: "Barbería" },
    { id: "barber-modern", name: "Salón Moderno", category: "Barbería" },
    { id: "barber-luxury", name: "Lujo & Estilo", category: "Barbería" },
    // Belleza (3)
    { id: "beauty-spa", name: "Spa & Relax", category: "Belleza" },
    { id: "beauty-nails", name: "Uñas & Pestañas", category: "Belleza" },
    { id: "beauty-glam", name: "Glamour Total", category: "Belleza" },
    // Ropa (3)
    { id: "fashion-boutique", name: "Boutique Elegante", category: "Tienda de ropa" },
    { id: "fashion-street", name: "Streetwear", category: "Tienda de ropa" },
    { id: "fashion-kids", name: "Moda Infantil", category: "Tienda de ropa" },
    // Ferretería (3)
    { id: "hardware-pro", name: "Ferretería Pro", category: "Ferretería" },
    { id: "hardware-home", name: "Hogar & Construcción", category: "Ferretería" },
    { id: "hardware-tools", name: "Herramientas Expertas", category: "Ferretería" },
    // Taller (3)
    { id: "mechanic-auto", name: "Automotriz General", category: "Taller mecánico" },
    { id: "mechanic-moto", name: "Motos & Racing", category: "Taller mecánico" },
    { id: "mechanic-detail", name: "Detailing & Lavado", category: "Taller mecánico" },
    // Veterinaria (3)
    { id: "vet-care", name: "Cuidado Animal", category: "Veterinaria" },
    { id: "vet-petshop", name: "Petshop & Vet", category: "Veterinaria" },
    { id: "vet-clinic", name: "Clínica Especializada", category: "Veterinaria" },
    // Gimnasio (3)
    { id: "gym-crossfit", name: "CrossFit Box", category: "Gimnasio" },
    { id: "gym-yoga", name: "Yoga & Pilates", category: "Gimnasio" },
    { id: "gym-body", name: "Bodybuilding Gym", category: "Gimnasio" },
    // Turismo (3)
    { id: "travel-adventure", name: "Aventura Extrema", category: "Turismo" },
    { id: "travel-tours", name: "Tours Guiados", category: "Turismo" },
    { id: "travel-eco", name: "Ecoturismo", category: "Turismo" },
    // Hotel (3)
    { id: "hotel-boutique", name: "Hotel Boutique", category: "Hotel" },
    { id: "hotel-resort", name: "Resort Playero", category: "Hotel" },
    { id: "hotel-city", name: "Hotel de Ciudad", category: "Hotel" },
    // Profesional (3)
    { id: "pro-lawyer", name: "Bufete Legal", category: "Profesional independiente" },
    { id: "pro-doctor", name: "Consultorio Médico", category: "Profesional independiente" },
    { id: "pro-design", name: "Estudio de Diseño", category: "Profesional independiente" },
    // Otro (3)
    { id: "other-generic", name: "Negocio General", category: "Otro" },
    { id: "other-services", name: "Servicios Varios", category: "Otro" },
    { id: "other-startup", name: "Startup Tech", category: "Otro" }
];

// 3. Estado Global (Simulado para compatibilidad inmediata sin bundler)
window.sf_state = {
    supabase: supabase,
    user: null,
    business: null,
    onboarding: {
        step: 0,
        answers: {},
        sessionToken: null
    },
    config: {
        categories: CATEGORIES,
        templates: TEMPLATES
    }
};

// Funciones de utilidad globales
window.sf_utils = {
    generateSlug: (text) => {
        return text.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    },
    showToast: (message, type = 'info') => {
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
};

console.log("✅ SiteFly 2.0 Core Initialized");
