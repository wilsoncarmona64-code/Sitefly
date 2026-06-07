// ===== SISTEMA DE PAGOS Y PLANES (FASE 3) =====

// Abrir modal de pago
function sf_openPaymentModal() {
    const modal = document.getElementById('sf-payment-modal');
    if (modal) {
        modal.classList.remove('sf-hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// Cerrar modal de pago
function sf_closePaymentModal() {
    const modal = document.getElementById('sf-payment-modal');
    if (modal) modal.classList.add('sf-hidden');
}

// Simular pago con tarjeta
async function sf_processPayment() {
    const btn = document.getElementById('sf-pay-btn');
    const originalHtml = btn.innerHTML;
    
    // Validar campos
    const cardNumber = document.getElementById('sf-card-number')?.value || '';
    const expiry = document.getElementById('sf-card-expiry')?.value || '';
    const cvc = document.getElementById('sf-card-cvc')?.value || '';
    
    if (!cardNumber || !expiry || !cvc) {
        sf_showToast('Por favor completa todos los campos', 'error');
        return;
    }
    
    // Simular procesamiento
    btn.innerHTML = '<div class="sf-loading"></div> Procesando...';
    btn.disabled = true;
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Activar plan Pro
    await sf_activateProPlan();
    
    btn.innerHTML = originalHtml;
    btn.disabled = false;
    sf_closePaymentModal();
    sf_showToast('¡Plan Pro activado exitosamente!', 'success');
}

// Activar plan Pro en Supabase
async function sf_activateProPlan() {
    if (!supabaseClient || !sf_state.businessId) return false;
    
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    
    const { error } = await supabaseClient
        .from('businesses')
        .update({
            plan: 'pro',
            plan_expires_at: expiresAt.toISOString()
        })
        .eq('id', sf_state.businessId);
    
    if (error) {
        console.error('Error activating Pro plan:', error);
        sf_showToast('Error al activar plan Pro', 'error');
        return false;
    }
    
    sf_state.plan = 'pro';
    sf_state.planExpiresAt = expiresAt;
    sf_updatePlanBadge();
    return true;
}

// Verificar estado del plan y mostrar banner si vence pronto
async function sf_checkPlanStatus() {
    if (!sf_state.planExpiresAt) return;
    
    const now = new Date();
    const expires = new Date(sf_state.planExpiresAt);
    const daysLeft = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
    
    const banner = document.getElementById('sf-plan-banner');
    if (banner) {
        if (daysLeft <= 7 && daysLeft > 0) {
            banner.innerHTML = `⚠️ Tu plan Pro vence en ${daysLeft} día${daysLeft === 1 ? '' : 's'}. <button onclick="sf_openPaymentModal()" class="underline font-semibold ml-2">Renovar</button>`;
            banner.classList.remove('sf-hidden');
        } else if (daysLeft <= 0) {
            banner.innerHTML = `❌ Tu plan Pro ha vencido. <button onclick="sf_openPaymentModal()" class="underline font-semibold ml-2">Renovar ahora</button>`;
            banner.classList.remove('sf-hidden');
            sf_state.plan = 'free';
        }
    }
}

// Actualizar badge del plan en UI
function sf_updatePlanBadge() {
    const badge = document.getElementById('sf-plan-badge');
    if (badge) {
        badge.textContent = sf_state.plan === 'pro' ? 'PRO' : 'FREE';
        badge.className = sf_state.plan === 'pro' 
            ? 'px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full'
            : 'px-2 py-1 bg-slate-700 text-slate-300 text-xs font-bold rounded-full';
    }
}

// ===== SISTEMA DE CUPONES =====

// Renderizar lista de cupones en admin
async function sf_renderCoupons() {
    const container = document.getElementById('sf-coupons-list');
    if (!container) return;
    
    if (!supabaseClient || !sf_state.businessId) {
        container.innerHTML = '<p class="text-slate-500 text-center py-4">Cargando...</p>';
        return;
    }
    
    const { data, error } = await supabaseClient
        .from('coupons')
        .select('*')
        .eq('business_id', sf_state.businessId)
        .order('created_at', { ascending: false });
    
    if (error) {
        container.innerHTML = '<p class="text-red-400 text-center py-4">Error al cargar cupones</p>';
        return;
    }
    
    sf_state.coupons = data || [];
    
    if (data.length === 0) {
        container.innerHTML = '<p class="text-slate-500 text-center py-4">No hay cupones creados</p>';
        return;
    }
    
    container.innerHTML = data.map(coupon => {
        const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
        const isMaxed = coupon.max_uses && coupon.used_count >= coupon.max_uses;
        const isActive = !isExpired && !isMaxed;
        
        return `
        <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4">
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                    <span class="font-mono font-bold text-indigo-400">${sf_escapeHtml(coupon.code)}</span>
                    ${isActive ? '<span class="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">Activo</span>' : '<span class="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">Inactivo</span>'}
                </div>
                <div class="text-sm text-slate-400">
                    ${coupon.discount_percent}% de descuento • 
                    Usado: ${coupon.used_count}${coupon.max_uses ? '/' + coupon.max_uses : ''} veces
                    ${coupon.expires_at ? '• Vence: ' + new Date(coupon.expires_at).toLocaleDateString() : ''}
                </div>
            </div>
            <button onclick="sf_deleteCoupon('${coupon.id}')" class="p-2 text-slate-400 hover:text-red-400 transition-colors">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        </div>
        `;
    }).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Crear nuevo cupón
async function sf_createCoupon() {
    const code = document.getElementById('sf-coupon-code')?.value?.toUpperCase().trim();
    const discount = parseInt(document.getElementById('sf-coupon-discount')?.value) || 0;
    const maxUses = document.getElementById('sf-coupon-max-uses')?.value || null;
    const expiresDate = document.getElementById('sf-coupon-expires')?.value || null;
    
    if (!code || !discount) {
        sf_showToast('Código y porcentaje son requeridos', 'error');
        return;
    }
    
    if (discount < 1 || discount > 100) {
        sf_showToast('El descuento debe ser entre 1% y 100%', 'error');
        return;
    }
    
    const couponData = {
        business_id: sf_state.businessId,
        code: code,
        discount_percent: discount,
        max_uses: maxUses ? parseInt(maxUses) : null,
        expires_at: expiresDate ? new Date(expiresDate).toISOString() : null
    };
    
    const { error } = await supabaseClient
        .from('coupons')
        .insert(couponData);
    
    if (error) {
        console.error('Error creating coupon:', error);
        if (error.code === '23505') {
            sf_showToast('Este código ya existe', 'error');
        } else {
            sf_showToast('Error al crear cupón: ' + error.message, 'error');
        }
        return;
    }
    
    sf_showToast('Cupón creado exitosamente', 'success');
    
    // Limpiar formulario
    if (document.getElementById('sf-coupon-code')) document.getElementById('sf-coupon-code').value = '';
    if (document.getElementById('sf-coupon-discount')) document.getElementById('sf-coupon-discount').value = '';
    if (document.getElementById('sf-coupon-max-uses')) document.getElementById('sf-coupon-max-uses').value = '';
    if (document.getElementById('sf-coupon-expires')) document.getElementById('sf-coupon-expires').value = '';
    
    await sf_renderCoupons();
}

// Eliminar cupón
async function sf_deleteCoupon(id) {
    if (!confirm('¿Estás seguro de eliminar este cupón?')) return;
    
    const { error } = await supabaseClient
        .from('coupons')
        .delete()
        .eq('id', id);
    
    if (error) {
        sf_showToast('Error al eliminar cupón', 'error');
        return;
    }
    
    sf_showToast('Cupón eliminado', 'success');
    await sf_renderCoupons();
}

// Validar cupón en tiempo real (para página pública)
async function sf_validateCoupon(code, businessId) {
    if (!supabaseClient || !code || !businessId) return null;
    
    const { data, error } = await supabaseClient
        .from('coupons')
        .select('*')
        .eq('business_id', businessId)
        .eq('code', code.toUpperCase())
        .single();
    
    if (error || !data) {
        return { valid: false, message: 'Cupón no válido' };
    }
    
    const isExpired = data.expires_at && new Date(data.expires_at) < new Date();
    const isMaxed = data.max_uses && data.used_count >= data.max_uses;
    
    if (isExpired) {
        return { valid: false, message: 'Cupón expirado' };
    }
    
    if (isMaxed) {
        return { valid: false, message: 'Cupón agotado' };
    }
    
    return {
        valid: true,
        discount: data.discount_percent,
        code: data.code
    };
}

// ===== ANALYTICS =====

// Registrar visita a página pública
async function sf_trackPageView(businessId) {
    if (!supabaseClient || !businessId) return;
    
    const deviceType = /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
    
    await supabaseClient
        .from('page_views')
        .insert({
            business_id: businessId,
            device_type: deviceType,
            user_agent: navigator.userAgent
        });
}

// Cargar analytics para dashboard
async function sf_loadAnalytics() {
    if (!supabaseClient || !sf_state.businessId) return;
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    // Visitas hoy
    const { count: todayCount } = await supabaseClient
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', sf_state.businessId)
        .gte('viewed_at', todayStart);
    
    // Visitas esta semana
    const { count: weekCount } = await supabaseClient
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', sf_state.businessId)
        .gte('viewed_at', weekAgo);
    
    // Pedidos esta semana
    const { count: ordersCount } = await supabaseClient
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', sf_state.businessId)
        .gte('created_at', weekAgo);
    
    sf_state.analytics = {
        today: todayCount || 0,
        week: weekCount || 0,
        conversion: weekCount > 0 ? ((ordersCount || 0) / weekCount * 100).toFixed(1) : 0
    };
    
    sf_renderAnalytics();
}

// Renderizar analytics en dashboard
function sf_renderAnalytics() {
    const todayEl = document.getElementById('sf-analytics-today');
    const weekEl = document.getElementById('sf-analytics-week');
    const conversionEl = document.getElementById('sf-analytics-conversion');
    
    if (todayEl) todayEl.textContent = sf_state.analytics.today;
    if (weekEl) weekEl.textContent = sf_state.analytics.week;
    if (conversionEl) conversionEl.textContent = sf_state.analytics.conversion + '%';
}

// ===== NOTIFICACIONES PUSH (SIMULADAS) =====

// Iniciar polling para pedidos nuevos
function sf_startOrderPolling() {
    if (sf_orderPollingInterval) clearInterval(sf_orderPollingInterval);
    
    sf_orderPollingInterval = setInterval(async () => {
        if (!supabaseClient || !sf_state.businessId) return;
        
        const { data, error } = await supabaseClient
            .from('orders')
            .select('id', { count: 'exact' })
            .eq('business_id', sf_state.businessId)
            .eq('status', 'Pendiente');
        
        if (error) return;
        
        const newCount = data?.length || 0;
        
        if (newCount > sf_lastOrderCount && newCount > 0) {
            // Pedido nuevo detectado
            sf_showNotification('🛒 ¡Nuevo pedido recibido!', 'Un cliente acaba de hacer un pedido.');
            sf_playNotificationSound();
            sf_updateTitleBadge(newCount);
        }
        
        sf_lastOrderCount = newCount;
    }, 30000); // Cada 30 segundos
}

// Detener polling
function sf_stopOrderPolling() {
    if (sf_orderPollingInterval) {
        clearInterval(sf_orderPollingInterval);
        sf_orderPollingInterval = null;
    }
}

// Mostrar notificación
function sf_showNotification(title, message) {
    const container = document.getElementById('sf-notification-container') || createNotificationContainer();
    
    const notification = document.createElement('div');
    notification.className = 'sf-notification sf-animate-up';
    notification.innerHTML = `
        <div class="flex items-start gap-3">
            <div class="text-2xl">🔔</div>
            <div class="flex-1">
                <div class="font-semibold text-white">${sf_escapeHtml(title)}</div>
                <div class="text-sm text-slate-300">${sf_escapeHtml(message)}</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="text-slate-400 hover:text-white">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>
    `;
    
    container.appendChild(notification);
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    // Auto-remove después de 5 segundos
    setTimeout(() => notification.remove(), 5000);
}

// Crear contenedor de notificaciones
function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'sf-notification-container';
    container.className = 'fixed top-4 right-4 z-50 space-y-2 max-w-sm';
    document.body.appendChild(container);
    return container;
}

// Reproducir sonido de notificación
function sf_playNotificationSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Actualizar badge en título del navegador
function sf_updateTitleBadge(count) {
    if (count > 0) {
        document.title = `(${count}) SiteFly`;
    } else {
        document.title = 'SiteFly';
    }
}
