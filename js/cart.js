function sf_addToCart(productId) {
    const product = sf_state.products.find(p => p.id == productId);
    if (!product) return;
    
    const existingItem = sf_state.cart.find(item => item.id == productId);
    if (existingItem) { 
        existingItem.qty += 1; 
    } else { 
        sf_state.cart.push({ ...product, qty: 1 }); 
    }
    
    sf_updateCartBadge();
    
    // Visual feedback
    const btn = document.getElementById(`sf-add-btn-${productId}`);
    if (btn) {
        btn.classList.add('sf-cart-bounce');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Agregado';
        setTimeout(() => { 
            btn.classList.remove('sf-cart-bounce'); 
            btn.innerHTML = originalHtml; 
            if (typeof lucide !== 'undefined') lucide.createIcons(); 
        }, 1000);
    }
    
    sf_showToast('Producto agregado al carrito', 'success');
}

function sf_removeFromCart(productId) {
    const existingItem = sf_state.cart.find(item => item.id == productId);
    if (existingItem) {
        if (existingItem.qty > 1) { 
            existingItem.qty -= 1; 
        } else { 
            sf_state.cart = sf_state.cart.filter(item => item.id != productId); 
        }
    }
    sf_updateCartBadge(); 
    sf_renderCheckoutCart();
}

function sf_getCartTotal() { 
    return sf_state.cart.reduce((total, item) => total + (item.price * item.qty), 0); 
}

function sf_updateCartBadge() {
    const totalItems = sf_state.cart.reduce((sum, item) => sum + item.qty, 0);
    const badges = [
        document.getElementById('sf-cart-badge-desktop'), 
        document.getElementById('sf-preview-cart-count')
    ];
    
    badges.forEach(badge => {
        if (badge) {
            if (totalItems > 0) { 
                badge.textContent = totalItems; 
                badge.classList.remove('sf-hidden'); 
            } else { 
                badge.classList.add('sf-hidden'); 
            }
        }
    });
}

// ===== CHECKOUT =====
function sf_showCheckout() {
    sf_hidePreview();
    sf_showView('checkout');
    sf_renderCheckoutCart();
}

function sf_hideCheckout() { 
    sf_showView('admin'); 
}

function sf_renderCheckoutCart() {
    const container = document.getElementById('sf-checkout-cart-items');
    const subtotal = sf_getCartTotal();
    const shipping = subtotal > 0 ? 1.50 : 0;
    const total = subtotal + shipping;

    if (sf_state.cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i data-lucide="shopping-cart" class="w-16 h-16 text-slate-600 mx-auto mb-4"></i>
                <p class="text-slate-500">Tu carrito está vacío.</p>
                <button onclick="sf_hideCheckout()" class="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                    Volver a la tienda
                </button>
            </div>
        `;
    } else {
        container.innerHTML = sf_state.cart.map((item, index) => `
            <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between sf-animate-up" style="animation-delay: ${index * 0.05}s">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <i data-lucide="package" class="w-6 h-6 text-white"></i>
                    </div>
                    <div>
                        <p class="font-medium text-white">${sf_escapeHtml(item.name)}</p>
                        <p class="text-sm text-slate-400">x${item.qty} — $${item.price.toFixed(2)} c/u</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <p class="font-semibold text-emerald-400">$${(item.price * item.qty).toFixed(2)}</p>
                    <button onclick="sf_removeFromCart('${item.id}')" class="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-700">
                        <i data-lucide="minus-circle" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    document.getElementById('sf-checkout-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('sf-checkout-shipping').textContent = shipping > 0 ? `$${shipping.toFixed(2)}` : 'Gratis';
    document.getElementById('sf-checkout-total').textContent = `$${total.toFixed(2)}`;
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function sf_toggleInvoice() {
    const type = document.querySelector('input[name="sf-invoice-type"]:checked').value;
    const fields = document.getElementById('sf-invoice-fields');
    if (type === 'electronica') {
        fields.classList.remove('hidden');
        fields.classList.add('sf-animate-up');
    } else {
        fields.classList.add('hidden');
    }
}

async function sf_submitCheckout(e) {
    e.preventDefault();
    
    if (sf_state.cart.length === 0) { 
        sf_showToast('Tu carrito está vacío.', 'warning');
        return; 
    }

    // Validate business WhatsApp
    const whatsapp = sf_validateWhatsapp(sf_state.userData.whatsapp);
    if (!whatsapp) {
        sf_showToast('El negocio no tiene WhatsApp configurado correctamente.', 'error');
        return;
    }

    // Get form data
    const name = document.getElementById('sf-check-name').value.trim();
    const phone = document.getElementById('sf-check-phone').value.trim();
    const address = document.getElementById('sf-check-address').value.trim();
    const invoiceType = document.querySelector('input[name="sf-invoice-type"]:checked').value;
    const businessName = sf_state.userData.name || 'Mi Negocio';

    if (!name || !phone || !address) {
        sf_showToast('Por favor completa los campos requeridos.', 'warning');
        return;
    }

    const subtotal = sf_getCartTotal();
    const shipping = 1.50;
    const total = subtotal + shipping;

    // Create order object
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

    // Save order to database
    const savedOrder = await sf_saveOrder(newOrder);
    if (savedOrder) {
        sf_state.orders.unshift(savedOrder);
        sf_renderOrders();
    }

    // Build WhatsApp message
    let message = `🛒 *NUEVO PEDIDO — ${businessName}*\\n\\n`;
    message += `📦 *Productos:*\\n`;
    sf_state.cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        message += `• ${item.qty}x ${item.name} — $${itemTotal.toFixed(2)}\\n`;
    });
    message += `\\n💰 *Subtotal:* $${subtotal.toFixed(2)}\\n`;
    message += `🚚 *Envío:* $${shipping.toFixed(2)}\\n`;
    message += `💵 *TOTAL:* $${total.toFixed(2)}\\n\\n`;
    message += `👤 *Cliente:*\\n`;
    message += `Nombre: ${name}\\n`;
    message += `Teléfono: ${phone}\\n`;
    message += `Dirección: ${address}\\n\\n`;
    
    if (invoiceType === 'electronica') {
        message += `🧾 *Factura Electrónica:*\\n`;
        message += `Razón social: ${document.getElementById('sf-check-razon').value}\\n`;
        message += `Cédula/NIT/RUC: ${document.getElementById('sf-check-doc').value}\\n`;
        message += `Correo: ${document.getElementById('sf-check-email').value}`;
    } else {
        message += `🧾 Factura normal`;
    }

    // Generate WhatsApp URL with proper encoding
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodedMessage}`;

    // Update button state
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i> ¡Abriendo WhatsApp!';
    btn.disabled = true;
    btn.classList.add('opacity-75');

    // Open WhatsApp after short delay
    setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        
        // Reset form and cart
        btn.innerHTML = originalText;
        btn.disabled = false;
        btn.classList.remove('opacity-75');
        
        sf_state.cart = [];
        sf_updateCartBadge();
        sf_hideCheckout();
        sf_showToast('¡Pedido enviado! Revisa tu WhatsApp para confirmar.', 'success');
    }, 1000);
}
