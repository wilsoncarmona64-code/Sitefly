// js/admin.js - Panel de Administración SiteFly
// Este archivo contiene SOLO JavaScript, NO HTML

let sf_lastOrderCount = 0;

// ===== INICIALIZACIÓN =====
function sf_initAdmin() {
    sf_renderBusinessInfo();
    sf_renderProducts();
    sf_renderOrders();
    sf_switchAdminTab('negocio');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ===== NAVEGACIÓN DE TABS =====
function sf_switchAdminTab(tabName) {
    // Ocultar todos los tabs
    document.querySelectorAll('[id^="sf-admin-"]').forEach(el => {
        el.classList.add('sf-hidden');
    });
    
    // Desactivar todos los botones
    document.querySelectorAll('[id^="sf-tab-btn-"]').forEach(btn => {
        btn.classList.remove('sf-tab-active');
        btn.classList.add('sf-tab-inactive');
    });
    
    // Mostrar tab seleccionado
    const tabContent = document.getElementById(`sf-admin-${tabName}`);
    const tabButton = document.getElementById(`sf-tab-btn-${tabName}`);
    
    if (tabContent) tabContent.classList.remove('sf-hidden');
    if (tabButton) {
        tabButton.classList.remove('sf-tab-inactive');
        tabButton.classList.add('sf-tab-active');
    }
    
    sf_state.adminTab = tabName;
}

// ===== RENDERIZAR INFORMACIÓN DEL NEGOCIO =====
function sf_renderBusinessInfo() {
    const business = sf_state.userData;
    
    document.getElementById('sf-admin-name').value = business.name || '';
    document.getElementById('sf-admin-desc').value = business.description || '';
    document.getElementById('sf-admin-city').value = business.city || business.location || '';
    document.getElementById('sf-admin-whatsapp').value = business.whatsapp || '';
    document.getElementById('sf-admin-schedule').value = business.hours || business.schedule || '';
}

// ===== ACTUALIZAR NEGOCIO =====
async function sf_updateBusiness() {
    sf_state.userData.name = document.getElementById('sf-admin-name').value;
    sf_state.userData.description = document.getElementById('sf-admin-desc').value;
    sf_state.userData.city = document.getElementById('sf-admin-city').value;
    sf_state.userData.location = document.getElementById('sf-admin-city').value;
    sf_state.userData.whatsapp = document.getElementById('sf-admin-whatsapp').value;
    sf_state.userData.hours = document.getElementById('sf-admin-schedule').value;
    sf_state.userData.schedule = document.getElementById('sf-admin-schedule').value;
    
    await sf_saveBusiness();
}

// ===== RENDERIZAR PRODUCTOS =====
function sf_renderProducts() {
    const container = document.getElementById('sf-product-list');
    if (!container) return;
    
    const products = sf_state.products || [];
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-slate-400">
                <i data-lucide="package" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
                <p>No hay productos aún</p>
                <p class="text-sm">Agrega tu primer producto para comenzar</p>
            </div>
        `;
    } else {
        container.innerHTML = products.map(product => `
            <div class="flex items-center justify-between p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
                <div class="flex-1">
                    <h4 class="font-medium">${sf_escapeHtml(product.name)}</h4>
                    <p class="text-sm text-slate-400">${sf_escapeHtml(product.description || '')}</p>
                    <p class="text-indigo-400 font-semibold">${sf_money(product.price)}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="sf_editProduct('${product.id}')" class="p-2 text-slate-400 hover:text-white transition-colors">
                        <i data-lucide="edit" class="w-4 h-4"></i>
                    </button>
                    <button onclick="sf_deleteProduct('${product.id}')" class="p-2 text-red-400 hover:text-red-300 transition-colors">
                        <i data-lucide="trash" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ===== AGREGAR PRODUCTO =====
function sf_addProduct() {
    const name = prompt('Nombre del producto:');
    if (!name) return;
    
    const description = prompt('Descripción (opcional):') || '';
    const price = parseFloat(prompt('Precio:')) || 0;
    
    const product = {
        id: `demo-${Date.now()}`,
        name,
        description,
        price
    };
    
    sf_saveProduct(product).then(result => {
        if (result) {
            sf_state.products.push(result);
            sf_renderProducts();
        }
    });
}

// ===== EDITAR PRODUCTO =====
function sf_editProduct(productId) {
    const product = sf_state.products.find(p => p.id === productId);
    if (!product) return;
    
    const name = prompt('Nombre del producto:', product.name);
    if (!name) return;
    
    const description = prompt('Descripción:', product.description || '');
    const price = parseFloat(prompt('Precio:', product.price)) || 0;
    
    const updatedProduct = { ...product, name, description, price };
    
    sf_saveProduct(updatedProduct).then(result => {
        if (result) {
            const index = sf_state.products.findIndex(p => p.id === productId);
            if (index !== -1) sf_state.products[index] = result;
            sf_renderProducts();
        }
    });
}

// ===== ELIMINAR PRODUCTO =====
async function sf_deleteProduct(productId) {
    if (!confirm('¿Eliminar este producto?')) return;
    
    const success = await sf_deleteProductFromDB(productId);
    if (success) {
        sf_state.products = sf_state.products.filter(p => p.id !== productId);
        sf_renderProducts();
    }
}

// ===== RENDERIZAR PEDIDOS =====
function sf_renderOrders() {
    const container = document.getElementById('sf-orders-list');
    if (!container) return;
    
    const orders = sf_state.orders || [];
    
    if (orders.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="4" class="px-4 py-8 text-center text-slate-400">
                    No hay pedidos aún
                </td>
            </tr>
        `;
    } else {
        container.innerHTML = orders.map(order => `
            <tr class="border-b border-slate-700 hover:bg-slate-700/30">
                <td class="px-4 py-3 font-mono text-xs">#${order.id.slice(0, 8)}</td>
                <td class="px-4 py-3">${sf_escapeHtml(order.customer_name || 'Cliente')}</td>
                <td class="px-4 py-3 font-semibold">${sf_money(order.total)}</td>
                <td class="px-4 py-3">
                    <span class="px-2 py-1 rounded-full text-xs ${
                        order.status === 'Completado' ? 'bg-green-600/20 text-green-400' :
                        order.status === 'Pendiente' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-slate-600/20 text-slate-400'
                    }">
                        ${order.status || 'Pendiente'}
                    </span>
                </td>
            </tr>
        `).join('');
    }
}

// ===== PROCESAR COMANDO DEL ASISTENTE IA =====
async function sf_processAssistantCommand() {
    const input = document.getElementById('sf-assistant-input');
    const command = input.value.trim();
    
    if (!command) return;
    
    input.value = '';
    
    // Agregar mensaje del usuario al chat
    const chatContainer = document.getElementById('sf-assistant-chat');
    chatContainer.innerHTML += `
        <div class="flex gap-3 justify-end">
            <div class="bg-indigo-600 text-white px-4 py-3 rounded-2xl text-sm max-w-[80%]">
                ${sf_escapeHtml(command)}
            </div>
        </div>
    `;
    
    // Procesar comando (simplificado)
    let response = 'Entendido. Estoy procesando tu solicitud...';
    
    if (command.toLowerCase().includes('agrega') && command.toLowerCase().includes('producto')) {
        response = 'Para agregar un producto, usa el botón "Agregar Producto" en la pestaña Productos.';
    } else if (command.toLowerCase().includes('cambia') && command.toLowerCase().includes('precio')) {
        response = 'Para cambiar precios, ve a la pestaña Productos y edita el producto.';
    } else if (command.toLowerCase().includes('horario')) {
        response = 'Puedes cambiar el horario en la pestaña Negocio.';
    }
    
    // Agregar respuesta del asistente
    setTimeout(() => {
        chatContainer.innerHTML += `
            <div class="flex gap-3">
                <img src="https://image.qwenlm.ai/public_source/0ba08b56-35a5-4f25-adda-eb45071b3040/115239c29-3833-4da1-a16c-f38fdf34252c.png" class="w-8 h-8 rounded-full">
                <div class="bg-slate-700 text-white px-4 py-3 rounded-2xl text-sm max-w-[80%]">
                    ${response}
                </div>
            </div>
        `;
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 500);
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
