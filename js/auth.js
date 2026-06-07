// ===== LOGIN =====
async function sf_handleLogin() {
    const email = document.getElementById('sf-login-email').value;
    if (!email) { 
        document.getElementById('sf-login-email').classList.add('border-red-500');
        sf_showToast('Por favor ingresa tu correo electrónico', 'error');
        return; 
    }
    
    const btn = document.getElementById('sf-login-btn');
    const originalBtnText = btn.innerHTML;
    btn.innerHTML = '<div class="sf-loading"></div> Enviando...';
    
    // Check if we're handling a callback from Supabase
    const hash = window.location.hash;
    if (hash && (hash.includes('access_token') || hash.includes('type=recovery'))) {
        console.log('Handling auth callback from URL');
        return;
    }

    if (supabaseClient) {
        const { error } = await supabaseClient.auth.signInWithOtp({ 
            email,
            options: { 
                emailRedirectTo: window.location.origin + window.location.pathname,
                shouldCreateUser: true
            } 
        });
        
        if (error) { 
            console.error('Login error:', error);
            sf_showToast('Error: ' + error.message, 'error');
            btn.innerHTML = originalBtnText;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return; 
        }
        
        sf_showToast('¡Revisa tu correo! Hemos enviado un enlace mágico.', 'success');
        btn.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i> Enlace enviado';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        localStorage.setItem('sf_pending_email', email);
        
        setTimeout(() => {
            btn.innerHTML = originalBtnText;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 3000);
    } else {
        sf_showToast('Supabase no está disponible. Usando modo demo.', 'warning');
        sf_proceedToDemo(email);
    }
}

function sf_proceedToDemo(email) {
    sf_state.userId = 'demo-' + Date.now();
    const btn = document.getElementById('sf-login-btn');
    btn.innerHTML = '<i data-lucide="check" class="w-5 h-5"></i> ¡Acceso concedido!';
    btn.classList.add('bg-green-600');
    if (typeof lucide !== 'undefined') lucide.createIcons();
    setTimeout(() => { sf_showView('chat'); sf_initChat(); }, 1000);
}

// ===== SUPABASE AUTH LISTENER =====
if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session) {
            sf_state.userId = session.user.id;
            sf_state.session = session;
            console.log('User signed in:', sf_state.userId);

            const { data: business, error } = await supabaseClient
                .from('businesses')
                .select('*')
                .eq('user_id', sf_state.userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error loading business:', error);
                sf_showToast('Error al cargar tu negocio: ' + error.message, 'error');
                return;
            }

            if (!business) {
                sf_showView('chat');
                sf_initChat();
            } else {
                sf_state.businessId = business.id;
                sf_state.userData = {
                    category: business.category || '',
                    name: business.name || '',
                    description: business.description || '',
                    location: business.location || '',
                    whatsapp: business.whatsapp || '',
                    hours: business.hours || 'Lun - Dom: 8:00 AM - 10:00 PM'
                };
                sf_state.currentTemplate = business.template || 'Moderno';
                sf_state.plan = business.plan || 'FREE';

                await sf_loadProducts();
                await sf_loadOrders();

                sf_showView('admin');
                sf_initAdmin();
                sf_showToast('¡Bienvenido de vuelta!', 'success');
            }
        }
    });
}

