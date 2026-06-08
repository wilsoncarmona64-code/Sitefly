<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel de Administración - SiteFly</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background: #0f172a; color: white; }
        .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); }
        .tab-active { border-bottom: 2px solid #3b82f6; color: #3b82f6; }
    </style>
</head>
<body class="antialiased min-h-screen flex">

    <!-- Sidebar -->
    <aside class="w-64 glass border-r border-gray-800 hidden md:flex flex-col">
        <div class="p-6 border-b border-gray-800">
            <h1 class="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">SiteFly Admin</h1>
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
    <main class="flex-1 overflow-y-auto p-8">
        <!-- Mobile Header -->
        <div class="md:hidden flex items-center justify-between mb-6">
            <h1 class="text-xl font-bold">SiteFly Admin</h1>
            <a id="view-site-btn-mobile" href="#" target="_blank" class="bg-green-600 p-2 rounded-lg">
                <i data-lucide="external-link" class="w-5 h-5"></i>
            </a>
        </div>

        <!-- Views -->
        <div id="view-overview" class="space-y-6">
            <h2 class="text-2xl font-bold mb-4">Resumen del Negocio</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="glass p-6 rounded-2xl border border-gray-800">
                    <div class="text-gray-400 text-sm">Visitas Totales</div>
                    <div class="text-3xl font-bold mt-2">124</div>
                </div>
                <div class="glass p-6 rounded-2xl border border-gray-800">
                    <div class="text-gray-400 text-sm">Clics en WhatsApp</div>
                    <div class="text-3xl font-bold mt-2 text-green-400">18</div>
                </div>
                <div class="glass p-6 rounded-2xl border border-gray-800">
                    <div class="text-gray-400 text-sm">Productos Activos</div>
                    <div class="text-3xl font-bold mt-2" id="active-products-count">0</div>
                </div>
            </div>
            
            <div class="glass p-6 rounded-2xl border border-gray-800 mt-8">
                <h3 class="font-bold text-lg mb-4">Configuración Básica</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">Nombre del Negocio</label>
                        <input type="text" id="edit-name" class="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 focus:border-blue-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">WhatsApp</label>
                        <input type="text" id="edit-whatsapp" class="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 focus:border-blue-500 outline-none">
                    </div>
                </div>
                <button onclick="saveBasicInfo()" class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">Guardar Cambios</button>
            </div>
        </div>

        <div id="view-products" class="hidden space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold">Mis Productos</h2>
                <button onclick="openProductModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                    <i data-lucide="plus" class="w-4 h-4"></i> Nuevo Producto
                </button>
            </div>
            <div id="products-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Productos cargados dinámicamente -->
            </div>
        </div>

        <div id="view-design" class="hidden space-y-6">
            <h2 class="text-2xl font-bold">Diseño y Plantilla</h2>
            <div class="glass p-6 rounded-2xl border border-gray-800">
                <p class="text-gray-400 mb-4">Actualmente usas la plantilla: <span id="current-template" class="text-white font-bold">...</span></p>
                <div class="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg text-yellow-200 text-sm">
                    ℹ️ El cambio de plantilla avanzado estará disponible en la próxima actualización. Por ahora puedes editar colores básicos.
                </div>
            </div>
        </div>

        <div id="view-orders" class="hidden space-y-6">
            <h2 class="text-2xl font-bold">Pedidos Recientes</h2>
            <div class="glass p-8 rounded-2xl border border-gray-800 text-center text-gray-400">
                <i data-lucide="inbox" class="w-12 h-12 mx-auto mb-4 opacity-50"></i>
                <p>No hay pedidos recientes. ¡Comparte tu enlace para empezar a vender!</p>
            </div>
        </div>
    </main>

    <!-- Modal Producto -->
    <div id="product-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
        <div class="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 class="text-xl font-bold mb-4">Nuevo Producto</h3>
            <input type="text" id="prod-name" placeholder="Nombre del producto" class="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 mb-3 outline-none focus:border-blue-500">
            <textarea id="prod-desc" placeholder="Descripción" class="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 mb-3 outline-none focus:border-blue-500 h-24"></textarea>
            <div class="flex gap-3 mb-4">
                <input type="number" id="prod-price" placeholder="Precio ($)" class="w-1/2 bg-gray-800 border border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500">
                <input type="text" id="prod-img" placeholder="URL Imagen (opcional)" class="w-1/2 bg-gray-800 border border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500">
            </div>
            <div class="flex justify-end gap-3">
                <button onclick="closeProductModal()" class="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                <button onclick="saveProduct()" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">Guardar</button>
            </div>
        </div>
    </div>

    <script src="js/config.js"></script>
    <script>
        lucide.createIcons();
        
        let currentBusiness = null;
        const slug = new URLSearchParams(window.location.search).get('slug');

        async function loadBusiness() {
            if (!slug) {
                alert("No se encontró el negocio. Redirigiendo...");
                window.location.href = 'index.html';
                return;
            }

            // Configurar botón de ver página
            const viewUrl = `negocio.html?slug=${slug}`;
            document.getElementById('view-site-btn').href = viewUrl;
            document.getElementById('view-site-btn-mobile').href = viewUrl;

            try {
                // Intentar cargar de Supabase si está configurado
                if (window.sf_state.supabase) {
                    const { data, error } = await window.sf_state.supabase
                        .from('businesses')
                        .select('*')
                        .eq('slug', slug)
                        .single();
                    
                    if (error) throw error;
                    currentBusiness = data;
                } else {
                    // Modo Demo / Fallback
                    currentBusiness = {
                        name: "Jale Costura y Sublimado",
                        whatsapp: "50600000000",
                        template_id: "fashion-boutique",
                        products: []
                    };
                }

                // Renderizar datos
                document.getElementById('business-name-display').textContent = currentBusiness.name;
                document.getElementById('edit-name').value = currentBusiness.name;
                document.getElementById('edit-whatsapp').value = currentBusiness.whatsapp || '';
                document.getElementById('current-template').textContent = currentBusiness.template_id || 'Default';
                
                renderProducts(currentBusiness.products || []);

            } catch (err) {
                console.error("Error cargando negocio:", err);
                window.sf_utils.showToast("Error cargando datos", "error");
            }
        }

        function switchTab(tabId) {
            document.querySelectorAll('[id^="view-"]').forEach(el => el.classList.add('hidden'));
            document.getElementById(`view-${tabId}`).classList.remove('hidden');
            
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('tab-active');
                if(btn.dataset.tab === tabId) btn.classList.add('tab-active');
            });
        }

        function renderProducts(products) {
            const grid = document.getElementById('products-grid');
            document.getElementById('active-products-count').textContent = products.length;
            
            if (products.length === 0) {
                grid.innerHTML = `<div class="col-span-full text-center py-10 text-gray-500">No hay productos aún. ¡Agrega el primero!</div>`;
                return;
            }

            grid.innerHTML = products.map((p, i) => `
                <div class="glass p-4 rounded-xl border border-gray-800 flex flex-col gap-3">
                    <div class="h-40 bg-gray-800 rounded-lg overflow-hidden relative">
                        ${p.image_url ? `<img src="${p.image_url}" class="w-full h-full object-cover">` : '<div class="w-full h-full flex items-center justify-center text-gray-600">Sin imagen</div>'}
                        <button onclick="deleteProduct(${i})" class="absolute top-2 right-2 bg-red-500/80 p-1.5 rounded-full hover:bg-red-600 transition-colors">
                            <i data-lucide="trash-2" class="w-4 h-4 text-white"></i>
                        </button>
                    </div>
                    <div>
                        <h4 class="font-bold text-lg">${p.name}</h4>
                        <p class="text-sm text-gray-400 line-clamp-2">${p.description}</p>
                        <div class="mt-2 flex justify-between items-center">
                            <span class="text-blue-400 font-bold">$${p.price}</span>
                            <span class="text-xs ${p.active ? 'text-green-400' : 'text-red-400'} px-2 py-1 rounded-full bg-gray-800 border border-gray-700">
                                ${p.active ? 'Activo' : 'Oculto'}
                            </span>
                        </div>
                    </div>
                </div>
            `).join('');
            lucide.createIcons();
        }

        function openProductModal() {
            document.getElementById('product-modal').classList.remove('hidden');
        }

        function closeProductModal() {
            document.getElementById('product-modal').classList.add('hidden');
            // Limpiar inputs
            document.getElementById('prod-name').value = '';
            document.getElementById('prod-desc').value = '';
            document.getElementById('prod-price').value = '';
            document.getElementById('prod-img').value = '';
        }

        function saveProduct() {
            const name = document.getElementById('prod-name').value;
            const price = document.getElementById('prod-price').value;
            
            if(!name || !price) {
                alert("Nombre y precio son obligatorios");
                return;
            }

            const newProduct = {
                name: name,
                description: document.getElementById('prod-desc').value,
                price: parseFloat(price),
                image_url: document.getElementById('prod-img').value || 'https://via.placeholder.com/300',
                active: true,
                created_at: new Date().toISOString()
            };

            if(!currentBusiness.products) currentBusiness.products = [];
            currentBusiness.products.push(newProduct);
            
            // En producción: guardar en Supabase
            // await supabase.from('products').insert(...)

            renderProducts(currentBusiness.products);
            closeProductModal();
            window.sf_utils.showToast("Producto agregado", "success");
        }

        function deleteProduct(index) {
            if(confirm('¿Eliminar este producto?')) {
                currentBusiness.products.splice(index, 1);
                renderProducts(currentBusiness.products);
                // En producción: eliminar en DB
            }
        }

        function saveBasicInfo() {
            const newName = document.getElementById('edit-name').value;
            const newWa = document.getElementById('edit-whatsapp').value;
            
            currentBusiness.name = newName;
            currentBusiness.whatsapp = newWa;
            
            document.getElementById('business-name-display').textContent = newName;
            window.sf_utils.showToast("Información actualizada", "success");
            // En producción: update en DB
        }

        // Init
        loadBusiness();
    </script>
</body>
</html>
