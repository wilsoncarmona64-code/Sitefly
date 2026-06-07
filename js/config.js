// ===== SUPABASE CONFIGURATION =====
const SUPABASE_URL = 'https://kyvcrzvpqkmfvnlqictl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5dmNyenZwcWttZnZubHFpY3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDAzMjUsImV4cCI6MjA5NTU3NjMyNX0.BppEWjs6MgNzB1KIlnBvDlUjdKaACBnwQemRXybfn14';
let supabaseClient = null;

try {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
                flowType: 'pkce'
            }
        });
    }
} catch (e) { console.log('Supabase init error:', e); }

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

// ===== STATE =====
const sf_state = {
    view: 'login', chatStep: 0, userId: null, businessId: null,
    userData: { category: '', name: '', description: '', location: '', whatsapp: '', hours: 'Lun - Dom: 8:00 AM - 10:00 PM', logo: '', brandColor: '#6366f1' },
    products: [], cart: [], orders: [], adminTab: 'negocio', currentTemplate: 'Midnight',
    plan: 'free', planExpiresAt: null, session: null,
    coupons: [], pageViews: [], analytics: { today: 0, week: 0, conversion: 0 }
};

// ===== POLLING FOR NEW ORDERS =====
let sf_orderPollingInterval = null;
let sf_lastOrderCount = 0;

