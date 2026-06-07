function sf_addToCart(productId) {
    const product = sf_state.products.find(p => p.id == productId);
    if (!product) return;
    const existingItem = sf_state.cart.find(item => item.id == productId);
    if (existingItem) { existingItem.qty += 1; } else { sf_state.cart.push({ ...product, qty: 1 }); }
    sf_updateCartBadge();
    const btn = document.getElementById(`sf-add-btn-${productId}`);
    if (btn) {
        btn.classList.add('sf-cart-bounce');
        btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Agregado';
        setTimeout(() => { btn.classList.remove('sf-cart-bounce'); btn.innerHTML = '<i data-lucide="plus" class="w-4 h-4"></i> Agregar'; if (typeof lucide !== 'undefined') lucide.createIcons(); }, 1000);
    }
}

function sf_removeFromCart(productId) {
    const existingItem = sf_state.cart.find(item => item.id == productId);
    if (existingItem) {
        if (existingItem.qty > 1) { existingItem.qty -= 1; } else { sf_state.cart = sf_state.cart.filter(item => item.id != productId); }
    }
    sf_updateCartBadge(); sf_renderCheckoutCart();
}

function sf_getCartTotal() { return sf_state.cart.reduce((total, item) => total + (item.price * item.qty), 0); }

function sf_updateCartBadge() {
    const totalItems = sf_state.cart.reduce((sum, item) => sum + item.qty, 0);
    const badges = [document.getElementById('sf-cart-badge-desktop'), document.getElementById('sf-preview-cart-count')];
    badges.forEach(badge => {
        if (badge) {
            if (totalItems > 0) { badge.textContent = totalItems; badge.classList.remove('sf-hidden'); } else { badge.classList.add('sf-hidden'); }
        }
    });
}

// ===== CHECKOUT =====
function sf_showCheckout() {
    sf_hidePreview();
    sf_showView('checkout');
    sf_renderCheckoutCart();
}

function sf_hideCheckout() { sf_showView('admin'); }

function sf_renderCheckoutCart() {
    const container = document.getElementById('sf-checkout-cart-items');
    const subtotal = sf_getCartTotal();
    const shipping = subtotal > 0 ? 1.50 : 0;
    const total = subtotal + shipping;

    if (sf_state.cart.length === 0) {
        container.innerHTML = '<p class="text-center text-slate-500 py-8">Tu carrito está vacío.</p>';
    } else {
        container.innerHTML = sf_state.cart.map(item => `
            <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center"><i data-lucide="package" class="w-6 h-6 text-indigo-400"></i></div>
                    <div><p class="font-medium">${sf_escapeHtml(item.name)}</p><p class="text-sm text-slate-400">x${item.qty} — $${item.price.toFixed(2)} c/u</p></div>
                </div>
                <div class="flex items-center gap-3">
                    <p class="font-semibold">$${(item.price * item.qty).toFixed(2)}</p>
                    <button onclick="sf_removeFromCart('${item.id}')" class="p-1 text-slate-400 hover:text-red-400 transition-colors"><i data-lucide="minus-circle" class="w-5 h-5"></i></button>
                </div>
            </div>
        `).join('');
    }
    document.getElementById('sf-checkout-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('sf-checkout-shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('sf-checkout-total').textContent = `$${total.toFixed(2)}`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function sf_toggleInvoice() {
    const type = document.querySelector('input[name="sf-invoice-type"]:checked').value;
    const fields = document.getElementById('sf-invoice-fields');
    if (type === 'electronica') fields.classList.remove('hidden');
    else fields.classList.add('hidden');
}

async function sf_submitCheckout(e) {
    e.preventDefault();
    if (sf_state.cart.length === 0) { 
        sf_showToast('Tu carrito está vacío.', 'warning');
        return; 
    }

    const whatsapp = sf_validateWhatsapp(sf_state.userData.whatsapp);
    if (!whatsapp) {
        sf_showToast('El negocio no tiene WhatsApp configurado.', 'error');
        return;
    }

    const name = document.getElementById('sf-check-name').value;
    const phone = document.getElementById('sf-check-phone').value;
    const address = document.getElementById('sf-check-address').value;
    const invoiceType = document.querySelector('input[name="sf-invoice-type"]:checked').value;
    const businessName = sf_state.userData.name || 'Mi Negocio';

    const subtotal = sf_getCartTotal();
    const shipping = 1.50;
    const total = subtotal + shipping;

    const newOrder = {
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        status: 'Pendiente',
        invoice_type: invoiceType,
        invoice_razon: invoiceType === 'electronica' ? document.getElementById('sf-check-razon').value : null,
        invoice_doc: invoiceType === 'electronica' ? document.getElementById('sf-check-doc').value : null,
        invoice_email: invoiceType === 'electronica' ? document.getElementById('sf-check-email').value : null,
        items: [...sf_state.cart]
    };

    const savedOrder = await sf_saveOrder(newOrder);

    if (savedOrder) {
        sf_state.orders.unshift(savedOrder);
        sf_renderOrders();
    }

    let message = `🛒 *NUEVO PEDIDO — ${businessName}*

📦 *Productos:*
`;
    sf_state.cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        message += `• ${item.qty}x ${item.name} — $${itemTotal.toFixed(2)}
`;
    });
    message += `
💰 *Subtotal:* $${subtotal.toFixed(2)}
🚚 *Envío:* $${shipping.toFixed(2)}
💵 *TOTAL:* $${total.toFixed(2)}

`;
    message += `👤 *Cliente:*
Nombre: ${name}
Teléfono: ${phone}
Dirección: ${address}

`;
    if (invoiceType === 'electronica') {
        message += `🧾 *Factura Electrónica:*
Razón social: ${document.getElementById('sf-check-razon').value}
Cédula/NIT/RUC: ${document.getElementById('sf-check-doc').value}
Correo: ${document.getElementById('sf-check-email').value}`;
    } else {
        message += `🧾 Factura normal`;
    }

    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i> ¡Abriendo WhatsApp!';

    setTimeout(() => {
        window.open(url, '_blank');
        btn.innerHTML = originalText;
        sf_state.cart = [];
        sf_updateCartBadge();
        sf_hideCheckout();
    }, 1000);
}
