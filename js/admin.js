function sf_initAdmin() {
    document.getElementById('sf-admin-name').value = sf_state.userData.name;
    document.getElementById('sf-admin-desc').value = sf_state.userData.description;
    document.getElementById('sf-admin-location').value = sf_state.userData.location;
    document.getElementById('sf-admin-whatsapp').value = sf_state.userData.whatsapp;
    document.getElementById('sf-admin-hours').value = sf_state.userData.hours;

    const domain = (sf_state.userData.name || 'mi-negocio').toLowerCase().replace(/\s+/g, '-');
    document.getElementById('sf-domain-display').textContent = domain + '.sitefly.app';
    document.getElementById('sf-seo-display').textContent = `Optimizado para "${sf_state.userData.category} en ${sf_state.userData.location}"`;

    sf_renderProducts();
    sf_renderOrders();
    sf_switchAdminTab('negocio');
}

function sf_switchAdminTab(tab) {
    sf_state.adminTab = tab;
    ['negocio', 'productos', 'pedidos', 'asistente'].forEach(t => {
        const panel = document.getElementById(`sf-admin-${t}`);
        const btn = document.getElementById(`sf-tab-btn-${t}`);
        if (panel) panel.classList.add('sf-hidden');
        if (btn) { btn.classList.remove('sf-tab-active'); btn.classList.add('sf-tab-inactive'); }
    });
    const activePanel = document.getElementById(`sf-admin-${tab}`);
    const activeBtn = document.getElementById(`sf-tab-btn-${tab}`);
    if (activePanel) { activePanel.classList.remove('sf-hidden'); activePanel.classList.add('sf-animate-up'); }
    if (activeBtn) { activeBtn.classList.remove('sf-tab-inactive'); activeBtn.classList.add('sf-tab-active'); }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function sf_updateBusiness() {
    sf_state.userData.name = document.getElementById('sf-admin-name').value;
    sf_state.userData.description = document.getElementById('sf-admin-desc').value;
    sf_state.userData.location = document.getElementById('sf-admin-location').value;
    sf_state.userData.whatsapp = document.getElementById('sf-admin-whatsapp').value;
    sf_state.userData.hours = document.getElementById('sf-admin-hours').value;

    await sf_saveBusiness();
}

function sf_renderProducts() {
    const container = document.getElementById('sf-product-list');
    if (sf_state.products.length === 0) { container.innerHTML = '<p class="text-center text-slate-500 py-8">No hay productos aún.</p>'; return; }
    container.innerHTML = sf_state.products.map(p => `
        <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4 sf-animate-up">
            <div class="flex items-center gap-3 flex-1">
                <div class="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center shrink-0"><i data-lucide="package" class="w-5 h-5 text-slate-400"></i></div>
                <div class="flex-1 min-w-0">
                    <input type="text" value="${sf_escapeHtml(p.name)}" class="bg-transparent text-white font-medium text-sm w-full focus:outline-none focus:border-b focus:border-indigo-500" onchange="sf_updateProduct('${p.id}', 'name', this.value)">
                    <input type="text" value="${sf_escapeHtml(p.description || '')}" class="bg-transparent text-slate-400 text-xs w-full focus:outline-none focus:border-b focus:border-indigo-500" onchange="sf_updateProduct('${p.id}', 'description', this.value)">
                </div>
            </div>
            <div class="flex items-center gap-2">
                <div class="flex items-center bg-slate-700 rounded-lg"><span class="text-slate-400 pl-3 text-sm">$</span><input type="number" value="${p.price}" step="0.01" class="bg-transparent text-white text-sm w-16 py-2 focus:outline-none" onchange="sf_updateProduct('${p.id}', 'price', parseFloat(this.value))"></div>
                <button onclick="sf_deleteProduct('${p.id}')" class="p-2 text-slate-400 hover:text-red-400 transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div>
        </div>
    `).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function sf_addProduct() {
    if (sf_state.products.length >= 5) { 
        sf_showToast('Plan Gratuito: máximo 5 productos.', 'warning');
        return; 
    }
    const newProduct = { id: 'demo-' + Date.now(), name: 'Nuevo producto', description: 'Descripción', price: 0 };
    const savedProduct = await sf_saveProduct(newProduct);
    if (savedProduct) newProduct.id = savedProduct.id;
    sf_state.products.push(newProduct);
    sf_renderProducts();
}

async function sf_updateProduct(id, field, value) {
    const p = sf_state.products.find(x => x.id == id);
    if (p) {
        p[field] = value;
        await sf_saveProduct(p);
    }
}

async function sf_deleteProduct(id) {
    await sf_deleteProductFromDB(id);
    sf_state.products = sf_state.products.filter(p => p.id != id);
    sf_renderProducts();
}

// ===== ORDERS =====
function sf_renderOrders() {
    const container = document.getElementById('sf-orders-list');
    const pendingCount = sf_state.orders.filter(o => o.status === 'Pendiente').length;
    const badge = document.getElementById('sf-pending-badge');
    if (pendingCount > 0) { badge.textContent = pendingCount; badge.classList.remove('hidden'); } else { badge.classList.add('hidden'); }

    if (sf_state.orders.length === 0) { container.innerHTML = '<tr><td colspan="4" class="px-4 py-8 text-center text-slate-500">No hay pedidos aún.</td></tr>'; return; }
    container.innerHTML = sf_state.orders.map(order => `
        <tr class="hover:bg-slate-800/50 transition-colors">
            <td class="px-4 py-3 font-mono text-xs text-slate-400">#${order.id.toString().slice(-4)}</td>
            <td class="px-4 py-3"><div class="font-medium text-white">${sf_escapeHtml(order.customer_name)}</div><div class="text-xs text-slate-400">${sf_escapeHtml(order.customer_phone)}</div></td>
            <td class="px-4 py-3 font-semibold">$${order.total.toFixed(2)}</td>
            <td class="px-4 py-3">
                <select onchange="sf_updateOrderStatus('${order.id}', this.value)" class="text-xs font-medium px-2 py-1 rounded-full border-0 status-${order.status.toLowerCase()} cursor-pointer">
                    <option value="Pendiente" ${order.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="Confirmado" ${order.status === 'Confirmado' ? 'selected' : ''}>Confirmado</option>
                    <option value="Preparando" ${order.status === 'Preparando' ? 'selected' : ''}>Preparando</option>
                    <option value="Entregado" ${order.status === 'Entregado' ? 'selected' : ''}>Entregado</option>
                </select>
            </td>
        </tr>
    `).join('');
}

// ===== AI ASSISTANT =====
async function sf_processAssistantCommand() {
    const input = document.getElementById('sf-assistant-input');
    const cmd = input.value.trim().toLowerCase();
    if (!cmd) return;
    const chatContainer = document.getElementById('sf-assistant-chat');
    chatContainer.innerHTML += `<div class="flex justify-end mb-4 sf-animate-up"><div class="bg-indigo-600 text-white px-4 py-3 rounded-2xl text-sm max-w-[80%]">${sf_escapeHtml(input.value)}</div></div>`;
    input.value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    setTimeout(async () => {
        let response = '';
        if (cmd.includes('agrega') && cmd.includes('producto')) {
            const match = cmd.match(/agrega.*?producto.*?llamado\s+(.+?)\s+a\s+\$?(\d+(?:\.\d+)?)/i) || cmd.match(/agrega\s+(.+?)\s+a\s+\$?(\d+(?:\.\d+)?)/i);
            if (match) {
                const name = match[1].trim(); const price = parseFloat(match[2]);
                const newProduct = { id: 'demo-' + Date.now(), name: name, description: 'Agregado por IA', price: price };
                const savedProduct = await sf_saveProduct(newProduct);
                if (savedProduct) newProduct.id = savedProduct.id;
                sf_state.products.push(newProduct);
                sf_renderProducts();
                response = `¡Listo! He agregado "${name}" a $${price.toFixed(2)} a tu catálogo.`;
            } else { response = 'No entendí el nombre o precio. Intenta: "Agrega un producto llamado Café a $2.50"'; }
        } else if (cmd.includes('cambia el precio de')) {
            const match = cmd.match(/cambia el precio de\s+(.+?)\s+a\s+\$?(\d+(?:\.\d+)?)/i);
            if (match) {
                const name = match[1].trim(); const price = parseFloat(match[2]);
                const product = sf_state.products.find(p => p.name.toLowerCase().includes(name.toLowerCase()));
                if (product) { 
                    product.price = price; 
                    await sf_saveProduct(product);
                    sf_renderProducts(); 
                    response = `He actualizado el precio de "${product.name}" a $${price.toFixed(2)}.`; 
                }
                else { response = `No encontré un producto llamado "${name}".`; }
            }
        } else if (cmd.includes('cambia el horario')) {
            const match = cmd.match(/cambia el horario a\s+(.+)/i);
            if (match) {
                const hours = match[1].trim();
                sf_state.userData.hours = hours;
                document.getElementById('sf-admin-hours').value = hours;
                await sf_saveBusiness();
                response = `He actualizado el horario a: ${hours}`;
            } else {
                response = 'No entendí el horario. Intenta: "Cambia el horario a 8am a 6pm"';
            }
        } else {
            response = 'Puedo ayudarte a:
• Agregar productos: "Agrega un producto llamado Taza a $8.00"
• Cambiar precios: "Cambia el precio de la Hamburguesa a $10"
• Cambiar horario: "Cambia el horario a 8am a 6pm"';
        }
        chatContainer.innerHTML += `<div class="flex gap-3 mb-4 sf-animate-up"><img src="https://image.qwenlm.ai/public_source/0ba08b56-35a5-4f25-adda-eb45071b3040/115239c29-3833-4da1-a16c-f38fdf34252c.png" class="w-8 h-8 rounded-full"><div class="sf-bubble-ai text-white px-4 py-3 rounded-2xl text-sm max-w-[80%] whitespace-pre-line">${sf_escapeHtml(response)}</div></div>`;
        chatContainer.scrollTop = chatContainer.scrollHeight;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 800);
}