// ===== AI CONTENT DATABASE =====
const sf_ai_content = {
    'Restaurante': {
        templates: [{ name: 'Midnight', theme: 'theme-midnight', accent: '#d4a574', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80' }],
        benefits: ['Ingredientes 100% frescos', 'Ambiente familiar y acogedor', 'Chef con experiencia internacional'],
        defaultProducts: [{name: 'Plato del Día', price: 8.50, desc: 'Incluye bebida y postre'}, {name: 'Hamburguesa Especial', price: 12.00, desc: 'Con papas fritas y queso'}],
        faqs: [{q: '¿Hacen reservas?', a: 'Sí, aceptamos reservas para grupos.'}, {q: '¿Tienen parqueo?', a: 'Contamos con parqueo privado.'}]
    },
    'Soda': {
        templates: [{ name: 'Tico', theme: 'theme-modern', accent: '#16a34a', img: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80' }],
        benefits: ['Comida casera como la de mamá', 'Refrescos naturales de fruta real', 'Servicio rápido y amable'],
        defaultProducts: [{name: 'Casado Tradicional', price: 5.50, desc: 'Arroz, frijoles, plátano, ensalada'}, {name: 'Refresco Natural', price: 2.00, desc: 'De temporada'}],
        faqs: [{q: '¿Aceptan tarjetas?', a: 'Sí, aceptamos todas las tarjetas y SINPE.'}]
    },
    'Cafetería': {
        templates: [{ name: 'Latte', theme: 'theme-modern', accent: '#92400e', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&q=80' }],
        benefits: ['Café de especialidad 100% arábica', 'Ambiente perfecto para trabajar', 'Pastelería artesanal diaria'],
        defaultProducts: [{name: 'Café Americano', price: 2.50, desc: 'Grano de altura'}, {name: 'Croissant', price: 3.00, desc: 'Horneado diariamente'}],
        faqs: [{q: '¿Tienen WiFi?', a: 'Sí, WiFi de alta velocidad gratuito.'}]
    },
    'Barbería': {
        templates: [{ name: 'Garage', theme: 'theme-garage', accent: '#eab308', img: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&q=80' }],
        benefits: ['Cortes clásicos y modernos', 'Perfilado de barba con toalla caliente', 'Productos de primera calidad'],
        defaultProducts: [{name: 'Corte de Cabello', price: 10.00, desc: 'Estilo clásico o moderno'}, {name: 'Perfilado de Barba', price: 7.00, desc: 'Con toalla caliente'}],
        faqs: [{q: '¿Necesito cita?', a: 'Recomendamos cita, pero aceptamos walk-ins.'}]
    },
    'Sublimado': {
        templates: [{ name: 'Print', theme: 'theme-print', accent: '#6366f1', img: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=1200&q=80' }],
        benefits: ['Impresión de alta definición', 'Tintas resistentes al lavado', 'Diseños 100% personalizados'],
        defaultProducts: [{name: 'Taza Personalizada', price: 8.00, desc: 'Cerámica de alta calidad'}, {name: 'Camiseta Sublimada', price: 12.00, desc: 'Tela dry-fit'}],
        faqs: [{q: '¿Puedo enviar mi diseño?', a: 'Sí, aceptamos archivos en PNG o AI.'}]
    },
    'default': {
        templates: [{ name: 'Moderno', theme: 'theme-modern', accent: '#0f172a', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80' }],
        benefits: ['Servicio profesional garantizado', 'Atención personalizada', 'Calidad premium'],
        defaultProducts: [{name: 'Servicio Básico', price: 20.00, desc: 'Consultar detalles'}, {name: 'Servicio Premium', price: 35.00, desc: 'Incluye garantía'}],
        faqs: [{q: '¿Tiempo de entrega?', a: 'Generalmente 24-48 horas.'}]
    }
};

const allCategories = ['Panadería', 'Belleza', 'Tienda de ropa', 'Ferretería', 'Taller mecánico', 'Profesional independiente', 'Consultorio', 'Veterinaria', 'Gimnasio', 'Hotel', 'Turismo', 'Otro'];
allCategories.forEach(cat => {
    if (!sf_ai_content[cat]) {
        sf_ai_content[cat] = {
            templates: [{ name: 'Premium', theme: 'theme-midnight', accent: '#6366f1', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80' }],
            benefits: ['Servicio profesional garantizado', 'Atención personalizada', 'Calidad premium'],
            defaultProducts: [{name: 'Servicio Principal', price: 25.00, desc: 'Nuestro servicio más solicitado'}],
            faqs: [{q: '¿Cómo agendar?', a: 'Directamente por WhatsApp.'}]
        };
    }
});

// ===== AI CONTENT DATABASE =====
const sf_ai_content = {
    'Restaurante': {
        templates: [{ name: 'Midnight', theme: 'theme-midnight', accent: '#d4a574', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80' }],
        benefits: ['Ingredientes 100% frescos', 'Ambiente familiar y acogedor', 'Chef con experiencia internacional'],
        defaultProducts: [{name: 'Plato del Día', price: 8.50, desc: 'Incluye bebida y postre'}, {name: 'Hamburguesa Especial', price: 12.00, desc: 'Con papas fritas y queso'}],
        faqs: [{q: '¿Hacen reservas?', a: 'Sí, aceptamos reservas para grupos.'}, {q: '¿Tienen parqueo?', a: 'Contamos con parqueo privado.'}]
    },
    'Soda': {
        templates: [{ name: 'Tico', theme: 'theme-modern', accent: '#16a34a', img: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80' }],
        benefits: ['Comida casera como la de mamá', 'Refrescos naturales de fruta real', 'Servicio rápido y amable'],
        defaultProducts: [{name: 'Casado Tradicional', price: 5.50, desc: 'Arroz, frijoles, plátano, ensalada'}, {name: 'Refresco Natural', price: 2.00, desc: 'De temporada'}],
        faqs: [{q: '¿Aceptan tarjetas?', a: 'Sí, aceptamos todas las tarjetas y SINPE.'}]
    },
    'Cafetería': {
        templates: [{ name: 'Latte', theme: 'theme-modern', accent: '#92400e', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&q=80' }],
        benefits: ['Café de especialidad 100% arábica', 'Ambiente perfecto para trabajar', 'Pastelería artesanal diaria'],
        defaultProducts: [{name: 'Café Americano', price: 2.50, desc: 'Grano de altura'}, {name: 'Croissant', price: 3.00, desc: 'Horneado diariamente'}],
        faqs: [{q: '¿Tienen WiFi?', a: 'Sí, WiFi de alta velocidad gratuito.'}]
    },
    'Barbería': {
        templates: [{ name: 'Garage', theme: 'theme-garage', accent: '#eab308', img: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&q=80' }],
        benefits: ['Cortes clásicos y modernos', 'Perfilado de barba con toalla caliente', 'Productos de primera calidad'],
        defaultProducts: [{name: 'Corte de Cabello', price: 10.00, desc: 'Estilo clásico o moderno'}, {name: 'Perfilado de Barba', price: 7.00, desc: 'Con toalla caliente'}],
        faqs: [{q: '¿Necesito cita?', a: 'Recomendamos cita, pero aceptamos walk-ins.'}]
    },
    'Sublimado': {
        templates: [{ name: 'Print', theme: 'theme-print', accent: '#6366f1', img: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=1200&q=80' }],
        benefits: ['Impresión de alta definición', 'Tintas resistentes al lavado', 'Diseños 100% personalizados'],
        defaultProducts: [{name: 'Taza Personalizada', price: 8.00, desc: 'Cerámica de alta calidad'}, {name: 'Camiseta Sublimada', price: 12.00, desc: 'Tela dry-fit'}],
        faqs: [{q: '¿Puedo enviar mi diseño?', a: 'Sí, aceptamos archivos en PNG o AI.'}]
    },
    'default': {
        templates: [{ name: 'Moderno', theme: 'theme-modern', accent: '#0f172a', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80' }],
        benefits: ['Servicio profesional garantizado', 'Atención personalizada', 'Calidad premium'],
        defaultProducts: [{name: 'Servicio Básico', price: 20.00, desc: 'Consultar detalles'}, {name: 'Servicio Premium', price: 35.00, desc: 'Incluye garantía'}],
        faqs: [{q: '¿Tiempo de entrega?', a: 'Generalmente 24-48 horas.'}]
    }
};

const allCategories = ['Panadería', 'Belleza', 'Tienda de ropa', 'Ferretería', 'Taller mecánico', 'Profesional independiente', 'Consultorio', 'Veterinaria', 'Gimnasio', 'Hotel', 'Turismo', 'Otro'];
allCategories.forEach(cat => {
    if (!sf_ai_content[cat]) {
        sf_ai_content[cat] = {
            templates: [{ name: 'Premium', theme: 'theme-midnight', accent: '#6366f1', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80' }],
            benefits: ['Servicio profesional garantizado', 'Atención personalizada', 'Calidad premium'],
            defaultProducts: [{name: 'Servicio Principal', price: 25.00, desc: 'Nuestro servicio más solicitado'}],
            faqs: [{q: '¿Cómo agendar?', a: 'Directamente por WhatsApp.'}]
        };
    }
});
