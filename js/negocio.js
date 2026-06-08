// ===== BUSINESS PAGE LOGIC =====
let businessData = null;
let products = [];
let cart = [];
const whatsappNumber = '50688888888'; // Default fallback

// Get business slug from URL (fixed: was using 'id' but system uses 'slug')
function getBusinessSlug() {
    const params = new URLSearchParams(window.location.search);
    return params.get('slug') || params.get('id');
}

// Initialize page
async function initBusinessPage() {
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

        // Load products
        const { data: productsData, error: prodError } = await supabaseClient
            .from('products')
            .select('*')
            .eq('business_id', businessId)
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
    // Hero section
    document.getElementById('hero-category').textContent = businessData.category || 'Negocio';
    document.getElementById('hero-name').textContent = businessData.name || 'Mi Negocio';
    document.getElementById('hero-description').textContent = businessData.description || '';
    
    // Info section - fixed: use city/schedule instead of location/hours
    document.getElementById('info-description').textContent = businessData.description || '';
    document.getElementById('info-location').textContent = businessData.city || businessData.location || 'Ubicación no especificada';
    document.getElementById('info-hours').textContent = businessData.schedule || businessData.hours || 'Horario no especificado';
    
    // Benefits (using default based on category)
    const categoryContent = sf_ai_content[businessData.category] || sf_ai_content['default'];
    const benefitsHtml = (categoryContent.benefits || []).map(b => 
        `<div class="flex items-center gap-3"><i data-lucide="check-circle" class="w-5 h-5 text-green-500 flex-shrink-0"></i><span>${escapeHtml(b)}</span></div>`
    ).join('');
    document.getElementById('info-benefits').innerHTML = benefitsHtml;

    // FAQs
    const faqsHtml = (categoryContent.faqs || []).map(f => 
        `<div><h4 class="font-semibold mb-1">${escapeHtml(f.q)}</h4><p class="text-sm text-slate-600">${escapeHtml(f.a)}</p></div>`
    ).join('');
    document.getElementById('info-faqs').innerHTML = faqsHtml || '<p class="text-slate-600">No hay preguntas frecuentes registradas.</p>';

    // Footer
    document.getElementById('footer-name').textContent = `© 2024 ${businessData.name || 'Mi Negocio'}. Todos los derechos reservados.`;

    // Products
    renderProducts();

    // WhatsApp buttons
    const whatsapp = validateWhatsapp(businessData.whatsapp);
    if (whatsapp) {
        const waLink = `https://wa.me/${whatsapp}`;
        document.getElementById('hero-whatsapp-btn').href = waLink;
        document.getElementById('whatsapp-float').href = waLink;
        document.getElementById('whatsapp-float').classList.remove('hidden');
    } else {
        document.getElementById('hero-whatsapp-btn').classList.add('hidden');
    }

    // Hero background
    const template = categoryContent.templates?.[0] || sf_ai_content['default'].templates[0];
    document.getElementById('hero-section').style.backgroundImage = `url('${template.img}')`;
}

function renderProducts() {
    const container = document.getElementById('products-grid');
    
    if (products.length === 0) {
        container.innerHTML = '<p class="text-center text-slate-500 py-12 col-span-full">No hay productos disponibles aún.</p>';
        return;
    }

    container.innerHTML = products.map(p => `
        <div class="product-card">
            <div class="h-48 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                <i data-lucide="package" class="w-12 h-12 text-slate-400"></i>
            </div>
            <div class="p-4">
                <h3 class="font-bold text-lg mb-1">${escapeHtml(p.name)}</h3>
                <p class="text-sm text-slate-600 mb-3">${escapeHtml(p.description || '')}</p>
                <div class="flex items-center justify-between">
                    <span class="text-xl font-bold text-indigo-600">$${parseFloat(p.price).toFixed(2)}</span>
                    <button onclick="addToCart('${p.id}')" class="text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-2">
                        <i data-lucide="plus" class="w-4 h-4"></i> Agregar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
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
    return cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.qty), 0);
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const total = getCartTotal();

    document.getElementById('cart-count').textContent = totalItems;
    document.getElementById('cart-total').textContent = total.toFixed(2);

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
}

function closeCartModal() {
    document.getElementById('cart-modal').classList.add('hidden');
}

function renderCartItems() {
    const container = document.getElementById('cart-items');
    const subtotal = getCartTotal();
    const shipping = subtotal > 0 ? 1.50 : 0;
    const total = subtotal + shipping;

    if (cart.length === 0) {
        container.innerHTML = '<p class="text-slate-400 text-center py-8">Tu carrito está vacío.</p>';
    } else {
        container.innerHTML = cart.map(item => `
            <div class="flex items-center justify-between bg-slate-700/50 rounded-xl p-3">
                <div>
                    <p class="font-medium text-white">${escapeHtml(item.name)}</p>
                    <p class="text-sm text-slate-400">$${parseFloat(item.price).toFixed(2)} x ${item.qty}</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-semibold text-emerald-400">$${(parseFloat(item.price) * item.qty).toFixed(2)}</span>
                    <button onclick="removeFromCart('${item.id}')" class="text-slate-400 hover:text-red-400 transition-colors">
                        <i data-lucide="minus-circle" class="w-5 h-5"></i>
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

async function submitOrder() {
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
    btn.disabled = true;
    btn.innerHTML = '<div class="sf-loading"></div> Enviando...';

    const subtotal = getCartTotal();
    const shipping = 1.50;
    const total = subtotal + shipping;

    // Save order to database
    const orderData = {
        business_id: businessData.id,
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        status: 'Pendiente',
        invoice_type: 'normal'
    };

    const { data: savedOrder, error } = await supabaseClient
        .from('orders')
        .insert(orderData)
        .select()
        .single();

    if (!error && savedOrder) {
        // Save order items
        for (const item of cart) {
            await supabaseClient.from('order_items').insert({
                order_id: savedOrder.id,
                product_id: item.id,
                product_name: item.name,
                quantity: item.qty,
                unit_price: item.price,
                total_price: item.price * item.qty
            });
        }
    }

    // Build WhatsApp message
    let message = `🛒 *NUEVO PEDIDO — ${escapeHtml(businessData.name)}*\n\n`;
    message += `📦 *Productos:*\n`;
    cart.forEach(item => {
        message += `• ${item.qty}x ${item.name} — $${(parseFloat(item.price) * item.qty).toFixed(2)}\n`;
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
        btn.innerHTML = '<i data-lucide="send" class="w-5 h-5"></i> Enviar pedido por WhatsApp';
        return;
    }

    const encodedMessage = encodeURIComponent(message);
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
        btn.innerHTML = '<i data-lucide="send" class="w-5 h-5"></i> Enviar pedido por WhatsApp';
        
        showToast('¡Pedido enviado! Revisa tu WhatsApp.', 'success');
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
    const toast = document.createElement('div');
    toast.className = `sf-toast sf-toast-${type}`;
    toast.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}" class="w-5 h-5"></i>
        <span>${escapeHtml(message)}</span>
    `;
    document.body.appendChild(toast);
    
    if (typeof lucide !== 'undefined') lucide.createIcons();

    setTimeout(() => {
        toast.classList.add('sf-toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initBusinessPage);
