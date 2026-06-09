<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Panel de Administración - SiteFly</title>

    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">

    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: #0f172a;
            color: white;
        }
        .glass {
            background: rgba(30, 41, 59, 0.72);
            backdrop-filter: blur(10px);
        }
        .tab-active {
            border-bottom: 2px solid #3b82f6;
            color: #3b82f6;
        }
        .card {
            background: rgba(15, 23, 42, 0.65);
            border: 1px solid rgba(55, 65, 81, 0.8);
            border-radius: 1rem;
        }
        .btn-primary {
            background: #2563eb;
            color: white;
        }
        .btn-primary:hover {
            background: #1d4ed8;
        }
        .btn-danger {
            background: rgba(239, 68, 68, 0.9);
            color: white;
        }
        .btn-danger:hover {
            background: rgba(220, 38, 38, 1);
        }
        .input {
            background: #0f172a;
            border: 1px solid #374151;
            color: white;
            outline: none;
        }
        .input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            min-width: 260px;
            max-width: 360px;
            padding: 14px 16px;
            border-radius: 14px;
            box-shadow: 0 12px 30px rgba(0,0,0,.25);
            transform: translateY(-10px);
            opacity: 0;
            transition: all .25s ease;
        }
        .toast.show {
            transform: translateY(0);
            opacity: 1;
        }
        .toast-success { background: #065f46; color: #ecfdf5; }
        .toast-error { background: #7f1d1d; color: #fef2f2; }
        .toast-info { background: #1e3a8a; color: #eff6ff; }
        .modal-backdrop {
            background: rgba(0,0,0,.78);
            backdrop-filter: blur(6px);
        }
    </style>
</head>
<body class="antialiased min-h-screen flex">

    <!-- Sidebar -->
    <aside class="w-64 glass border-r border-gray-800 hidden md:flex flex-col">
        <div class="p-6 border-b border-gray-800">
            <h1 class="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                SiteFly Admin
            </h1>
            <p id="business-name-display" class="text-xs text-gray-400 mt-1">Cargando...</p>
        </div>

        <nav class="flex-1 p-4 space-y-2">
            <button onclick="switchTab('overview')" class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-3 tab-btn tab-active" data-tab="overview">
                <i data-lucide="layout-dashboard"></i> Resumen
            </button>
            <button onclick="switchTab('products')" class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-3 tab-btn" data-tab="products">
                <i data-lucide="package"></i> Productos
            </button>
            <button onclick="switchTab('design')" class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-3 tab-btn" data-tab="design">
                <i data-lucide="palette"></i> Diseño
            </button>
            <button onclick="switchTab('orders')" class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-3 tab-btn" data-tab="orders">
                <i data-lucide="shopping-cart"></i> Pedidos
            </button>
        </nav>

        <div class="p-4 border-t border-gray-800">
            <a id="view-site-btn" href="#" target="_blank" class="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-green-900/20">
                <i data-lucide="external-link" class="w-4 h-4"></i> Ver mi Página
            </a>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-5 md:p-8">
        <!-- Mobile Header -->
        <div class="md:hidden flex items-center justify-between mb-6">
            <div>
                <h1 class="text-xl font-bold">SiteFly Admin</h1>
                <p id="business-name-display-mobile" class="text-xs text-gray-400">Cargando...</p>
            </div>
            <a id="view-site-btn-mobile" href="#" target="_blank" class="bg-green-600 p-2 rounded-lg">
                <i data-lucide="external-link" class="w-5 h-5"></i>
            </a>
        </div>

        <!-- STATUS BAR -->
        <div id="admin-status" class="hidden mb-6 p-4 rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-100">
            <div class="flex items-center gap-2">
                <i data-lucide="sparkles" class="w-5 h-5"></i>
                <span id="admin-status-text">Cargando datos del negocio...</span>
            </div>
        </div>

        <!-- Views -->
        <div id="view-overview" class="space-y-6">
            <h2 class="text-2xl font-bold mb-4">Resumen del Negocio</h2>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="glass p-6 rounded-2xl border border-gray-800">
                    <div class="text-gray-400 text-sm">Visitas Totales</div>
                    <div class="text-3xl font-bold mt-2" id="total-visits">0</div>
                </div>
                <div class="glass p-6 rounded-2xl border border-gray-800">
                    <div class="text-gray-400 text-sm">Clics en WhatsApp</div>
                    <div class="text-3xl font-bold mt-2 text-green-400" id="whatsapp-clicks">0</div>
                </div>
                <div class="glass p-6 rounded-2xl border border-gray-800">
                    <div class="text-gray-400 text-sm">Productos Activos</div>
                    <div class="text-3xl font-bold mt-2" id="active-products-count">0</div>
                </div>
                <div class="glass p-6 rounded-2xl border border-gray-800">
                    <div class="text-gray-400 text-sm">Pedidos</div>
                    <div class="text-3xl font-bold mt-2 text-yellow-400" id="orders-count">0</div>
                </div>
            </div>

            <div class="glass p-6 rounded-2xl border border-gray-800 mt-8">
                <h3 class="font-bold text-lg mb-4">Configuración Básica</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">Nombre del Negocio</label>
                        <input type="text" id="edit-name" class="w-full input rounded-lg p-3">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">WhatsApp</label>
                        <input type="text" id="edit-whatsapp" class="w-full input rounded-lg p-3">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">Categoría</label>
                        <input type="text" id="edit-category" class="w-full input rounded-lg p-3">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">Color de marca</label>
                        <input type="color" id="edit-brand-color" class="w-full h-12 rounded-lg bg-transparent border border-gray-700 p-1">
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm text-gray-400 mb-1">Descripción</label>
                        <textarea id="edit-description" rows="4" class="w-full input rounded-lg p-3 resize-none"></textarea>
                    </div>
                    <div class="md:col-span-2">
                        <label class="block text-sm text-gray-400 mb-1">Dirección / Ubicación</label>
                        <input type="text" id="edit-address" class="w-full input rounded-lg p-3">
                    </div>
                </div>

                <button onclick="saveBasicInfo()" class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <i data-lucide="save" class="w-4 h-4"></i>
                    Guardar Cambios
                </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="glass p-6 rounded-2xl border border-gray-800">
                    <h3 class="font-bold text-lg mb-4">Vista Rápida</h3>
                    <div class="space-y-3 text-sm text-gray-300">
                        <div class="flex justify-between">
                            <span>Plantilla</span>
                            <span id="current-template">...</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Plan</span>
                            <span id="current-plan">free</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Slug</span>
                            <span id="current-slug">...</span>
                        </div>
                    </div>
                </div>

                <div class="glass p-6 rounded-2xl border border-gray-800">
                    <h3 class="font-bold text-lg mb-4">Acciones rápidas</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button onclick="switchTab('products')" class="bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-left">
                            <div class="font-medium">Administrar productos</div>
                            <div class="text-xs text-gray-400">CRUD completo</div>
                        </button>
                        <button onclick="switchTab('orders')" class="bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-left">
                            <div class="font-medium">Ver pedidos</div>
                            <div class="text-xs text-gray-400">Últimas ventas</div>
                        </button>
                        <button onclick="switchTab('design')" class="bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-left">
                            <div class="font-medium">Diseño</div>
                            <div class="text-xs text-gray-400">Tema y color</div>
                        </button>
                        <button onclick="refreshDashboard()" class="bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-left">
                            <div class="font-medium">Refrescar datos</div>
                            <div class="text-xs text-gray-400">Volver a cargar</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div id="view-products" class="hidden space-y-6">
            <div class="flex justify-between items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold">Mis Productos</h2>
                    <p class="text-sm text-gray-400">Crea, edita y elimina productos.</p>
                </div>
                <button onclick="openProductModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium flex items-center gap-2">
                    <i data-lucide="plus" class="w-4 h-4"></i> Nuevo Producto
                </button>
            </div>
            <div id="products-grid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"></div>
        </div>

        <div id="view-design" class="hidden space-y-6">
            <h2 class="text-2xl font-bold">Diseño y Plantilla</h2>
            <div class="glass p-6 rounded-2xl border border-gray-800 space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p class="text-gray-400 mb-1">Plantilla actual</p>
                        <p id="design-template" class="text-white font-bold text-lg">...</p>
                    </div>
                    <div>
                        <p class="text-gray-400 mb-1">Tema visual</p>
                        <p id="design-theme" class="text-white font-bold text-lg">...</p>
                    </div>
                </div>

                <div class="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg text-yellow-200 text-sm">
                    ℹ️ El cambio avanzado de plantilla puede conectarse a tu registry. Por ahora puedes ajustar color de marca y contenido básico.
                </div>
            </div>

            <div class="glass p-6 rounded-2xl border border-gray-800">
                <h3 class="font-bold text-lg mb-4">Cambiar color de marca</h3>
                <div class="flex items-center gap-3">
                    <input type="color" id="design-brand-color" class="w-16 h-12 rounded-lg bg-transparent border border-gray-700 p-1">
                    <button onclick="saveBrandColor()" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium">Guardar color</button>
                </div>
            </div>
        </div>

        <div id="view-orders" class="hidden space-y-6">
            <div class="flex justify-between items-center gap-4">
                <div>
                    <h2 class="text-2xl font-bold">Pedidos Recientes</h2>
                    <p class="text-sm text-gray-400">Revisa las compras generadas por WhatsApp.</p>
                </div>
                <button onclick="loadOrders()" class="bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg font-medium flex items-center gap-2">
                    <i data-lucide="refresh-cw" class="w-4 h-4"></i> Refrescar
                </button>
            </div>
            <div id="orders-list" class="space-y-4"></div>
        </div>
    </main>

    <!-- Modal Producto -->
    <div id="product-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
        <div class="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div class="flex items-center justify-between mb-4">
                <h3 id="product-modal-title" class="text-xl font-bold">Nuevo Producto</h3>
                <button onclick="closeProductModal()" class="text-gray-400 hover:text-white">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <input type="text" id="prod-name" placeholder="Nombre del producto" class="w-full input rounded-lg p-3 mb-3">
            <textarea id="prod-desc" placeholder="Descripción" class="w-full input rounded-lg p-3 mb-3 h-24 resize-none"></textarea>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <input type="number" id="prod-price" placeholder="Precio" step="0.01" class="w-full input rounded-lg p-3">
                <input type="number" id="prod-stock" placeholder="Stock" step="1" class="w-full input rounded-lg p-3">
            </div>

            <input type="text" id="prod-img" placeholder="URL Imagen (opcional)" class="w-full input rounded-lg p-3 mb-3">
            <label class="flex items-center gap-2 text-sm text-gray-300 mb-4">
                <input type="checkbox" id="prod-active" checked>
                Producto activo
            </label>

            <div class="flex justify-end gap-3">
                <button onclick="closeProductModal()" class="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                <button onclick="saveProduct()" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">Guardar</button>
            </div>
        </div>
    </div>

    <script src="js/config.js"></script>
    <script>
        const supabaseClient = window.sf_state?.supabase || window.supabaseClient || null;

        const TEMPLATE_LABELS = {
            'rest-modern-dark': 'Restaurante Oscuro Moderno',
            'rest-classic-light': 'Clásico Luminoso',
            'rest-fast-food': 'Comida Rápida Vibrante',
            'cafe-minimal': 'Café Minimalista',
            'cafe-rustic': 'Rústico Acogedor',
            'cafe-urban': 'Urbano Industrial',
            'bakery-warm': 'Panadería Cálida',
            'bakery-french': 'Estilo Francés',
            'bakery-sweet': 'Dulces y Pasteles',
            'soda-tico': 'Soda Típica',
            'soda-grill': 'Grill & Bar',
            'soda-family': 'Familiar Económico',
            'barber-vintage': 'Barbería Vintage',
            'barber-modern': 'Salón Moderno',
            'barber-luxury': 'Lujo & Estilo',
            'beauty-spa': 'Spa & Relax',
            'beauty-nails': 'Uñas & Pestañas',
            'beauty-glam': 'Glamour Total',
            'fashion-boutique': 'Boutique Elegante',
            'fashion-street': 'Streetwear',
            'fashion-kids': 'Moda Infantil',
            'hardware-pro': 'Ferretería Pro',
            'hardware-home': 'Hogar & Construcción',
            'hardware-tools': 'Herramientas Expertas',
            'mechanic-auto': 'Automotriz General',
            'mechanic-moto': 'Motos & Racing',
            'mechanic-detail': 'Detailing & Lavado',
            'vet-care': 'Cuidado Animal',
            'vet-petshop': 'Petshop & Vet',
            'vet-clinic': 'Clínica Especializada',
            'gym-crossfit': 'CrossFit Box',
            'gym-yoga': 'Yoga & Pilates',
            'gym-body': 'Bodybuilding Gym',
            'travel-adventure': 'Aventura Extrema',
            'travel-tours': 'Tours Guiados',
            'travel-eco': 'Ecoturismo',
            'hotel-boutique': 'Hotel Boutique',
            'hotel-resort': 'Resort Playero',
            'hotel-city': 'Hotel de Ciudad',
            'pro-lawyer': 'Bufete Legal',
            'pro-doctor': 'Consultorio Médico',
            'pro-design': 'Estudio de Diseño',
            'other-generic': 'Negocio General',
            'other-services': 'Servicios Varios',
            'other-startup': 'Startup Tech'
        };

        const TEMPLATE_THEMES = {
            'rest-modern-dark': 'Oscuro premium',
            'rest-classic-light': 'Claro clásico',
            'rest-fast-food': 'Rápido vibrante',
            'cafe-minimal': 'Minimalista cálido',
            'cafe-rustic': 'Rústico acogedor',
            'cafe-urban': 'Urbano industrial',
            'bakery-warm': 'Cálido artesanal',
            'bakery-french': 'Francés elegante',
            'bakery-sweet': 'Dulce pastelero',
            'soda-tico': 'Tico tradicional',
            'soda-grill': 'Grill casual',
            'soda-family': 'Familiar económico',
            'barber-vintage': 'Vintage oscuro',
            'barber-modern': 'Moderno limpio',
            'barber-luxury': 'Lujo intenso',
            'beauty-spa': 'Spa relajante',
            'beauty-nails': 'Nails glam',
            'beauty-glam': 'Glamour total',
            'fashion-boutique': 'Boutique elegante',
            'fashion-street': 'Streetwear',
            'fashion-kids': 'Infantil suave',
            'hardware-pro': 'Industrial pro',
            'hardware-home': 'Hogar robusto',
            'hardware-tools': 'Herramientas expertas',
            'mechanic-auto': 'Automotriz pro',
            'mechanic-moto': 'Moto racing',
            'mechanic-detail': 'Detailing premium',
            'vet-care': 'Clínica cálida',
            'vet-petshop': 'Petshop friendly',
            'vet-clinic': 'Clínica especializada',
            'gym-crossfit': 'CrossFit energía',
            'gym-yoga': 'Yoga zen',
            'gym-body': 'Gym fuerte',
            'travel-adventure': 'Aventura épica',
            'travel-tours': 'Tours guiados',
            'travel-eco': 'Eco naturaleza',
            'hotel-boutique': 'Boutique hotel',
            'hotel-resort': 'Resort premium',
            'hotel-city': 'City hotel',
            'pro-lawyer': 'Legal serio',
            'pro-doctor': 'Médico limpio',
            'pro-design': 'Diseño creativo',
            'other-generic': 'General moderno',
            'other-services': 'Servicios versátiles',
            'other-startup': 'Startup tech'
        };

        const DEFAULT_FALLBACK_PRODUCTS = [
            { name: 'Producto 1', description: 'Descripción del producto', price: 0, image_url: '', active: true }
        ];

        let currentBusiness = null;
        let currentProducts = [];
        let currentOrders = [];
        let editingProductId = null;
        let slug = new URLSearchParams(window.location.search).get('slug') || new URLSearchParams(window.location.search).get('id');

        function showToast(message, type = 'info') {
            if (window.sf_utils?.showToast) return window.sf_utils.showToast(message, type);

            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.textContent = message;
            document.body.appendChild(toast);
            requestAnimationFrame(() => toast.classList.add('show'));
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 250);
            }, 2500);
        }

        function escapeHtml(str) {
            return String(str ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function money(value) {
            const n = Number(value || 0);
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(n);
        }

        function normalizeWhatsapp(value) {
            return String(value ?? '').replace(/\D/g, '');
        }

        function getBusinessUrl() {
            if (!slug) return '#';
            return `negocio.html?slug=${encodeURIComponent(slug)}`;
        }

        function getTemplateLabel(templateId) {
            return TEMPLATE_LABELS[templateId] || templateId || 'Default';
        }

        function getTemplateTheme(templateId) {
            return TEMPLATE_THEMES[templateId] || 'Tema personalizado';
        }

        function setStatus(message) {
            const bar = document.getElementById('admin-status');
            const text = document.getElementById('admin-status-text');
            if (!bar || !text) return;
            text.textContent = message;
            bar.classList.remove('hidden');
        }

        function hideStatus() {
            document.getElementById('admin-status')?.classList.add('hidden');
        }

        function switchTab(tabId) {
            document.querySelectorAll('[id^="view-"]').forEach(el => el.classList.add('hidden'));
            const view = document.getElementById(`view-${tabId}`);
            if (view) view.classList.remove('hidden');

            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('tab-active');
                if (btn.dataset.tab === tabId) btn.classList.add('tab-active');
            });
        }

        function setPageLinks() {
            const url = getBusinessUrl();
            const desktop = document.getElementById('view-site-btn');
            const mobile = document.getElementById('view-site-btn-mobile');
            if (desktop) desktop.href = url;
            if (mobile) mobile.href = url;
        }

        async function loadBusiness() {
            setStatus('Cargando negocio...');

            if (!slug) {
                showToast('No se encontró el negocio en la URL', 'error');
                window.location.href = 'index.html';
                return;
            }

            setPageLinks();

            try {
                if (supabaseClient && typeof supabaseClient.from === 'function') {
                    let business = null;

                    const bySlug = await supabaseClient
                        .from('businesses')
                        .select('*')
                        .eq('slug', slug)
                        .maybeSingle();

                    if (bySlug?.data) {
                        business = bySlug.data;
                    } else {
                        const byId = await supabaseClient
                            .from('businesses')
                            .select('*')
                            .eq('id', slug)
                            .maybeSingle();

                        if (byId?.data) business = byId.data;
                    }

                    if (!business) {
                        throw new Error('Business not found');
                    }

                    currentBusiness = business;
                    await loadProducts();
                    await loadOrders();
                } else {
                    currentBusiness = {
                        id: 'demo-business',
                        name: 'Jale Costura y Sublimado',
                        category: 'Tienda de ropa',
                        description: 'Negocio demo mientras la conexión a Supabase se valida.',
                        address: 'San José',
                        whatsapp: '50688888888',
                        template_id: 'fashion-boutique',
                        brand_color: '#2563eb',
                        plan: 'free'
                    };
                    currentProducts = [
                        { id: 'p1', name: 'Camiseta sublimada', description: 'Tela suave y diseño full color', price: 12, image_url: '', active: true },
                        { id: 'p2', name: 'Taza personalizada', description: 'Ideal para regalos', price: 8, image_url: '', active: true }
                    ];
                    currentOrders = [];
                }

                renderBusiness();
                hideStatus();
                if (typeof lucide !== 'undefined') lucide.createIcons();
            } catch (err) {
                console.error(err);
                setStatus('No se pudo cargar el negocio. Revisa la URL o la conexión a Supabase.');
                showToast('Error cargando datos del negocio', 'error');
                document.getElementById('business-name-display').textContent = 'Error';
                document.getElementById('business-name-display-mobile').textContent = 'Error';
            }
        }

        async function loadProducts() {
            if (!supabaseClient || !currentBusiness?.id) {
                currentProducts = [];
                return;
            }

            const { data, error } = await supabaseClient
                .from('products')
                .select('*')
                .eq('business_id', currentBusiness.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.warn('Error cargando productos:', error);
                currentProducts = [];
                return;
            }

            currentProducts = Array.isArray(data) ? data : [];
        }

        async function loadOrders() {
            if (!supabaseClient || !currentBusiness?.id) {
                currentOrders = [];
                return;
            }

            const { data, error } = await supabaseClient
                .from('orders')
                .select('*')
                .eq('business_id', currentBusiness.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.warn('Error cargando pedidos:', error);
                currentOrders = [];
                return;
            }

            currentOrders = Array.isArray(data) ? data : [];
        }

        function renderBusiness() {
            if (!currentBusiness) return;

            document.getElementById('business-name-display').textContent = currentBusiness.name || 'Negocio';
            document.getElementById('business-name-display-mobile').textContent = currentBusiness.name || 'Negocio';

            const nameInput = document.getElementById('edit-name');
            const whatsappInput = document.getElementById('edit-whatsapp');
            const categoryInput = document.getElementById('edit-category');
            const descInput = document.getElementById('edit-description');
            const addrInput = document.getElementById('edit-address');
            const colorInput = document.getElementById('edit-brand-color');

            if (nameInput) nameInput.value = currentBusiness.name || '';
            if (whatsappInput) whatsappInput.value = currentBusiness.whatsapp || '';
            if (categoryInput) categoryInput.value = currentBusiness.category || '';
            if (descInput) descInput.value = currentBusiness.description || '';
            if (addrInput) addrInput.value = currentBusiness.address || currentBusiness.city || '';
            if (colorInput) colorInput.value = currentBusiness.brand_color || '#2563eb';

            document.getElementById('current-template').textContent = getTemplateLabel(currentBusiness.template_id);
            document.getElementById('current-plan').textContent = currentBusiness.plan || 'free';
            document.getElementById('current-slug').textContent = currentBusiness.slug || slug || '—';
            document.getElementById('design-template').textContent = getTemplateLabel(currentBusiness.template_id);
            document.getElementById('design-theme').textContent = getTemplateTheme(currentBusiness.template_id);

            document.getElementById('total-visits').textContent = String(currentBusiness.total_visits || currentBusiness.visits || 0);
            document.getElementById('whatsapp-clicks').textContent = String(currentBusiness.whatsapp_clicks || 0);
            document.getElementById('active-products-count').textContent = String(currentProducts.filter(p => p.active !== false).length);
            document.getElementById('orders-count').textContent = String(currentOrders.length);

            renderProducts();
            renderOrders();
            updateThemePreview();
        }

        function updateThemePreview() {
            const accent = currentBusiness?.brand_color || '#2563eb';
            const designBox = document.getElementById('view-design');
            if (designBox) {
                designBox.style.setProperty('--brand-color', accent);
            }
        }

        function renderProducts() {
            const grid = document.getElementById('products-grid');
            document.getElementById('active-products-count').textContent = String(currentProducts.filter(p => p.active !== false).length);

            if (!currentProducts || currentProducts.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-full text-center py-12 text-gray-400">
                        No hay productos aún. ¡Agrega el primero!
                    </div>`;
                if (typeof lucide !== 'undefined') lucide.createIcons();
                return;
            }

            grid.innerHTML = currentProducts.map((p, i) => `
                <div class="glass p-4 rounded-xl border border-gray-800 flex flex-col gap-3">
                    <div class="h-40 bg-gray-800 rounded-lg overflow-hidden relative">
                        ${
                            p.image_url
                                ? `<img src="${escapeHtml(p.image_url)}" class="w-full h-full object-cover" alt="${escapeHtml(p.name)}">`
                                : `<div class="w-full h-full flex items-center justify-center text-gray-600">Sin imagen</div>`
                        }
                        <button onclick="deleteProduct(${JSON.stringify(String(p.id))})" class="absolute top-2 right-2 bg-red-500/80 p-1.5 rounded-full hover:bg-red-600 transition-colors">
                            <i data-lucide="trash-2" class="w-4 h-4 text-white"></i>
                        </button>
                        <button onclick="editProduct(${JSON.stringify(String(p.id))})" class="absolute top-2 left-2 bg-blue-500/80 p-1.5 rounded-full hover:bg-blue-600 transition-colors">
                            <i data-lucide="pencil" class="w-4 h-4 text-white"></i>
                        </button>
                    </div>
                    <div>
                        <h4 class="font-bold text-lg">${escapeHtml(p.name)}</h4>
                        <p class="text-sm text-gray-400 line-clamp-2">${escapeHtml(p.description || '')}</p>
                        <div class="mt-2 flex justify-between items-center">
                            <span class="text-blue-400 font-bold">${money(p.price)}</span>
                            <span class="text-xs ${p.active ? 'text-green-400' : 'text-red-400'} px-2 py-1 rounded-full bg-gray-800 border border-gray-700">
                                ${p.active ? 'Activo' : 'Oculto'}
                            </span>
                        </div>
                    </div>
                </div>
            `).join('');

            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        function renderOrders() {
            const list = document.getElementById('orders-list');

            if (!currentOrders || currentOrders.length === 0) {
                list.innerHTML = `
                    <div class="glass p-8 rounded-2xl border border-gray-800 text-center text-gray-400">
                        <i data-lucide="inbox" class="w-12 h-12 mx-auto mb-4 opacity-50"></i>
                        <p>No hay pedidos recientes. ¡Comparte tu enlace para empezar a vender!</p>
                    </div>`;
                if (typeof lucide !== 'undefined') lucide.createIcons();
                return;
            }

            list.innerHTML = currentOrders.map(order => `
                <div class="glass p-5 rounded-2xl border border-gray-800">
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <h4 class="font-bold text-lg">${escapeHtml(order.customer_name || 'Cliente')}</h4>
                            <p class="text-sm text-gray-400">${escapeHtml(order.customer_phone || '')}</p>
                            <p class="text-sm text-gray-400">${escapeHtml(order.customer_address || '')}</p>
                        </div>
                        <div class="text-right">
                            <div class="text-xl font-bold text-green-400">${money(order.total || 0)}</div>
                            <div class="text-xs text-gray-500">${new Date(order.created_at || Date.now()).toLocaleString()}</div>
                        </div>
                    </div>
                    <div class="mt-4 flex items-center gap-2 text-xs">
                        <span class="px-2 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-300">
                            ${escapeHtml(order.status || 'pending')}
                        </span>
                        <span class="px-2 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-300">
                            ${escapeHtml(order.invoice_type || 'normal')}
                        </span>
                    </div>
                </div>
            `).join('');

            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        function openProductModal() {
            editingProductId = null;
            document.getElementById('product-modal-title').textContent = 'Nuevo Producto';
            document.getElementById('product-modal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeProductModal() {
            document.getElementById('product-modal').classList.add('hidden');
            document.body.style.overflow = '';

            document.getElementById('prod-name').value = '';
            document.getElementById('prod-desc').value = '';
            document.getElementById('prod-price').value = '';
            document.getElementById('prod-img').value = '';
            document.getElementById('prod-stock').value = '';
            document.getElementById('prod-active').checked = true;
            editingProductId = null;
        }

        function editProduct(productId) {
            const product = currentProducts.find(p => String(p.id) === String(productId));
            if (!product) return;

            editingProductId = product.id;
            document.getElementById('product-modal-title').textContent = 'Editar Producto';
            document.getElementById('prod-name').value = product.name || '';
            document.getElementById('prod-desc').value = product.description || '';
            document.getElementById('prod-price').value = product.price ?? '';
            document.getElementById('prod-img').value = product.image_url || '';
            document.getElementById('prod-stock').value = product.stock ?? '';
            document.getElementById('prod-active').checked = product.active !== false;

            document.getElementById('product-modal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        async function saveProduct() {
            const name = document.getElementById('prod-name').value.trim();
            const description = document.getElementById('prod-desc').value.trim();
            const price = parseFloat(document.getElementById('prod-price').value);
            const image_url = document.getElementById('prod-img').value.trim();
            const stockValue = document.getElementById('prod-stock').value.trim();
            const active = document.getElementById('prod-active').checked;

            if (!name || Number.isNaN(price)) {
                showToast('Nombre y precio son obligatorios', 'error');
                return;
            }

            const payload = {
                business_id: currentBusiness?.id,
                name,
                description,
                price,
                image_url: image_url || DEFAULT_PRODUCT_IMAGE,
                stock: stockValue === '' ? 0 : parseInt(stockValue, 10),
                active
            };

            try {
                if (supabaseClient && typeof supabaseClient.from === 'function' && currentBusiness?.id) {
                    if (editingProductId) {
                        const { error } = await supabaseClient
                            .from('products')
                            .update(payload)
                            .eq('id', editingProductId);

                        if (error) throw error;
                        showToast('Producto actualizado', 'success');
                    } else {
                        const { data, error } = await supabaseClient
                            .from('products')
                            .insert(payload)
                            .select()
                            .single();

                        if (error) throw error;
                        if (data) currentProducts.unshift(data);
                        showToast('Producto agregado', 'success');
                    }

                    await loadProducts();
                } else {
                    if (editingProductId) {
                        const idx = currentProducts.findIndex(p => String(p.id) === String(editingProductId));
                        if (idx !== -1) currentProducts[idx] = { ...currentProducts[idx], ...payload };
                        showToast('Producto actualizado (demo)', 'success');
                    } else {
                        const localProduct = {
                            id: `demo-${Date.now()}`,
                            ...payload,
                            created_at: new Date().toISOString()
                        };
                        currentProducts.unshift(localProduct);
                        showToast('Producto agregado (demo)', 'success');
                    }
                }

                renderBusiness();
                closeProductModal();
                renderProducts();
            } catch (error) {
                console.error(error);
                showToast('No se pudo guardar el producto', 'error');
            }
        }

        async function deleteProduct(productId) {
            if (!confirm('¿Eliminar este producto?')) return;

            try {
                if (supabaseClient && typeof supabaseClient.from === 'function') {
                    const { error } = await supabaseClient
                        .from('products')
                        .delete()
                        .eq('id', productId);

                    if (error) throw error;
                    showToast('Producto eliminado', 'success');
                    await loadProducts();
                } else {
                    currentProducts = currentProducts.filter(p => String(p.id) !== String(productId));
                    showToast('Producto eliminado (demo)', 'success');
                }

                renderBusiness();
                renderProducts();
            } catch (error) {
                console.error(error);
                showToast('No se pudo eliminar el producto', 'error');
            }
        }

        async function saveBasicInfo() {
            const newName = document.getElementById('edit-name').value.trim();
            const newWa = document.getElementById('edit-whatsapp').value.trim();
            const newCategory = document.getElementById('edit-category').value.trim();
            const newDescription = document.getElementById('edit-description').value.trim();
            const newAddress = document.getElementById('edit-address').value.trim();
            const newBrandColor = document.getElementById('edit-brand-color').value;

            if (!newName || !newWa) {
                showToast('Nombre y WhatsApp son obligatorios', 'error');
                return;
            }

            const payload = {
                name: newName,
                whatsapp: newWa,
                category: newCategory,
                description: newDescription,
                address: newAddress,
                brand_color: newBrandColor
            };

            try {
                if (supabaseClient && typeof supabaseClient.from === 'function' && currentBusiness?.id) {
                    const { error } = await supabaseClient
                        .from('businesses')
                        .update(payload)
                        .eq('id', currentBusiness.id);

                    if (error) throw error;
                    showToast('Información actualizada', 'success');
                    currentBusiness = { ...currentBusiness, ...payload };
                } else {
                    currentBusiness = { ...currentBusiness, ...payload };
                    showToast('Información actualizada (demo)', 'success');
                }

                document.getElementById('business-name-display').textContent = currentBusiness.name;
                document.getElementById('business-name-display-mobile').textContent = currentBusiness.name;
                document.getElementById('current-template').textContent = getTemplateLabel(currentBusiness.template_id);
                document.getElementById('current-plan').textContent = currentBusiness.plan || 'free';
                document.getElementById('current-slug').textContent = currentBusiness.slug || slug || '—';
                document.getElementById('design-template').textContent = getTemplateLabel(currentBusiness.template_id);
                document.getElementById('design-theme').textContent = getTemplateTheme(currentBusiness.template_id);
                updateThemePreview();

                renderBusiness();
            } catch (error) {
                console.error(error);
                showToast('No se pudo guardar la información', 'error');
            }
        }

        async function saveBrandColor() {
            const color = document.getElementById('design-brand-color').value;

            try {
                if (supabaseClient && typeof supabaseClient.from === 'function' && currentBusiness?.id) {
                    const { error } = await supabaseClient
                        .from('businesses')
                        .update({ brand_color: color })
                        .eq('id', currentBusiness.id);

                    if (error) throw error;
                }

                currentBusiness = { ...currentBusiness, brand_color: color };
                document.getElementById('edit-brand-color').value = color;
                updateThemePreview();
                showToast('Color de marca actualizado', 'success');
            } catch (error) {
                console.error(error);
                showToast('No se pudo guardar el color', 'error');
            }
        }

        async function refreshDashboard() {
            await loadBusiness();
            showToast('Datos actualizados', 'info');
        }

        function closeModalIfBackdrop(e) {
            if (e.target === document.getElementById('product-modal')) {
                closeProductModal();
            }
        }

        // Expose functions for inline handlers
        window.switchTab = switchTab;
        window.openProductModal = openProductModal;
        window.closeProductModal = closeProductModal;
        window.saveProduct = saveProduct;
        window.deleteProduct = deleteProduct;
        window.saveBasicInfo = saveBasicInfo;
        window.saveBrandColor = saveBrandColor;
        window.refreshDashboard = refreshDashboard;
        window.editProduct = editProduct;

        document.addEventListener('DOMContentLoaded', async () => {
            if (typeof lucide !== 'undefined') lucide.createIcons();
            document.getElementById('product-modal').addEventListener('click', closeModalIfBackdrop);
            document.getElementById('design-brand-color').value = '#2563eb';
            document.getElementById('edit-brand-color').value = '#2563eb';

            setPageLinks();
            await loadBusiness();
            switchTab('overview');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    </script>
</body>
</html>
