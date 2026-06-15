(() => {
    'use strict';

    const state = () => {
        window.sf_state = window.sf_state || {};
        if (!Array.isArray(window.sf_state.products)) window.sf_state.products = [];
        if (!Array.isArray(window.sf_state.cart)) window.sf_state.cart = [];
        if (!window.sf_state.business) window.sf_state.business = null;
        return window.sf_state;
    };

    const client = () => window.supabaseClient || window.supabase || null;

    const qs = (id) => document.getElementById(id);

    const escapeHtml = (str) => String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const money = (value) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(value || 0));

    function showToast(message, type = 'info') {
        if (window.sf_utils?.showToast) {
            return window.sf_utils.showToast(message, type);
        }

        const toast = document.createElement('div');
        toast.className = `sf-toast sf-toast-${type}`;
        toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('show'));

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2400);
    }

    function validateWhatsapp(value) {
        const digits = String(value ?? '').replace(/\D/g, '');
        return digits.length >= 8 ? digits : '';
    }

    function getBusinessSlug() {
        const params = new URLSearchParams(window.location.search);
        return params.get('slug') || params.get('id') || '';
    }

    function safeIcons() {
        if (typeof lucide !== 'undefined' && lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
    }

    const SF_TEMPLATE_REGISTRY = {
        default: {
            id: 'default',
            label: 'Moderno',
            accent: '#4f46e5',
            heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
            dark: false
        },
        'rest-modern-dark': {
            id: 'rest-modern-dark',
            label: 'Restaurante Oscuro Moderno',
            accent: '#d97706',
            heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
            dark: true
        },
        'rest-classic-light': {
            id: 'rest-classic-light',
            label: 'Clásico Luminoso',
            accent: '#c084fc',
            heroImage: 'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?auto=format&fit=crop&w=1600&q=80',
            dark: false
        },
        'rest-fast-food': {
            id: 'rest-fast-food',
            label: 'Comida Rápida Vibrante',
            accent: '#ef4444',
            heroImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1600&q=80',
            dark: false
        },
        'cafe-minimal': {
            id: 'cafe-minimal',
            label: 'Café Minimalista',
            accent: '#92400e',
            heroImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1600&q=80',
            dark: false
        },
        'cafe-rustic': {
            id: 'cafe-rustic',
            label: 'Rústico Acogedor',
            accent: '#b45309',
            heroImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=80',
            dark: false
        },
        'cafe-urban': {
            id: 'cafe-urban',
            label: 'Urbano Industrial',
            accent: '#64748b',
            heroImage: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1600&q=80',
            dark: true
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
        Midnight: 'rest-modern-dark',
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

    function getCategoryContent(category) {
        return SF_CATEGORY_FALLBACKS[category] || SF_CATEGORY_FALLBACKS.default;
    }

    function getTemplateMeta(templateId, category) {
        const raw = String(templateId || '').trim();
        const alias = SF_TEMPLATE_ALIASES[raw] || raw;

        const categoryFallbackMap = {
            'Restaurante': 'rest-modern-dark',
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
            : (categoryFallbackMap[category] || 'default');

        return SF_TEMPLATE_REGISTRY[key] || SF_TEMPLATE_REGISTRY.default;
    }

    function getTemplateById(templateId) {
        return SF_TEMPLATE_REGISTRY[templateId] || SF_TEMPLATE_REGISTRY.default;
    }

    function setLoading(show) {
        qs('loading')?.classList.toggle('hidden', !show);
        qs('main-content')?.classList.toggle('hidden', show);
        qs('error-view')?.classList.add('hidden');
    }

    function showError(message) {
        const msg = qs('error-message');
        if (msg) msg.textContent = message || 'Es posible que el enlace sea incorrecto o el negocio haya sido eliminado.';
        qs('loading')?.classList.add('hidden');
        qs('main-content')?.classList.add('hidden');
        qs('error-view')?.classList.remove('hidden');
        safeIcons();
    }

    function updateCartUI() {
        const totalItems = state().cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
        const count = qs('cart-count');
        if (count) count.textContent = String(totalItems);

        const cartFloat = qs('cart-float');
        if (cartFloat) {
            cartFloat.classList.toggle('hidden', totalItems === 0);
        }
    }

    function getCartTotal() {
        return state().cart.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 0)), 0);
    }

    function openCartModal() {
        renderCartItems();
        qs('cart-modal')?.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        safeIcons();
    }

    function closeCartModal() {
        qs('cart-modal')?.classList.add('hidden');
        document.body.style.overflow = '';
    }

    function renderCartItems() {
        const container = qs('cart-items');
        if (!container) return;

        const subtotal = getCartTotal();
        const total = subtotal;

        const subtotalEl = qs('cart-subtotal');
        const shippingEl = qs('cart-shipping');
        const totalEl = qs('cart-modal-total');

        if (subtotalEl) subtotalEl.textContent = money(subtotal);
        if (shippingEl) shippingEl.textContent = 'Gratis';
        if (totalEl) totalEl.textContent = money(total);

        if (!state().cart.length) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="shopping-cart" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
                    <p class="text-slate-500">Tu carrito está vacío.</p>
                </div>`;
            safeIcons();
            return;
        }

        container.innerHTML = state().cart.map(item => `
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

        safeIcons();
    }

    function addToCart(productId) {
        const product = state().products.find(p => String(p.id) === String(productId));
        if (!product) return;

        const existing = state().cart.find(item => String(item.id) === String(productId));
        if (existing) {
            existing.qty += 1;
        } else {
            state().cart.push({ ...product, qty: 1 });
        }

        updateCartUI();
        renderCartItems();
        showToast('Producto agregado al carrito', 'success');
    }

    function changeQty(productId, delta) {
        const item = state().cart.find(x => String(x.id) === String(productId));
        if (!item) return;

        item.qty += delta;
        if (item.qty <= 0) {
            state().cart = state().cart.filter(x => String(x.id) !== String(productId));
        }

        updateCartUI();
        renderCartItems();
    }

    function removeFromCart(productId) {
        state().cart = state().cart.filter(item => String(item.id) !== String(productId));
        updateCartUI();
        renderCartItems();
    }

    function buildWhatsAppMessage(customer) {
        const subtotal = getCartTotal();
        const total = subtotal;

        let message = `🛒 *NUEVO PEDIDO — ${state().business?.name || 'Negocio'}*%0A%0A`;
        message += `📦 *Productos:*%0A`;
        state().cart.forEach(item => {
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

        const name = qs('cart-name')?.value.trim();
        const phone = qs('cart-phone')?.value.trim();
        const address = qs('cart-address')?.value.trim();

        if (!name || !phone || !address) {
            showToast('Por favor completa todos los campos requeridos', 'error');
            return;
        }

        if (!state().cart.length) {
            showToast('Tu carrito está vacío', 'error');
            return;
        }

        const normalizedBusinessPhone = validateWhatsapp(state().business?.whatsapp);
        if (!normalizedBusinessPhone) {
            showToast('El negocio no tiene WhatsApp configurado', 'error');
            return;
        }

        const btn = qs('cart-submit-btn');
        const original = btn ? btn.innerHTML : '';

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<div class="sf-loading"></div> Procesando...';
        }

        const subtotal = getCartTotal();
        const total = subtotal;

        const c = client();
        if (c && state().business?.id) {
            try {
                const orderData = {
                    business_id: state().business.id,
                    customer_name: name,
                    customer_phone: phone,
                    customer_address: address,
                    subtotal,
                    total,
                    status: 'pending'
                };

                const { data: savedOrder, error } = await c
                    .from('orders')
                    .insert(orderData)
                    .select()
                    .single();

                if (error) throw error;

                if (savedOrder?.id && state().cart.length) {
                    const orderItems = state().cart.map(item => ({
                        order_id: savedOrder.id,
                        product_id: item.id,
                        quantity: item.qty,
                        price: Number(item.price || 0)
                    }));

                    const { error: itemsError } = await c.from('order_items').insert(orderItems);
                    if (itemsError) console.warn('No se pudieron guardar todos los items del pedido:', itemsError);
                }
            } catch (dbError) {
                console.warn('Error guardando orden en DB, continuando con WhatsApp:', dbError);
            }
        }

        const message = buildWhatsAppMessage({ name, phone, address });
        const waLink = `https://wa.me/${normalizedBusinessPhone}?text=${encodeURIComponent(message)}`;

        try {
            window.open(waLink, '_blank', 'noopener,noreferrer');
            showToast('Tu pedido fue preparado', 'success');
            state().cart = [];
            updateCartUI();
            renderCartItems();
            qs('checkout-form')?.reset();
            closeCartModal();
        } catch (err) {
            console.error(err);
            showToast('No se pudo abrir WhatsApp', 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = original;
            }
        }
    }

    function renderPage() {
        const business = state().business;
        if (!business) return;

        const categoryContent = getCategoryContent(business.category);
        const templateMeta = getTemplateMeta(business.template_id, business.category);
        const accent = business.brand_color || templateMeta.accent || '#4f46e5';
        const isDark = !!templateMeta.dark;

        document.title = `${business.name || 'Negocio'} | SiteFly`;

        qs('hero-category').textContent = business.category || 'Negocio Local';
        qs('hero-name').textContent = business.name || 'Mi Negocio';
        qs('hero-description').textContent = business.description || 'Negocio creado con SiteFly.';
        qs('info-description').textContent = business.description || 'Sin descripción aún.';
        qs('info-location').textContent = business.city || business.address || 'Ubicación no especificada';
        qs('info-hours').textContent = business.schedule || business.hours || 'Horario no especificado';
        qs('footer-name').textContent = `© ${new Date().getFullYear()} ${business.name || 'Mi Negocio'}. Todos los derechos reservados.`;

        qs('info-benefits').innerHTML = (categoryContent.benefits || []).map(b => `
            <div class="flex items-center gap-3">
                <i data-lucide="check-circle" class="w-5 h-5 text-green-500 flex-shrink-0"></i>
                <span>${escapeHtml(b)}</span>
            </div>
        `).join('');

        qs('info-faqs').innerHTML = (categoryContent.faqs || []).map(f => `
            <div class="bg-slate-50 p-4 rounded-xl">
                <h4 class="font-semibold mb-1 text-slate-900">${escapeHtml(f.q)}</h4>
                <p class="text-sm text-slate-600">${escapeHtml(f.a)}</p>
            </div>
        `).join('') || '<p class="text-slate-600">No hay preguntas frecuentes registradas.</p>';

        const wa = validateWhatsapp(business.whatsapp);
        const heroBtn = qs('hero-whatsapp-btn');
        const floatBtn = qs('whatsapp-float');

        if (wa) {
            const link = `https://wa.me/${wa}`;
            heroBtn.href = link;
            floatBtn.href = link;
            heroBtn.classList.remove('hidden');
            floatBtn.classList.remove('hidden');
        } else {
            heroBtn.classList.add('hidden');
            floatBtn.classList.add('hidden');
        }

        const heroSection = qs('hero-section');
        if (heroSection) {
            heroSection.style.backgroundImage = `url('${templateMeta.heroImage || SF_TEMPLATE_REGISTRY.default.heroImage}')`;
            heroSection.style.backgroundColor = isDark ? '#0f172a' : '#ffffff';
        }

        const mainContent = qs('main-content');
        if (mainContent) {
            mainContent.style.backgroundColor = isDark ? '#f8fafc' : '#ffffff';
        }

        renderProducts();

        if (heroBtn) {
            heroBtn.style.backgroundColor = accent;
            heroBtn.style.boxShadow = `0 10px 25px -10px ${accent}55`;
        }

        if (floatBtn) {
            floatBtn.style.backgroundColor = accent;
            floatBtn.style.boxShadow = `0 10px 25px -10px ${accent}55`;
        }

        safeIcons();
    }

    function renderProducts() {
        const container = qs('products-grid');
        if (!container) return;

        if (!Array.isArray(state().products) || !state().products.length) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-slate-500 text-lg">No hay productos disponibles aún.</p>
                    <p class="text-slate-400 text-sm mt-2">Contacta al negocio para más información.</p>
                </div>`;
            updateCartUI();
            safeIcons();
            return;
        }

        container.innerHTML = state().products.map((p) => `
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

        safeIcons();
    }

    async function initBusinessPage() {
        const businessKey = getBusinessSlug();
        const s = state();

        if (!businessKey && !s.business?.id && !s.business?.slug) {
            showError('No se encontró el negocio en la URL.');
            return;
        }

        setLoading(true);

        try {
            const c = client();
            let business = s.business || null;

            if (c && typeof c.from === 'function') {
                if (businessKey) {
                    const slugResult = await c
                        .from('businesses')
                        .select('*')
                        .eq('slug', businessKey)
                        .maybeSingle();

                    if (slugResult?.data) {
                        business = slugResult.data;
                    } else {
                        const idResult = await c
                            .from('businesses')
                            .select('*')
                            .eq('id', businessKey)
                            .maybeSingle();

                        if (idResult?.data) business = idResult.data;
                    }
                }

                if (!business && s.businessId) {
                    const byIdResult = await c
                        .from('businesses')
                        .select('*')
                        .eq('id', s.businessId)
                        .maybeSingle();

                    if (byIdResult?.data) business = byIdResult.data;
                }
            }

            if (!business) {
                showError('No encontramos ese negocio.');
                return;
            }

            s.business = business;
            s.businessId = business.id || s.businessId || null;
            s.currentTemplate = business.template_id || s.currentTemplate || 'default';

            if (client() && s.businessId) {
                const productsResult = await client()
                    .from('products')
                    .select('*')
                    .eq('business_id', s.businessId)
                    .eq('active', true)
                    .order('created_at', { ascending: false });

                s.products = Array.isArray(productsResult?.data) ? productsResult.data : [];
            } else {
                s.products = s.products || [];
            }

            renderPage();
            updateCartUI();

            setLoading(false);
            safeIcons();
        } catch (error) {
            console.error('Error initializing page:', error);
            showError('Error cargando el negocio.');
        }
    }

    function exposeGlobals() {
        window.addToCart = addToCart;
        window.removeFromCart = removeFromCart;
        window.changeQty = changeQty;
        window.openCartModal = openCartModal;
        window.closeCartModal = closeCartModal;
        window.submitOrder = submitOrder;

        window.validateWhatsapp = validateWhatsapp;
        window.escapeHtml = escapeHtml;
        window.getCartTotal = getCartTotal;
    }

    document.addEventListener('DOMContentLoaded', () => {
        exposeGlobals();
        initBusinessPage();
    });

    window.addEventListener('load', () => {
        safeIcons();
    });
})();
