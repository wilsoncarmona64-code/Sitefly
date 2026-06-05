function sf_showPreview() {
    const cat = sf_state.userData.category || 'default';
    const content = sf_ai_content[cat] || sf_ai_content['default'];
    const template = content.templates.find(t => t.name === sf_state.currentTemplate) || content.templates[0];
    const data = sf_state.userData;
    const businessName = data.name || 'Mi Negocio';
    const whatsapp = sf_validateWhatsapp(data.whatsapp);

    document.getElementById('sf-preview-domain').textContent = businessName.toLowerCase().replace(/\s+/g, '-') + '.sitefly.app';

    const safeName = sf_escapeHtml(businessName);
    const safeDesc = sf_escapeHtml(data.description);
    const safeLocation = sf_escapeHtml(data.location || 'San José');
    const safeHours = sf_escapeHtml(data.hours);
    const safeCategory = sf_escapeHtml(data.category || 'Negocio');

    const benefitsHtml = content.benefits.map(b => `<div class="flex items-center gap-3 mb-3"><i data-lucide="check-circle" class="w-5 h-5 flex-shrink-0" style="color: ${template.accent}"></i><span>${sf_escapeHtml(b)}</span></div>`).join('');
    const faqsHtml = content.faqs.map(f => `<div class="mb-4"><h4 class="font-bold mb-1">${sf_escapeHtml(f.q)}</h4><p class="text-sm opacity-80">${sf_escapeHtml(f.a)}</p></div>`).join('');

    const isDark = template.theme === 'theme-midnight' || template.theme === 'theme-garage';
    const textColor = isDark ? '#f5f5f5' : '#111';
    const bgAlt = template.theme === 'theme-midnight' ? '#1a1a1a' : (template.theme === 'theme-garage' ? '#292524' : (template.theme === 'theme-print' ? '#f0f9ff' : '#f8fafc'));
    const cardBg = isDark ? '#1a1a1a' : 'white';
    const cardBorder = isDark ? '#333' : '#e2e8f0';

    const productsHtml = sf_state.products.length > 0 ? sf_state.products.map(p => `
        <div class="sf-preview-product-card" style="background: ${cardBg}; color: ${textColor}; border: 1px solid ${cardBorder}">
            <div class="h-48 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                <i data-lucide="package" class="w-12 h-12 text-slate-400"></i>
            </div>
            <div class="p-4">
                <h4 class="font-bold text-lg mb-1">${sf_escapeHtml(p.name)}</h4>
                <p class="text-sm opacity-70 mb-3">${sf_escapeHtml(p.description || '')}</p>
                <div class="flex items-center justify-between">
                    <span class="text-xl font-bold" style="color: ${template.accent}">$${p.price.toFixed(2)}</span>
                    <button id="sf-add-btn-${p.id}" onclick="sf_addToCart('${p.id}')" class="text-sm font-medium px-3 py-1.5 rounded-lg text-white flex items-center gap-1 transition-colors" style="background: ${template.accent}">
                        <i data-lucide="plus" class="w-4 h-4"></i> Agregar
                    </button>
                </div>
            </div>
        </div>
    `).join('') : '<p class="text-center opacity-60 py-8 col-span-3">Aún no hay productos.</p>';

    const whatsappBtn = whatsapp ? `
        <a href="https://wa.me/${whatsapp}" target="_blank" class="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition-transform hover:scale-105 text-white" style="background: ${template.accent}">
            <i data-lucide="message-circle" class="w-5 h-5"></i> Contáctanos por WhatsApp
        </a>
    ` : `
        <div class="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg bg-slate-600 text-white opacity-60">
            <i data-lucide="alert-circle" class="w-5 h-5"></i> WhatsApp no configurado
        </div>
    `;

    const whatsappFloat = whatsapp ? `
        <a href="https://wa.me/${whatsapp}" target="_blank" class="sf-whatsapp-float">
            <i data-lucide="message-circle" class="w-7 h-7 text-white"></i>
        </a>
    ` : '';

    const previewHtml = `
        <div style="background: ${isDark ? '#0a0a0a' : 'white'}; color: ${textColor}; min-height: 100%;">
            <section class="sf-preview-hero" style="background-image: url('${template.img}')">
                <div class="sf-preview-hero-overlay"></div>
                <div class="sf-preview-hero-content">
                    <p class="text-sm uppercase tracking-widest mb-4 opacity-80">${safeCategory}</p>
                    <h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">${safeName}</h1>
                    <p class="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">${safeDesc}</p>
                    ${whatsappBtn}
                </div>
            </section>

            <section class="sf-preview-section" style="background: ${bgAlt}">
                <div class="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <p class="text-sm uppercase tracking-widest mb-2 opacity-60">Sobre nosotros</p>
                        <h2 class="text-4xl font-bold mb-6">Bienvenidos</h2>
                        <p class="text-lg opacity-80 leading-relaxed mb-6">${safeDesc}</p>
                        <div class="space-y-2 mb-6">${benefitsHtml}</div>
                        <div class="flex flex-wrap items-center gap-4 text-sm opacity-70">
                            <span class="flex items-center gap-1"><i data-lucide="map-pin" class="w-4 h-4"></i> ${safeLocation}</span>
                            <span class="flex items-center gap-1"><i data-lucide="clock" class="w-4 h-4"></i> ${safeHours}</span>
                        </div>
                    </div>
                    <div class="rounded-2xl p-6" style="background: ${template.accent}20">
                        <h3 class="text-2xl font-bold mb-4">Preguntas Frecuentes</h3>
                        ${faqsHtml}
                    </div>
                </div>
            </section>

            <section class="sf-preview-section">
                <div class="max-w-6xl mx-auto">
                    <p class="text-sm uppercase tracking-widest mb-2 opacity-60 text-center">Nuestro catálogo</p>
                    <h2 class="text-4xl font-bold mb-8 text-center">Productos y Servicios</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${productsHtml}
                    </div>
                    ${sf_state.cart.length > 0 ? `
                    <div class="mt-8 text-center">
                        <button onclick="sf_showCheckout()" class="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg text-white transition-transform hover:scale-105" style="background: ${template.accent}">
                            <i data-lucide="shopping-cart" class="w-5 h-5"></i>
                            Ver Carrito (${sf_state.cart.reduce((sum, item) => sum + item.qty, 0)} items) - $${sf_getCartTotal().toFixed(2)}
                        </button>
                    </div>
                    ` : ''}
                </div>
            </section>

            <footer class="py-8 text-center text-sm opacity-60 border-t border-current border-opacity-20">
                <p>© 2024 ${safeName}. Todos los derechos reservados.</p>
                <p class="mt-2">Creado con ❤️ por <span class="font-bold">SiteFly</span></p>
            </footer>

            ${whatsappFloat}
        </div>
    `;

    document.getElementById('sf-preview-content').innerHTML = previewHtml;
    document.getElementById('sf-view-preview').classList.remove('sf-hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function sf_hidePreview() {
    document.getElementById('sf-view-preview').classList.add('sf-hidden');
}