// ===== SUPABASE DATA OPERATIONS =====
async function sf_createBusiness() {
    if (!supabaseClient || !sf_state.userId) return null;

    const { data: existing, error: checkError } = await supabaseClient
        .from('businesses')
        .select('id')
        .eq('user_id', sf_state.userId)
        .single();

    if (existing) {
        sf_state.businessId = existing.id;
        return existing;
    }

    const { data, error } = await supabaseClient
        .from('businesses')
        .insert({
            user_id: sf_state.userId,
            name: sf_state.userData.name,
            category: sf_state.userData.category,
            description: sf_state.userData.description,
            location: sf_state.userData.location,
            whatsapp: sf_state.userData.whatsapp,
            hours: sf_state.userData.hours,
            template: sf_state.currentTemplate,
            plan: sf_state.plan
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating business:', error);
        sf_showToast('Error al crear negocio: ' + error.message, 'error');
        return null;
    }

    sf_state.businessId = data.id;
    return data;
}

async function sf_saveBusiness() {
    if (!supabaseClient || !sf_state.businessId) return;

    const { error } = await supabaseClient
        .from('businesses')
        .update({
            name: sf_state.userData.name,
            category: sf_state.userData.category,
            description: sf_state.userData.description,
            location: sf_state.userData.location,
            whatsapp: sf_state.userData.whatsapp,
            hours: sf_state.userData.hours,
            template: sf_state.currentTemplate
        })
        .eq('id', sf_state.businessId);

    if (error) {
        console.error('Error saving business:', error);
        sf_showToast('Error al guardar: ' + error.message, 'error');
    } else {
        sf_showToast('Cambios guardados', 'success');
    }
}

async function sf_loadProducts() {
    if (!supabaseClient || !sf_state.businessId) return;

    const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('business_id', sf_state.businessId)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error loading products:', error);
        sf_showToast('Error al cargar productos', 'error');
        return;
    }

    sf_state.products = data || [];
}

async function sf_saveProduct(product) {
    if (!supabaseClient || !sf_state.businessId) return null;

    if (product.id && !product.id.toString().startsWith('demo-')) {
        const { error } = await supabaseClient
            .from('products')
            .update({
                name: product.name,
                description: product.description,
                price: product.price
            })
            .eq('id', product.id);

        if (error) {
            console.error('Error updating product:', error);
            sf_showToast('Error al actualizar producto', 'error');
            return null;
        }
        return product;
    } else {
        const { data, error } = await supabaseClient
            .from('products')
            .insert({
                business_id: sf_state.businessId,
                name: product.name,
                description: product.description,
                price: product.price
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating product:', error);
            sf_showToast('Error al crear producto', 'error');
            return null;
        }

        return data;
    }
}

async function sf_deleteProductFromDB(productId) {
    if (!supabaseClient || productId.toString().startsWith('demo-')) return;

    const { error } = await supabaseClient
        .from('products')
        .delete()
        .eq('id', productId);

    if (error) {
        console.error('Error deleting product:', error);
        sf_showToast('Error al eliminar producto', 'error');
    }
}

async function sf_loadOrders() {
    if (!supabaseClient || !sf_state.businessId) return;

    const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('business_id', sf_state.businessId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading orders:', error);
        sf_showToast('Error al cargar pedidos', 'error');
        return;
    }

    sf_state.orders = data || [];
}

async function sf_saveOrder(order) {
    if (!supabaseClient || !sf_state.businessId) return null;

    const { data, error } = await supabaseClient
        .from('orders')
        .insert({
            business_id: sf_state.businessId,
            customer_name: order.customer_name,
            customer_phone: order.customer_phone,
            customer_address: order.customer_address,
            subtotal: order.subtotal,
            shipping: order.shipping,
            total: order.total,
            status: order.status,
            invoice_type: order.invoice_type,
            invoice_razon: order.invoice_razon,
            invoice_doc: order.invoice_doc,
            invoice_email: order.invoice_email
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating order:', error);
        sf_showToast('Error al crear pedido', 'error');
        return null;
    }

    for (const item of order.items) {
        await supabaseClient
            .from('order_items')
            .insert({
                order_id: data.id,
                product_id: item.id,
                product_name: item.name,
                quantity: item.qty,
                unit_price: item.price,
                total_price: item.price * item.qty
            });
    }

    return data;
}

async function sf_updateOrderStatus(orderId, newStatus) {
    if (!supabaseClient || orderId.toString().startsWith('demo-')) return;

    const { error } = await supabaseClient
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

    if (error) {
        console.error('Error updating order status:', error);
        sf_showToast('Error al actualizar estado', 'error');
        return;
    }

    const order = sf_state.orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        sf_renderOrders();
        sf_showToast('Estado actualizado', 'success');
    }
}
