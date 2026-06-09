<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cargando negocio...</title>

    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">

    <style>
        body {
            font-family: 'Inter', system-ui, sans-serif;
            background-color: #f8fafc;
        }

        .hidden { display: none !important; }

        .product-card {
            background: white;
            border-radius: 1rem;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .product-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        }

        .float-btn {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 50;
            animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes bounce-in {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }

        .modal-backdrop {
            background-color: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(4px);
        }

        .sf-loading {
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top: 3px solid white;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
            display: inline-block;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .sf-toast {
            position: fixed;
            top: 24px;
            left: 50%;
            transform: translateX(-50%) translateY(-100%);
            background: white;
            padding: 12px 24px;
            border-radius: 9999px;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 100;
            transition: all 0.3s ease;
            opacity: 0;
        }

        .sf-toast.show {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }

        .sf-toast-success { border-left: 4px solid #10B981; color: #064E3B; }
        .sf-toast-error { border-left: 4px solid #EF4444; color: #7F1D1D; }

        .animate-slide-up {
            animation: slide-up 0.25s ease-out;
        }

        @keyframes slide-up {
            from { transform: translateY(18px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    </style>
</head>
<body class="text-slate-800 antialiased min-h-screen flex flex-col">

    <!-- Loading View -->
    <div id="loading" class="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
        <div class="sf-loading w-12 h-12 border-indigo-600 border-t-transparent mb-4"></div>
        <p class="text-slate-500 font-medium">Cargando tu experiencia...</p>
    </div>

    <!-- Error View -->
    <div id="error-view" class="hidden fixed inset-0 bg-slate-50 z-50 flex flex-col items-center justify-center p-6 text-center">
        <div class="bg-red-100 p-4 rounded-full mb-4">
            <i data-lucide="alert-circle" class="w-12 h-12 text-red-500"></i>
        </div>
        <h2 class="text-2xl font-bold text-slate-800 mb-2">Negocio no encontrado</h2>
        <p id="error-message" class="text-slate-600 mb-6">Es posible que el enlace sea incorrecto o el negocio haya sido eliminado.</p>
        <a href="index.html" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">
            Volver al inicio
        </a>
    </div>

    <!-- Main Content -->
    <div id="main-content" class="hidden flex-grow">
        <!-- Hero Section -->
        <section id="hero-section" class="relative h-[60vh] min-h-[420px] flex items-end bg-cover bg-center bg-no-repeat">
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>

            <div class="relative z-10 container mx-auto px-6 pb-12 text-white">
                <span id="hero-category" class="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium mb-4 border border-white/30">
                    Categoría
                </span>
                <h1 id="hero-name" class="text-4xl md:text-6xl font-bold mb-4 leading-tight">Nombre del Negocio</h1>
                <p id="hero-description" class="text-lg md:text-xl text-slate-200 max-w-2xl mb-8 line-clamp-3">
                    Descripción del negocio...
                </p>

                <div class="flex flex-wrap gap-4">
                    <a id="hero-whatsapp-btn" href="#" target="_blank" class="hidden flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-green-500/30">
                        <i data-lucide="message-circle" class="w-5 h-5"></i>
                        Contactar por WhatsApp
                    </a>
                    <a href="#products" class="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl font-medium transition-colors border border-white/20">
                        Ver Productos
                    </a>
                </div>
            </div>
        </section>

        <!-- Info Section -->
        <section class="py-16 bg-white">
            <div class="container mx-auto px-6">
                <div class="grid md:grid-cols-2 gap-12">
                    <div>
                        <h2 class="text-3xl font-bold mb-6 text-slate-900">Información</h2>
                        <div class="space-y-6">
                            <div class="flex items-start gap-4">
                                <div class="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                    <i data-lucide="map-pin" class="w-6 h-6"></i>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-slate-900">Ubicación</h3>
                                    <p id="info-location" class="text-slate-600">Cargando...</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-4">
                                <div class="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                    <i data-lucide="clock" class="w-6 h-6"></i>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-slate-900">Horario</h3>
                                    <p id="info-hours" class="text-slate-600">Cargando...</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-4">
                                <div class="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                    <i data-lucide="info" class="w-6 h-6"></i>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-slate-900">Descripción</h3>
                                    <p id="info-description" class="text-slate-600">Cargando...</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-8">
                        <div>
                            <h3 class="text-xl font-bold mb-4 text-slate-900">¿Por qué elegirnos?</h3>
                            <div id="info-benefits" class="space-y-3"></div>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold mb-4 text-slate-900">Preguntas Frecuentes</h3>
                            <div id="info-faqs" class="space-y-4 text-sm text-slate-600"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Products Section -->
        <section id="products" class="py-16 bg-slate-50">
            <div class="container mx-auto px-6">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-bold text-slate-900 mb-4">Nuestros Productos</h2>
                    <p class="text-slate-600 max-w-2xl mx-auto">Explora nuestra selección. Haz tu pedido directamente por WhatsApp.</p>
                </div>

                <div id="products-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"></div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
            <div class="container mx-auto px-6 text-center">
                <p id="footer-name" class="mb-4">© 2024 Negocio. Todos los derechos reservados.</p>
                <p class="text-sm">Potenciado por <span class="text-white font-semibold">SiteFly</span></p>
            </div>
        </footer>
    </div>

    <!-- Floating Cart Button -->
    <a id="cart-float" href="#" onclick="openCartModal(); return false;" class="hidden float-btn flex items-center justify-center w-16 h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl shadow-indigo-500/40 transition-all transform hover:scale-110 group">
        <i data-lucide="shopping-cart" class="w-8 h-8 group-hover:rotate-12 transition-transform"></i>
        <span id="cart-count" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">0</span>
    </a>

    <!-- WhatsApp Float -->
    <a id="whatsapp-float" href="#" target="_blank" class="hidden float-btn flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl shadow-green-500/40 transition-all transform hover:scale-110" style="right: 24px; bottom: 100px;">
        <i data-lucide="message-circle" class="w-7 h-7"></i>
    </a>

    <!-- Cart Modal -->
    <div id="cart-modal" class="hidden fixed inset-0 z-[60] flex items-end sm:items-center justify-center modal-backdrop p-0 sm:p-4" onclick="if(event.target === this) closeCartModal();">
        <div class="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-slide-up">

            <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
                <h3 class="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <i data-lucide="shopping-bag" class="w-6 h-6 text-indigo-600"></i>
                    Tu Pedido
                </h3>
                <button onclick="closeCartModal()" class="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>

            <div id="cart-items" class="flex-1 overflow-y-auto p-6 space-y-4"></div>

            <div class="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl space-y-4">
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span id="cart-subtotal">$0.00</span>
                    </div>
                    <div class="flex justify-between text-slate-600">
                        <span>Envío</span>
                        <span id="cart-shipping">Gratis</span>
                    </div>
                    <div class="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                        <span>Total</span>
                        <span id="cart-modal-total">$0.00</span>
                    </div>
                </div>

                <form id="checkout-form" onsubmit="submitOrder(event)" class="space-y-3">
                    <input type="text" id="cart-name" placeholder="Tu nombre completo" required class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all">
                    <input type="tel" id="cart-phone" placeholder="Tu teléfono" required class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all">
                    <textarea id="cart-address" placeholder="Dirección de entrega detallada" required rows="2" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all resize-none"></textarea>

                    <button type="submit" id="cart-submit-btn" class="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-2">
                        <i data-lucide="send" class="w-5 h-5"></i>
                        Enviar pedido por WhatsApp
                    </button>
                </form>
            </div>
        </div>
    </div>

    <script src="js/config.js"></script>

    <script>
        // ===== FALLBACK CONTENT / TEMPLATES =====
        const SF_TEMPLATE_REGISTRY = {
            default: {
                id: 'default',
                label: 'Moderno',
                accent: '#4f46e5',
                heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
                dark: false
            },
            'restaurant-modern-dark': {
                id: 'restaurant-modern-dark',
                label: 'Restaurante Oscuro Moderno',
                accent: '#d97706',
                heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
                dark: true
            },
            'rest-modern-dark': {
                id: 'rest-modern-dark',
                label: 'Restaurante Oscuro Moderno',
                accent: '#d97706',
                heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
                dark: true
            },
            'cafe-minimal': {
                id: 'cafe-minimal',
                label: 'Café Minimalista',
                accent: '#92400e',
                heroImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1600&q=80',
                dark: false
            },
            'soda-tico': {
                id: 'soda-tico',
                label: 'Soda Típica',
                accent: '#16a34a',
                heroImage: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80',
                dark: false
            },
            'barber-vintage': {
                id: 'barber-vintage',
                label: 'Barbería Vintage',
                accent: '#eab308',
                heroImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1600&q=80',
                dark: true
            },
            'barber-premium': {
                id: 'barber-premium',
                label: 'Barbería Premium',
                accent: '#ef4444',
                heroImage: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1600&q=80',
                dark: true
            },
            'fashion-clean': {
                id: 'fashion-clean',
                label: 'Moda Limpia',
                accent: '#db2777',
                heroImage: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=80',
                dark: false
            },
            'fashion-boutique': {
                id: 'fashion-boutique',
                label: 'Boutique Elegante',
                accent: '#db2777',
                heroImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80',
                dark: false
            },
            'mechanic-industrial': {
                id: 'mechanic-industrial',
                label: 'Taller Industrial',
                accent: '#f97316',
                heroImage: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1600&q=80',
                dark: true
            }
        };

        const SF_TEMPLATE_ALIASES = {
            Midnight: 'restaurant-modern-dark',
            Tico: 'soda-tico',
            Latte: 'cafe-minimal',
            Garage: 'barber-vintage',
            Print: 'fashion-clean',
            Moderno: 'default'
        };

        const SF_CATEGORY_FALLBACKS = {
            default: {
                benefits: ['Calidad garantizada', 'Atención personalizada', 'Entrega rápida'],
                faqs: [{ q: '¿Hacen envíos?', a: 'Sí, realizamos envíos a todo el país.' }]
            },
            'Restaurante': {
                benefits: ['Ingredientes frescos', 'Recetas tradicionales', 'Ambiente familiar'],
                faqs: [{ q: '¿Tienen opciones vegetarianas?', a: 'Sí, contamos con un menú vegetariano.' }]
            },
            'Cafetería': {
                benefits: ['Café de especialidad', 'Ambiente perfecto para trabajar', 'Pastelería artesanal'],
                faqs: [{ q: '¿Tienen WiFi?', a: 'Sí, WiFi de alta velocidad gratuito.' }]
            },
            'Barbería': {
                benefits: ['Cortes clásicos y modernos', 'Perfilado de barba', 'Atención rápida'],
                faqs: [{ q: '¿Necesito cita?', a: 'Recomendamos cita, pero aceptamos walk-ins.' }]
            },
            'Soda': {
                benefits: ['Comida casera', 'Ingredientes locales', 'Precios accesibles'],
                faqs: [{ q: '¿Aceptan tarjetas?', a: 'Sí, aceptamos tarjetas y SINPE.' }]
            }
        };

        const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80';

        // ===== HELPERS =====
        function escapeHtml(str) {
            return String(str ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function validateWhatsapp(value) {
            const digits = String(value ?? '').replace(/\D/g, '');
            return digits.length >= 8 ? digits : '';
        }

        function money(value) {
            const amount = Number(value || 0);
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        }

        function showToast(message, type = 'info') {
            if (window.sf_utils && typeof window.sf_utils.showToast === 'function') {
                return window.sf_utils.showToast(message, type);
            }

            const toast = document.createElement('div');
            toast.className = `sf-toast sf-toast-${type}`;
            toast.innerHTML = `
                <span>${escapeHtml(message)}</span>
            `;
            document.body.appendChild(toast);

            requestAnimationFrame(() => toast.classList.add('show'));

            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 2500);
        }

        function getBusinessSlug() {
            const params = new URLSearchParams(window.location.search);
            return params.get('slug') || params.get('id') || '';
        }

        function getTemplateMeta(templateId, category) {
            const raw = String(templateId || '').trim();
            const alias = SF_TEMPLATE_ALIASES[raw] || raw;
            const categoryFallbackMap = {
                'Restaurante': 'restaurant-modern-dark',
                'Soda': 'soda-tico',
                'Cafetería': 'cafe-minimal',
                'Panadería': 'default',
                'Barbería': 'barber-premium',
                'Belleza': 'default',
                'Tienda de ropa': 'fashion-clean',
                'Ferretería': 'default',
                'Taller mecánico': 'mechanic-industrial',
                'Veterinaria': 'default',
                'Gimnasio': 'default',
                'Turismo': 'default',
                'Hotel': 'default',
                'Profesional independiente': 'default',
                'Otro': 'default'
            };

            const key = SF_TEMPLATE_REGISTRY[alias]
                ? alias
                : categoryFallbackMap[category] || 'default';

            return SF_TEMPLATE_REGISTRY[key] || SF_TEMPLATE_REGISTRY.default;
        }

        function getCategoryContent(category) {
            return SF_CATEGORY_FALLBACKS[category] || SF_CATEGORY_FALLBACKS.default;
        }

        // ===== STATE =====
        let businessData = null;
        let products = [];
        let cart = [];
        let currentTemplateMeta = SF_TEMPLATE_REGISTRY.default;
        let currentWaLink = '';

        const supabaseClient = window.supabaseClient || null;

        // ===== INIT =====
        document.addEventListener('DOMContentLoaded', initBusinessPage);
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeCartModal();
        });

        async function initBusinessPage() {
            const businessKey = getBusinessSlug();

            if (!businessKey) {
                showError('No se encontró el negocio en la URL.');
                return;
            }

            try {
                if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                    showError('Supabase no está disponible.');
                    return;
                }

                let business = null;

                const slugResult = await supabaseClient
                    .from('businesses')
                    .select('*')
                    .eq('slug', businessKey)
                    .maybeSingle();

                if (slugResult?.data) {
                    business = slugResult.data;
                } else {
                    const idResult = await supabaseClient
                        .from('businesses')
                        .select('*')
                        .eq('id', businessKey)
                        .maybeSingle();

                    if (idResult?.data) business = idResult.data;
                }

                if (!business) {
                    showError('No encontramos ese negocio.');
                    return;
                }

                businessData = business;
                currentTemplateMeta = getTemplateMeta(businessData.template_id, businessData.category);

                const productsResult = await supabaseClient
                    .from('products')
                    .select('*')
                    .eq('business_id', businessData.id)
                    .eq('active', true)
                    .order('created_at', { ascending: false });

                products = Array.isArray(productsResult?.data) ? productsResult.data : [];
                window.sf_state = window.sf_state || {};
                window.sf_state.businessId = businessData.id;
                window.sf_state.products = products;
                window.sf_state.cart = cart;

                renderPage();

                document.getElementById('loading').classList.add('hidden');
                document.getElementById('main-content').classList.remove('hidden');

                if (typeof lucide !== 'undefined') lucide.createIcons();
            } catch (error) {
                console.error('Error initializing page:', error);
                showError('Error cargando el negocio.');
            }
        }

        function showError(message) {
            document.getElementById('error-message').textContent = message || 'Es posible que el enlace sea incorrecto o el negocio haya sido eliminado.';
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('error-view').classList.remove('hidden');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        function renderPage() {
            if (!businessData) return;

            const categoryContent = getCategoryContent(businessData.category);
            const accent = businessData.brand_color || currentTemplateMeta.accent || '#4f46e5';
            const isDark = !!currentTemplateMeta.dark;

            document.title = `${businessData.name || 'Negocio'} | SiteFly`;

            document.getElementById('hero-category').textContent = businessData.category || 'Negocio Local';
            document.getElementById('hero-name').textContent = businessData.name || 'Mi Negocio';
            document.getElementById('hero-description').textContent = businessData.description || 'Negocio creado con SiteFly.';

            document.getElementById('info-description').textContent = businessData.description || 'Sin descripción aún.';
            document.getElementById('info-location').textContent = businessData.city || businessData.address || 'Ubicación no especificada';
            document.getElementById('info-hours').textContent = businessData.schedule || businessData.hours || 'Horario no especificado';

            const benefitsHtml = (categoryContent.benefits || []).map(b =>
                `<div class="flex items-center gap-3">
                    <i data-lucide="check-circle" class="w-5 h-5 text-green-500 flex-shrink-0"></i>
                    <span>${escapeHtml(b)}</span>
                </div>`
            ).join('');
            document.getElementById('info-benefits').innerHTML = benefitsHtml;

            const faqsHtml = (categoryContent.faqs || []).map(f =>
                `<div class="bg-slate-50 p-4 rounded-xl">
                    <h4 class="font-semibold mb-1 text-slate-900">${escapeHtml(f.q)}</h4>
                    <p class="text-sm text-slate-600">${escapeHtml(f.a)}</p>
                </div>`
            ).join('');
            document.getElementById('info-faqs').innerHTML = faqsHtml || '<p class="text-slate-600">No hay preguntas frecuentes registradas.</p>';

            document.getElementById('footer-name').textContent = `© ${new Date().getFullYear()} ${businessData.name || 'Mi Negocio'}. Todos los derechos reservados.`;

            const wa = validateWhatsapp(businessData.whatsapp);
            if (wa) {
                currentWaLink = `https://wa.me/${wa}`;
                const heroBtn = document.getElementById('hero-whatsapp-btn');
                const floatBtn = document.getElementById('whatsapp-float');
                heroBtn.href = currentWaLink;
                floatBtn.href = currentWaLink;
                heroBtn.classList.remove('hidden');
                floatBtn.classList.remove('hidden');
            } else {
                currentWaLink = '';
                document.getElementById('hero-whatsapp-btn').classList.add('hidden');
                document.getElementById('whatsapp-float').classList.add('hidden');
            }

            const heroImage = currentTemplateMeta.heroImage || DEFAULT_PRODUCT_IMAGE;
            const heroSection = document.getElementById('hero-section');
            heroSection.style.backgroundImage = `url('${heroImage}')`;
            heroSection.style.backgroundColor = isDark ? '#0f172a' : '#ffffff';

            const mainContent = document.getElementById('main-content');
            mainContent.style.backgroundColor = isDark ? '#f8fafc' : '#ffffff';

            renderProducts();

            // Accent-like tweaks for the floating elements
            document.getElementById('hero-whatsapp-btn').style.backgroundColor = accent;
            document.getElementById('cart-float').style.backgroundColor = accent;
            document.getElementById('hero-whatsapp-btn').style.boxShadow = `0 10px 25px -10px ${accent}55`;
            document.getElementById('cart-float').style.boxShadow = `0 10px 25px -10px ${accent}55`;

            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        function renderProducts() {
            const container = document.getElementById('products-grid');

            if (!Array.isArray(products) || products.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <p class="text-slate-500 text-lg">No hay productos disponibles aún.</p>
                        <p class="text-slate-400 text-sm mt-2">Contacta al negocio para más información.</p>
                    </div>`;
                updateCartUI();
                return;
            }

            container.innerHTML = products.map((p) => `
                <div class="product-card flex flex-col h-full">
                    <div class="h-48 bg-slate-200 relative overflow-hidden group">
                        ${
                            p.image_url
                                ? `<img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.name)}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">`
                                : `<div class="w-full h-full flex items-center justify-center text-slate-400"><i data-lucide="package" class="w-12 h-12"></i></div>`
                        }
                    </div>
                    <div class="p-4 flex flex-col flex-grow">
                        <h3 class="font-bold text-lg mb-1 text-slate-900">${escapeHtml(p.name)}</h3>
                        <p class="text-sm text-slate-600 mb-4 line-clamp-2 flex-grow">${escapeHtml(p.description || '')}</p>
                        <div class="flex items-center justify-between mt-auto">
                            <span class="text-xl font-bold text-indigo-600">${money(p.price)}</span>
                            <button onclick="addToCart(${JSON.stringify(String(p.id))})" class="text-sm font-medium px-4 py-2 rounded-lg bg-slate-900 hover:bg-indigo-600 text-white transition-colors flex items-center gap-2 shadow-md">
                                <i data-lucide="plus" class="w-4 h-4"></i> Agregar
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        // ===== CART FUNCTIONS =====
        function addToCart(productId) {
            const product = products.find(p => String(p.id) === String(productId));
            if (!product) return;

            const existingItem = cart.find(item => String(item.id) === String(productId));
            if (existingItem) {
                existingItem.qty += 1;
            } else {
                cart.push({ ...product, qty: 1 });
            }

            window.sf_state.cart = cart;
            updateCartUI();
            renderCartItems();
            showToast('Producto agregado al carrito', 'success');
        }

        function changeQty(productId, delta) {
            const item = cart.find(x => String(x.id) === String(productId));
            if (!item) return;

            item.qty += delta;
            if (item.qty <= 0) {
                cart = cart.filter(x => String(x.id) !== String(productId));
            }

            window.sf_state.cart = cart;
            updateCartUI();
            renderCartItems();
        }

        function removeFromCart(productId) {
            cart = cart.filter(item => String(item.id) !== String(productId));
            window.sf_state.cart = cart;
            updateCartUI();
            renderCartItems();
        }

        function getCartTotal() {
            return cart.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 0)), 0);
        }

        function updateCartUI() {
            const totalItems = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
            document.getElementById('cart-count').textContent = String(totalItems);

            const cartFloat = document.getElementById('cart-float');
            if (totalItems > 0) {
                cartFloat.classList.remove('hidden');
            } else {
                cartFloat.classList.add('hidden');
            }
        }

        function openCartModal() {
            renderCartItems();
            document.getElementById('cart-modal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeCartModal() {
            document.getElementById('cart-modal').classList.add('hidden');
            document.body.style.overflow = '';
        }

        function renderCartItems() {
            const container = document.getElementById('cart-items');
            const subtotal = getCartTotal();
            const shipping = 0;
            const total = subtotal + shipping;

            document.getElementById('cart-subtotal').textContent = money(subtotal);
            document.getElementById('cart-shipping').textContent = 'Gratis';
            document.getElementById('cart-modal-total').textContent = money(total);

            if (cart.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8">
                        <i data-lucide="shopping-cart" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
                        <p class="text-slate-500">Tu carrito está vacío.</p>
                    </div>`;
            } else {
                container.innerHTML = cart.map(item => `
                    <div class="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                        <div class="flex-1 pr-3">
                            <p class="font-medium text-slate-900">${escapeHtml(item.name)}</p>
                            <p class="text-xs text-slate-500">${money(item.price)} x ${item.qty}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <button type="button" onclick="changeQty(${JSON.stringify(String(item.id))}, -1)" class="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                                <i data-lucide="minus" class="w-4 h-4"></i>
                            </button>
                            <span class="w-6 text-center font-semibold">${item.qty}</span>
                            <button type="button" onclick="changeQty(${JSON.stringify(String(item.id))}, 1)" class="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                                <i data-lucide="plus" class="w-4 h-4"></i>
                            </button>
                            <button type="button" onclick="removeFromCart(${JSON.stringify(String(item.id))})" class="text-slate-400 hover:text-red-500 transition-colors p-1 ml-1">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            }

            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        function buildWhatsAppMessage(customer) {
            const subtotal = getCartTotal();
            const shipping = 0;
            const total = subtotal + shipping;

            let message = `🛒 *NUEVO PEDIDO — ${businessData.name}*%0A%0A`;
            message += `📦 *Productos:*%0A`;
            cart.forEach(item => {
                message += `• ${item.qty}x ${item.name} — ${money(Number(item.price) * Number(item.qty))}%0A`;
            });

            message += `%0A💰 *Subtotal:* ${money(subtotal)}%0A`;
            message += `🚚 *Envío:* Gratis%0A`;
            message += `💵 *TOTAL:* ${money(total)}%0A%0A`;
            message += `👤 *Cliente:*%0A`;
            message += `Nombre: ${customer.name}%0A`;
            message += `Teléfono: ${customer.phone}%0A`;
            message += `Dirección: ${customer.address}`;

            return message;
        }

        async function submitOrder(e) {
            e.preventDefault();

            const name = document.getElementById('cart-name').value.trim();
            const phone = document.getElementById('cart-phone').value.trim();
            const address = document.getElementById('cart-address').value.trim();

            if (!name || !phone || !address) {
                showToast('Por favor completa todos los campos requeridos', 'error');
                return;
            }

            if (cart.length === 0) {
                showToast('Tu carrito está vacío', 'error');
                return;
            }

            const normalizedBusinessPhone = validateWhatsapp(businessData.whatsapp);
            if (!normalizedBusinessPhone) {
                showToast('El negocio no tiene WhatsApp configurado', 'error');
                return;
            }

            const btn = document.getElementById('cart-submit-btn');
            const originalContent = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<div class="sf-loading"></div> Procesando...';

            const subtotal = getCartTotal();
            const shipping = 0;
            const total = subtotal + shipping;

            if (supabaseClient && businessData?.id) {
                const orderData = {
                    business_id: businessData.id,
                    customer_name: name,
                    customer_phone: phone,
                    customer_address: address,
                    subtotal: subtotal,
                    total: total
                };

                try {
                    const { data: savedOrder, error } = await supabaseClient
                        .from('orders')
                        .insert(orderData)
                        .select()
                        .single();

                    if (error) throw error;

                    if (savedOrder?.id) {
                        const orderItems = cart.map(item => ({
                            order_id: savedOrder.id,
                            product_id: item.id,
                            quantity: item.qty,
                            price: Number(item.price || 0)
                        }));

                        const { error: itemsError } = await supabaseClient
                            .from('order_items')
                            .insert(orderItems);

                        if (itemsError) {
                            console.warn('No se pudieron guardar todos los items del pedido:', itemsError);
                        }
                    }
                } catch (dbError) {
                    console.warn('Error guardando orden en DB, continuando con WhatsApp:', dbError);
                }
            }

            const customer = { name, phone, address };
            const message = buildWhatsAppMessage(customer);
            const encodedMessage = encodeURIComponent(message);
            const waLink = `https://wa.me/${normalizedBusinessPhone}?text=${encodedMessage}`;

            try {
                window.open(waLink, '_blank', 'noopener,noreferrer');
                showToast('Tu pedido fue preparado', 'success');
                cart = [];
                window.sf_state.cart = cart;
                updateCartUI();
                renderCartItems();
                document.getElementById('checkout-form').reset();
                closeCartModal();
            } catch (err) {
                console.error(err);
                showToast('No se pudo abrir WhatsApp', 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalContent;
            }
        }

        // ===== SAFE FALLBACKS =====
        window.addToCart = addToCart;
        window.removeFromCart = removeFromCart;
        window.changeQty = changeQty;
        window.openCartModal = openCartModal;
        window.closeCartModal = closeCartModal;
        window.submitOrder = submitOrder;

        window.validateWhatsapp = validateWhatsapp;
        window.escapeHtml = escapeHtml;

        window.addEventListener('load', () => {
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    </script>
</body>
</html>
