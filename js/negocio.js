<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cargando negocio...</title>
    
    <!-- Estilos: Tailwind + Custom -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="styles.css"> <!-- Asegúrate de tener este archivo o usa el CDN abajo -->
    
    <!-- Iconos: Lucide -->
    <script src="https://unpkg.com/lucide@latest"></script>

    <!-- Configuración Tailwind personalizada -->
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#4F46E5',
                        secondary: '#10B981',
                        dark: '#0F172A'
                    }
                }
            }
        }
    </script>

    <style>
        /* Estilos críticos inline para asegurar que funcione sin CSS externo */
        body { font-family: 'Inter', system-ui, sans-serif; background-color: #f8fafc; }
        .hidden { display: none !important; }
        
        /* Product Card */
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

        /* Floating Buttons */
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

        /* Modal Backdrop */
        .modal-backdrop {
            background-color: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(4px);
        }

        /* Loading Spinner */
        .sf-loading {
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top: 3px solid white;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
            display: inline-block;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* Toast Notifications */
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
        .sf-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
        .sf-toast-success { border-left: 4px solid #10B981; color: #064E3B; }
        .sf-toast-error { border-left: 4px solid #EF4444; color: #7F1D1D; }
    </style>
</head>
<body class="text-slate-800 antialiased min-h-screen flex flex-col">

    <!-- Loading View -->
    <div id="loading" class="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
        <div class="sf-loading w-12 h-12 border-primary border-t-transparent mb-4"></div>
        <p class="text-slate-500 font-medium">Cargando tu experiencia...</p>
    </div>

    <!-- Error View -->
    <div id="error-view" class="hidden fixed inset-0 bg-slate-50 z-50 flex flex-col items-center justify-center p-6 text-center">
        <div class="bg-red-100 p-4 rounded-full mb-4">
            <i data-lucide="alert-circle" class="w-12 h-12 text-red-500"></i>
        </div>
        <h2 class="text-2xl font-bold text-slate-800 mb-2">Negocio no encontrado</h2>
        <p class="text-slate-600 mb-6">Es posible que el enlace sea incorrecto o el negocio haya sido eliminado.</p>
        <a href="index.html" class="px-6 py-3 bg-primary hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors">
            Volver al inicio
        </a>
    </div>

    <!-- Main Content -->
    <div id="main-content" class="hidden flex-grow">
        
        <!-- Hero Section -->
        <section id="hero-section" class="relative h-[60vh] min-h-[400px] flex items-end bg-cover bg-center bg-no-repeat">
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
                    <a id="hero-whatsapp-btn" href="#" target="_blank" class="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-green-500/30">
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
                    <!-- Details -->
                    <div>
                        <h2 class="text-3xl font-bold mb-6 text-slate-900">Información</h2>
                        <div class="space-y-6">
                            <div class="flex items-start gap-4">
                                <div class="p-3 bg-indigo-50 rounded-xl text-primary">
                                    <i data-lucide="map-pin" class="w-6 h-6"></i>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-slate-900">Ubicación</h3>
                                    <p id="info-location" class="text-slate-600">Cargando...</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-4">
                                <div class="p-3 bg-indigo-50 rounded-xl text-primary">
                                    <i data-lucide="clock" class="w-6 h-6"></i>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-slate-900">Horario</h3>
                                    <p id="info-hours" class="text-slate-600">Cargando...</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-4">
                                <div class="p-3 bg-indigo-50 rounded-xl text-primary">
                                    <i data-lucide="info" class="w-6 h-6"></i>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-slate-900">Descripción</h3>
                                    <p id="info-description" class="text-slate-600">Cargando...</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Benefits & FAQs -->
                    <div class="space-y-8">
                        <div>
                            <h3 class="text-xl font-bold mb-4 text-slate-900">¿Por qué elegirnos?</h3>
                            <div id="info-benefits" class="space-y-3">
                                <!-- Benefits injected by JS -->
                            </div>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold mb-4 text-slate-900">Preguntas Frecuentes</h3>
                            <div id="info-faqs" class="space-y-4 text-sm text-slate-600">
                                <!-- FAQs injected by JS -->
                            </div>
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
                    <p class="text-slate-600 max-w-2xl mx-auto">Explora nuestra selección exclusiva. Haz tu pedido directamente por WhatsApp.</p>
                </div>
                
                <div id="products-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <!-- Products injected by JS -->
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-dark text-slate-400 py-12 border-t border-slate-800">
            <div class="container mx-auto px-6 text-center">
                <p id="footer-name" class="mb-4">© 2024 Negocio. Todos los derechos reservados.</p>
                <p class="text-sm">Potenciado por <span class="text-white font-semibold">SiteFly</span></p>
            </div>
        </footer>
    </div>

    <!-- Floating Cart Button -->
    <a id="cart-float" href="#" onclick="openCartModal(); return false;" class="hidden float-btn flex items-center justify-center w-16 h-16 bg-primary hover:bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-500/40 transition-all transform hover:scale-110 group">
        <i data-lucide="shopping-cart" class="w-8 h-8 group-hover:rotate-12 transition-transform"></i>
        <span id="cart-count" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">0</span>
    </a>

    <!-- WhatsApp Float -->
    <a id="whatsapp-float" href="#" target="_blank" class="hidden float-btn flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl shadow-green-500/40 transition-all transform hover:scale-110" style="right: 24px; bottom: 100px;">
        <i data-lucide="message-circle" class="w-7 h-7"></i>
    </a>

    <!-- Cart Modal -->
    <div id="cart-modal" class="hidden fixed inset-0 z-[60] flex items-end sm:items-center justify-center modal-backdrop p-0 sm:p-4">
        <div class="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-slide-up">
            
            <!-- Header -->
            <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
                <h3 class="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <i data-lucide="shopping-bag" class="w-6 h-6 text-primary"></i>
                    Tu Pedido
                </h3>
                <button onclick="closeCartModal()" class="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>

            <!-- Items -->
            <div id="cart-items" class="flex-1 overflow-y-auto p-6 space-y-4">
                <!-- Cart items injected here -->
            </div>

            <!-- Footer / Checkout -->
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
                    <input type="text" id="cart-name" placeholder="Tu nombre completo" required class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                    <input type="tel" id="cart-phone" placeholder="Tu teléfono" required class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                    <textarea id="cart-address" placeholder="Dirección de entrega detallada" required rows="2" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"></textarea>
                    
                    <button type="submit" id="cart-submit-btn" class="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-2">
                        <i data-lucide="send" class="w-5 h-5"></i>
                        Enviar pedido por WhatsApp
                    </button>
                </form>
            </div>
        </div>
    </div>

    <!-- Scripts: Config + Logic -->
    <!-- Asegúrate de que config.js se cargue ANTES de la lógica de negocio -->
    <script src="js/config.js"></script> 
    
    <!-- Datos simulados de IA para beneficios/FAQs si no hay DB específica -->
    <script>
        const sf_ai_content = {
            'default': {
                benefits: ['Calidad garantizada', 'Atención personalizada', 'Entrega rápida'],
                faqs: [{q: '¿Hacen envíos?', a: 'Sí, realizamos envíos a todo el país.'}],
                templates: [{img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80'}]
            },
            'Restaurante': {
                benefits: ['Ingredientes frescos', 'Recetas tradicionales', 'Ambiente familiar'],
                faqs: [{q: '¿Tienen opciones vegetarianas?', a: 'Sí, contamos con un menú especial vegetariano.'}],
                templates: [{img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80'}]
            },
            // Agrega más categorías según necesites
        };
    </script>

    <!-- Lógica Principal Corregida -->
    <script>
        // ===== BUSINESS PAGE LOGIC =====
        let businessData = null;
        let products = [];
        let cart = [];

        // Get business slug from URL
        function getBusinessSlug() {
            const params = new URLSearchParams(window.location.search);
            return params.get('slug') || params.get('id');
        }

        // Initialize page
        async function initBusinessPage() {
            // Verificar si supabaseClient está disponible
            if (typeof supabaseClient === 'undefined') {
                console.error('Error: supabaseClient no definido. Revisa js/config.js');
                showError();
                return;
            }

            const businessId = getBusinessSlug();
            
            if (!businessId) {
                showError();
                return;
            }

            try {
                // Load business data - try slug first, then id
                let { data: business, error: bizError } = await supabaseClient
                    .from('businesses')
                    .select('*')
                    .eq('slug', businessId)
                    .single();

                // If not found by slug, try by id
                if (bizError || !business) {
                    const result = await supabaseClient
                        .from('businesses')
                        .select('*')
                        .eq('id', businessId)
                        .single();
                    business = result.data;
                    bizError = result.error;
                }

                if (bizError || !business) {
                    console.error('Error loading business:', bizError);
                    showError();
                    return;
                }

                businessData = business;
                document.title = businessData.name || 'Negocio';

                // Load products
                const { data: productsData, error: prodError } = await supabaseClient
                    .from('products')
                    .select('*')
                    .eq('business_id', businessData.id) // Usar el ID real del negocio
                    .eq('active', true) // Solo productos activos
                    .order('created_at', { ascending: false });

                if (!prodError && productsData) {
                    products = productsData;
                }

                // Render page
                renderPage();
                
                // Hide loading, show content
                document.getElementById('loading').classList.add('hidden');
                document.getElementById('main-content').classList.remove('hidden');
                
                // Initialize icons
                if (typeof lucide !== 'undefined') lucide.createIcons();

            } catch (error) {
                console.error('Error initializing page:', error);
                showError();
            }
        }

        function showError() {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('error-view').classList.remove('hidden');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        function renderPage() {
            if (!businessData) return;

            // Hero section
            document.getElementById('hero-category').textContent = businessData.category || 'Negocio Local';
            document.getElementById('hero-name').textContent = businessData.name || 'Mi Negocio';
            document.getElementById('hero-description').textContent = businessData.description || '';
            
            // Info section
            document.getElementById('info-description').textContent = businessData.description || '';
            document.getElementById('info-location').textContent = businessData.city || businessData.address || 'Ubicación no especificada';
            document.getElementById('info-hours').textContent = businessData.schedule || businessData.hours || 'Horario no especificado';
            
            // Benefits (using default based on category)
            const categoryContent = sf_ai_content[businessData.category] || sf_ai_content['default'];
            const benefitsHtml = (categoryContent.benefits || []).map(b => 
                `<div class="flex items-center gap-3"><i data-lucide="check-circle" class="w-5 h-5 text-green-500 flex-shrink-0"></i><span>${escapeHtml(b)}</span></div>`
            ).join('');
            document.getElementById('info-benefits').innerHTML = benefitsHtml;

            // FAQs
            const faqsHtml = (categoryContent.faqs || []).map(f => 
                `<div class="bg-slate-50 p-4 rounded-xl"><h4 class="font-semibold mb-1 text-slate-900">${escapeHtml(f.q)}</h4><p class="text-sm text-slate-600">${escapeHtml(f.a)}</p></div>`
            ).join('');
            document.getElementById('info-faqs').innerHTML = faqsHtml || '<p class="text-slate-600">No hay preguntas frecuentes registradas.</p>';

            // Footer
            document.getElementById('footer-name').textContent = `© ${new Date().getFullYear()} ${businessData.name || 'Mi Negocio'}. Todos los derechos reservados.`;

            // Products
            renderProducts();

            // WhatsApp buttons - CORRECCIÓN CRÍTICA DE URL
            const whatsapp = validateWhatsapp(businessData.whatsapp);
            if (whatsapp) {
                const waLink = `https://wa.me/${whatsapp}`; // Sin espacio
                const heroBtn = document.getElementById('hero-whatsapp-btn');
                const floatBtn = document.getElementById('whatsapp-float');
                
                heroBtn.href = waLink;
                floatBtn.href = waLink;
                floatBtn.classList.remove('hidden');
                heroBtn.classList.remove('hidden');
            } else {
                document.getElementById('hero-whatsapp-btn').classList.add('hidden');
            }

            // Hero background
            const template = categoryContent.templates?.[0] || sf_ai_content['default'].templates[0];
            if (template && template.img) {
                document.getElementById('hero-section').style.backgroundImage = `url('${template.img}')`;
            }
        }

        function renderProducts() {
            const container = document.getElementById('products-grid');
            
            if (products.length === 0) {
                container.innerHTML = '<div class="col-span-full text-center py-12"><p class="text-slate-500 text-lg">No hay productos disponibles aún.</p><p class="text-slate-400 text-sm mt-2">Contacta al negocio para más información.</p></div>';
                return;
            }

            container.innerHTML = products.map(p => `
                <div class="product-card flex flex-col h-full">
                    <div class="h-48 bg-slate-200 relative overflow-hidden group">
                        ${p.image_url 
                            ? `<img src="${p.image_url}" alt="${p.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">` 
                            : `<div class="w-full h-full flex items-center justify-center text-slate-400"><i data-lucide="package" class="w-12 h-12"></i></div>`
                        }
                    </div>
                    <div class="p-4 flex flex-col flex-grow">
                        <h3 class="font-bold text-lg mb-1 text-slate-900">${escapeHtml(p.name)}</h3>
                        <p class="text-sm text-slate-600 mb-4 line-clamp-2 flex-grow">${escapeHtml(p.description || '')}</p>
                        <div class="flex items-center justify-between mt-auto">
                            <span class="text-xl font-bold text-primary">$${parseFloat(p.price || 0).toFixed(2)}</span>
                            <button onclick="addToCart('${p.id}')" class="text-sm font-medium px-4 py-2 rounded-lg bg-slate-900 hover:bg-primary text-white transition-colors flex items-center gap-2 shadow-md">
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
            const product = products.find(p => p.id == productId);
            if (!product) return;

            const existingItem = cart.find(item => item.id == productId);
            if (existingItem) {
                existingItem.qty += 1;
            } else {
                cart.push({ ...product, qty: 1 });
            }

            updateCartUI();
            showToast('Producto agregado al carrito', 'success');
        }

        function removeFromCart(productId) {
            const index = cart.findIndex(item => item.id == productId);
            if (index === -1) return;

            if (cart[index].qty > 1) {
                cart[index].qty -= 1;
            } else {
                cart.splice(index, 1);
            }

            updateCartUI();
            renderCartItems();
        }

        function getCartTotal() {
            return cart.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.qty), 0);
        }

        function updateCartUI() {
            const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
            
            document.getElementById('cart-count').textContent = totalItems;

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
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        }

        function closeCartModal() {
            document.getElementById('cart-modal').classList.add('hidden');
            document.body.style.overflow = '';
        }

        function renderCartItems() {
            const container = document.getElementById('cart-items');
            const subtotal = getCartTotal();
            const shipping = subtotal > 0 ? 1.50 : 0;
            const total = subtotal + shipping;

            document.getElementById('cart-total') && (document.getElementById('cart-total').textContent = total.toFixed(2));

            if (cart.length === 0) {
                container.innerHTML = '<div class="text-center py-8"><i data-lucide="shopping-cart" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i><p class="text-slate-500">Tu carrito está vacío.</p></div>';
            } else {
                container.innerHTML = cart.map(item => `
                    <div class="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                        <div class="flex-1">
                            <p class="font-medium text-slate-900">${escapeHtml(item.name)}</p>
                            <p class="text-xs text-slate-500">$${parseFloat(item.price || 0).toFixed(2)} x ${item.qty}</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="font-semibold text-primary">$${(parseFloat(item.price || 0) * item.qty).toFixed(2)}</span>
                            <button onclick="removeFromCart('${item.id}')" class="text-slate-400 hover:text-red-500 transition-colors p-1">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            }

            document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
            document.getElementById('cart-shipping').textContent = shipping > 0 ? `$${shipping.toFixed(2)}` : 'Gratis';
            document.getElementById('cart-modal-total').textContent = `$${total.toFixed(2)}`;

            if (typeof lucide !== 'undefined') lucide.createIcons();
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

            const btn = document.getElementById('cart-submit-btn');
            const originalContent = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<div class="sf-loading"></div> Procesando...';

            const subtotal = getCartTotal();
            const shipping = 1.50;
            const total = subtotal + shipping;

            // Intentar guardar en DB si está disponible
            if (typeof supabaseClient !== 'undefined' && businessData) {
                const orderData = {
                    business_id: businessData.id,
                    customer_name: name,
                    customer_phone: phone,
                    customer_address: address,
                    subtotal: subtotal,
                    total: total,
                    status: 'pending',
                    invoice_type: 'normal'
                };

                try {
                    const { data: savedOrder, error } = await supabaseClient
                        .from('orders')
                        .insert(orderData)
                        .select()
                        .single();

                    if (!error && savedOrder) {
                        // Save order items
                        const orderItems = cart.map(item => ({
                            order_id: savedOrder.id,
                            product_id: item.id,
                            product_name: item.name,
                            quantity: item.qty,
                            unit_price: item.price,
                            total_price: item.price * item.qty
                        }));
                        
                        await supabaseClient.from('order_items').insert(orderItems);
                    }
                } catch (dbError) {
                    console.warn('Error guardando orden en DB, continuando con WhatsApp:', dbError);
                }
            }

            // Build WhatsApp message
            let message = `🛒 *NUEVO PEDIDO — ${escapeHtml(businessData.name)}*\n\n`;
            message += `📦 *Productos:*\n`;
            cart.forEach(item => {
                message += `• ${item.qty}x ${item.name} — $${(parseFloat(item.price || 0) * item.qty).toFixed(2)}\n`;
            });
            message += `\n💰 *Subtotal:* $${subtotal.toFixed(2)}\n`;
            message += `🚚 *Envío:* $${shipping.toFixed(2)}\n`;
            message += `💵 *TOTAL:* $${total.toFixed(2)}\n\n`;
            message += `👤 *Cliente:*\n`;
            message += `Nombre: ${name}\n`;
            message += `Teléfono: ${phone}\n`;
            message += `Dirección: ${address}`;

            const whatsapp = validateWhatsapp(businessData.whatsapp);
            if (!whatsapp) {
                showToast('El negocio no tiene WhatsApp configurado', 'error');
                btn.disabled = false;
                btn.innerHTML = originalContent;
                return;
            }

            const encodedMessage = encodeURIComponent(message);
            // CORRECCIÓN: Sin espacios en la URL
            const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodedMessage}`;

            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
                
                // Reset
                cart = [];
                updateCartUI();
                closeCartModal();
                document.getElementById('cart-name').value = '';
                document.getElementById('cart-phone').value = '';
                document.getElementById('cart-address').value = '';
                
                btn.disabled = false;
                btn.innerHTML = originalContent;
                
                showToast('¡Redirigiendo a WhatsApp!', 'success');
            }, 1000);
        }

        // ===== UTILS =====
        function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function validateWhatsapp(number) {
            if (!number) return null;
            const cleaned = number.replace(/[^0-9+]/g, '');
            if (cleaned.startsWith('+')) {
                return cleaned.slice(1);
            }
            return cleaned;
        }

        function showToast(message, type = 'info') {
            // Remove existing toasts
            const existing = document.querySelector('.sf-toast');
            if (existing) existing.remove();

            const toast = document.createElement('div');
            toast.className = `sf-toast sf-toast-${type}`;
            toast.innerHTML = `
                <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}" class="w-5 h-5"></i>
                <span class="font-medium">${escapeHtml(message)}</span>
            `;
            document.body.appendChild(toast);
            
            if (typeof lucide !== 'undefined') lucide.createIcons();

            // Trigger animation
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });

            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // Close modal on backdrop click
        document.getElementById('cart-modal').addEventListener('click', (e) => {
            if (e.target.id === 'cart-modal') closeCartModal();
        });

        // Initialize on load
        document.addEventListener('DOMContentLoaded', initBusinessPage);
    </script>
</body>
</html>
