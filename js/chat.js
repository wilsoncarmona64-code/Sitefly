// js/chat.js
(function () {
    'use strict';

    const CHAT = {
        step: 0,
        started: false,
        busy: false,
        answerMap: {
            1: 'name',
            2: 'description',
            3: 'location',
            4: 'whatsapp'
        },

        init() {
            window.startOnboarding = this.startOnboarding.bind(this);
            window.selectCategory = this.selectCategory.bind(this);
            window.selectTemplate = this.selectTemplate.bind(this);
            window.sf_submitText = this.submitText.bind(this);
            window.sf_finishChat = this.finishChat.bind(this);
            window.sf_runGeneration = this.runGeneration.bind(this);
            window.sf_createBusiness = this.createBusiness.bind(this);
            window.sf_saveProduct = this.saveProduct.bind(this);

            document.addEventListener('DOMContentLoaded', () => {
                this.bindInput();
                this.safeIcons();
            });
        },

        safeIcons() {
            if (typeof window.sf_safeCreateIcons === 'function') {
                window.sf_safeCreateIcons();
            } else if (typeof lucide !== 'undefined' && lucide && typeof lucide.createIcons === 'function') {
                lucide.createIcons();
            }
        },

        getHistoryEl() {
            return document.getElementById('sf-chat-messages') || document.getElementById('chat-history');
        },

        getInputAreaEl() {
            return document.getElementById('sf-chat-input-container') || document.getElementById('input-area');
        },

        getState() {
            if (!window.sf_state) window.sf_state = {};
            if (!window.sf_state.userData) {
                window.sf_state.userData = {
                    category: '',
                    name: '',
                    description: '',
                    location: '',
                    address: '',
                    whatsapp: '',
                    hours: 'Lun - Dom: 8:00 AM - 10:00 PM',
                    schedule: 'Lun - Dom: 8:00 AM - 10:00 PM',
                    logo: '',
                    brandColor: '#6366f1',
                    template: '',
                    template_id: ''
                };
            }
            if (!Array.isArray(window.sf_state.products)) window.sf_state.products = [];
            if (!Array.isArray(window.sf_state.cart)) window.sf_state.cart = [];
            if (!window.sf_state.config) {
                window.sf_state.config = { categories: [], templates: [] };
            }
            return window.sf_state;
        },

        bindInput() {
            const input = document.getElementById('user-input') || document.getElementById('sf-chat-text-input');
            if (!input) return;

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.submitText();
                }
            });
        },

        clearInputArea() {
            const area = this.getInputAreaEl();
            if (!area) return;
            area.innerHTML = '';
            area.classList.remove('hidden');
        },

        hideInputArea() {
            const area = this.getInputAreaEl();
            if (!area) return;
            area.classList.add('hidden');
        },

        setInputHtml(html) {
            const area = this.getInputAreaEl();
            if (!area) return;
            area.classList.remove('hidden');
            area.innerHTML = html;
            this.safeIcons();

            const input = document.getElementById('sf-chat-text-input') || document.getElementById('user-input');
            if (input) {
                input.focus();
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.submitText();
                    }
                });
            }
        },

        addAiMessage(text) {
            const history = this.getHistoryEl();
            if (!history) return;

            const box = document.createElement('div');
            box.className = 'message flex gap-4';
            box.innerHTML = `
                <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <i data-lucide="bot" class="w-6 h-6"></i>
                </div>
                <div class="bg-gray-800 p-4 rounded-2xl rounded-tl-none max-w-[85%] border border-gray-700 shadow-lg">
                    <p>${this.escape(text)}</p>
                </div>
            `;
            history.appendChild(box);
            history.scrollTop = history.scrollHeight;
            this.safeIcons();
        },

        addUserMessage(text) {
            const history = this.getHistoryEl();
            if (!history) return;

            const box = document.createElement('div');
            box.className = 'message flex gap-4 justify-end';
            box.innerHTML = `
                <div class="bg-blue-600 p-4 rounded-2xl rounded-tr-none max-w-[85%] shadow-lg">
                    <p>${this.escape(text)}</p>
                </div>
                <div class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                    <i data-lucide="user" class="w-6 h-6"></i>
                </div>
            `;
            history.appendChild(box);
            history.scrollTop = history.scrollHeight;
            this.safeIcons();
        },

        addTypingIndicator() {
            const history = this.getHistoryEl();
            if (!history || document.getElementById('sf-typing-indicator')) return;

            const box = document.createElement('div');
            box.id = 'sf-typing-indicator';
            box.className = 'message flex gap-4';
            box.innerHTML = `
                <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <i data-lucide="bot" class="w-6 h-6"></i>
                </div>
                <div class="bg-gray-800 p-4 rounded-2xl rounded-tl-none max-w-[85%] border border-gray-700 shadow-lg flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                    <span class="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style="animation-delay:.15s"></span>
                    <span class="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style="animation-delay:.3s"></span>
                </div>
            `;
            history.appendChild(box);
            history.scrollTop = history.scrollHeight;
            this.safeIcons();
        },

        removeTypingIndicator() {
            document.getElementById('sf-typing-indicator')?.remove();
        },

        escape(value) {
            return String(value ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        },

        startOnboarding() {
            const state = this.getState();
            state.userData = state.userData || {};
            state.userData.category = '';
            state.userData.name = '';
            state.userData.description = '';
            state.userData.location = '';
            state.userData.address = '';
            state.userData.whatsapp = '';
            state.userData.template = '';
            state.userData.template_id = '';
            state.products = [];
            state.cart = [];
            state.businessId = null;

            this.started = true;
            this.step = 0;

            this.addAiMessage('Hola 👋 Soy SiteFly. Voy a crear tu negocio digital.');
            setTimeout(() => {
                this.addAiMessage('Solo necesito 6 datos y te dejo todo listo.');
                this.renderStep();
            }, 500);
        },

        renderStep() {
            if (this.busy) return;

            const state = this.getState();

            switch (this.step) {
                case 0:
                    this.addAiMessage('¿Qué tipo de negocio vas a crear?');
                    this.renderCategories();
                    break;

                case 1:
                    this.addAiMessage('¿Cuál es el nombre de tu negocio?');
                    this.renderTextInput('Ej: Jale Costura y Sublimado', 'name');
                    break;

                case 2:
                    this.addAiMessage('Cuéntame brevemente qué haces o qué vendes.');
                    this.renderTextInput('Ej: Creamos prendas personalizadas y sublimados', 'description');
                    break;

                case 3:
                    this.addAiMessage('¿En qué ciudad o dirección estás ubicado?');
                    this.renderTextInput('Ej: San José, Pavas', 'location');
                    break;

                case 4:
                    this.addAiMessage('¿Cuál es tu número de WhatsApp para recibir pedidos?');
                    this.renderTextInput('+506 8888 8888', 'whatsapp', true);
                    break;

                case 5:
                    this.addAiMessage('Elige el estilo visual que más te guste para tu web.');
                    this.renderTemplates(state.userData.category || 'Otro');
                    break;

                case 6:
                    this.finishChat();
                    break;

                default:
                    this.finishChat();
                    break;
            }
        },

        renderCategories() {
            const state = this.getState();
            const area = this.getInputAreaEl();
            if (!area) return;

            const categories = (state.config?.categories && state.config.categories.length > 0)
                ? state.config.categories
                : ['Restaurante', 'Cafetería', 'Barbería', 'Tienda de ropa', 'Ferretería', 'Taller mecánico', 'Otro'];

            area.classList.remove('hidden');
            area.innerHTML = `
                <div class="w-full grid grid-cols-2 md:grid-cols-3 gap-2 p-1 max-h-64 overflow-y-auto animate-fade-in">
                    ${categories.map(cat => `
                        <button type="button"
                            onclick="selectCategory(${JSON.stringify(cat)})"
                            class="bg-slate-800 hover:bg-slate-700 text-white text-xs md:text-sm px-3 py-3 rounded-xl text-center transition-colors border border-slate-700">
                            ${this.escape(cat)}
                        </button>
                    `).join('')}
                </div>
            `;
            this.safeIcons();
        },

        selectCategory(category) {
            const state = this.getState();
            state.userData.category = category;
            this.addUserMessage(category);
            this.step = 1;
            this.renderStep();
        },

        renderTextInput(placeholder, key, isPhone = false) {
            this.setInputHtml(`
                <div class="flex gap-2 w-full animate-fade-in">
                    <input
                        type="${isPhone ? 'tel' : 'text'}"
                        id="sf-chat-text-input"
                        placeholder="${this.escape(placeholder)}"
                        class="flex-1 bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                    <button type="button" onclick="sf_submitText()" class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl transition-colors flex items-center gap-2">
                        <i data-lucide="arrow-right" class="w-4 h-4"></i>
                    </button>
                </div>
            `);

            const input = document.getElementById('sf-chat-text-input');
            if (input) {
                input.dataset.sfKey = key;
                input.dataset.sfPhone = isPhone ? '1' : '0';
                input.focus();
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.submitText();
                    }
                });
            }
        },

        submitText() {
            const input = document.getElementById('sf-chat-text-input') || document.getElementById('user-input');
            if (!input) return;

            const value = String(input.value || '').trim();
            if (!value) {
                input.classList.add('border-red-500');
                setTimeout(() => input.classList.remove('border-red-500'), 400);
                return;
            }

            const key = input.dataset.sfKey || this.answerMap[this.step];
            const state = this.getState();

            if (key === 'whatsapp') {
                const valid = (window.sf_utils?.validateWhatsapp || ((v) => /^[0-9+\-\s()]{8,20}$/.test(String(v).trim())))(value);
                if (!valid) {
                    this.addAiMessage('Ese WhatsApp no parece válido. Escríbelo con código de país y números.');
                    input.classList.add('border-red-500');
                    return;
                }
            }

            state.userData[key] = value;
            if (key === 'location') state.userData.address = value;
            if (key === 'whatsapp') state.userData.whatsapp = value;

            this.addUserMessage(value);
            input.value = '';
            this.step += 1;
            this.renderStep();
        },

        renderTemplates(category) {
            const state = this.getState();
            const area = this.getInputAreaEl();
            if (!area) return;

            const categoryContent = (window.sf_utils?.getCategoryContent)
                ? window.sf_utils.getCategoryContent(category)
                : null;

            const templates = (categoryContent?.templates && categoryContent.templates.length > 0)
                ? categoryContent.templates
                : (state.config?.templates || []).filter(t => t.category === category).slice(0, 3);

            const displayTemplates = templates.length > 0 ? templates : [
                { id: 'default', name: 'Moderno', accent: '#4f46e5' }
            ];

            area.classList.remove('hidden');
            area.innerHTML = `
                <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-3 p-1 animate-fade-in">
                    ${displayTemplates.map(t => `
                        <button type="button"
                            onclick="selectTemplate(${JSON.stringify(t.id)})"
                            class="bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-2xl border border-slate-700 text-left transition-all flex items-center gap-3">
                            <div class="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white"
                                 style="background:${t.accent || '#4f46e5'};">
                                ${this.escape(String(t.name || t.id || 'T').charAt(0))}
                            </div>
                            <div>
                                <div class="font-bold">${this.escape(t.name || t.id || 'Plantilla')}</div>
                                <div class="text-xs text-slate-400">${this.escape(t.id || '')}</div>
                            </div>
                        </button>
                    `).join('')}
                </div>
            `;
            this.safeIcons();
        },

        selectTemplate(templateId) {
            const state = this.getState();
            state.userData.template = templateId;
            state.userData.template_id = templateId;
            state.currentTemplate = templateId;
            const template = window.sf_utils?.getTemplateById
                ? window.sf_utils.getTemplateById(templateId)
                : { name: templateId };

            this.addUserMessage(template.name || templateId);
            this.step = 6;
            this.renderStep();
        },

        async finishChat() {
            if (this.busy) return;
            this.busy = true;

            this.hideInputArea();
            this.addAiMessage('✨ Perfecto. Estoy creando tu negocio digital ahora mismo...');

            const stages = [
                'Analizando respuestas...',
                'Seleccionando plantilla...',
                'Guardando negocio...',
                'Creando productos iniciales...',
                'Publicando y preparando acceso...'
            ];

            for (const stage of stages) {
                await new Promise((r) => setTimeout(r, 450));
                this.addAiMessage(stage);
            }

            try {
                const business = await this.createBusiness();
                await this.saveInitialProducts(business);

                const slug = business?.slug || window.sf_utils.generateSlug(
                    this.getState().userData.name || 'mi-negocio'
                );

                this.getState().business = business;
                this.getState().businessId = business?.id || null;

                window.sf_utils.showToast('Negocio creado con éxito', 'success');

                setTimeout(() => {
                    window.location.href = `admin.html?slug=${encodeURIComponent(slug)}`;
                }, 900);
            } catch (err) {
                console.error('Error finalizando onboarding:', err);
                this.addAiMessage('Hubo un problema creando el negocio, pero voy a dejarte el acceso listo.');
                const slug = window.sf_utils.generateSlug(this.getState().userData.name || 'mi-negocio');
                setTimeout(() => {
                    window.location.href = `admin.html?slug=${encodeURIComponent(slug)}`;
                }, 1200);
            } finally {
                this.busy = false;
            }
        },

        async runGeneration() {
            return this.finishChat();
        },

        async withTimeout(promise, ms = 10000, label = 'operación') {
            let timer;
            const timeout = new Promise((_, reject) => {
                timer = setTimeout(() => reject(new Error(`${label} timeout`)), ms);
            });

            try {
                return await Promise.race([promise, timeout]);
            } finally {
                clearTimeout(timer);
            }
        },

        async createBusiness() {
            const state = this.getState();
            const supabase = window.supabaseClient || state.supabase || null;

            const category = state.userData.category || 'Otro';
            const templateId = state.userData.template_id || state.userData.template || 'default';
            const baseSlug = window.sf_utils.generateSlug(state.userData.name || 'mi-negocio');
            const slug = `${baseSlug}-${sf_randomSlugSuffix()}`;

            const basePayload = {
                name: state.userData.name || 'Mi Negocio',
                category,
                description: state.userData.description || '',
                whatsapp: state.userData.whatsapp || '',
                slug,
                status: 'active',
                template_id: templateId,
                plan: state.plan || 'free',
                brand_color: state.userData.brandColor || '#6366f1',
                logo_url: state.userData.logo || null
            };

            const location = state.userData.location || state.userData.address || '';

            const tryInsert = async (payload) => {
                if (!supabase || typeof supabase.from !== 'function') return null;
                const result = await this.withTimeout(
                    supabase.from('businesses').insert(payload).select().single(),
                    12000,
                    'guardar negocio'
                );
                if (result?.error) throw result.error;
                return result?.data || null;
            };

            // 1) intentar con address
            try {
                const payloadAddress = { ...basePayload, address: location };
                const saved = await tryInsert(payloadAddress);
                if (saved) {
                    state.businessId = saved.id;
                    state.business = saved;
                    state.currentTemplate = templateId;
                    return saved;
                }
            } catch (err1) {
                console.warn('Insert con address falló, reintentando con city...', err1);
            }

            // 2) reintentar con city
            try {
                const payloadCity = { ...basePayload, city: location };
                const saved = await tryInsert(payloadCity);
                if (saved) {
                    state.businessId = saved.id;
                    state.business = saved;
                    state.currentTemplate = templateId;
                    return saved;
                }
            } catch (err2) {
                console.warn('Insert con city falló, usando fallback local...', err2);
            }

            // 3) fallback demo para no trabarse nunca
            const demoBusiness = {
                id: `demo-${Date.now()}`,
                ...basePayload,
                address: location,
                city: location,
                created_at: new Date().toISOString()
            };

            state.businessId = demoBusiness.id;
            state.business = demoBusiness;
            state.currentTemplate = templateId;
            return demoBusiness;
        },

        async saveInitialProducts(business) {
            const state = this.getState();
            const supabase = window.supabaseClient || state.supabase || null;
            const category = state.userData.category || 'Otro';
            const categoryContent = (window.sf_utils?.getCategoryContent)
                ? window.sf_utils.getCategoryContent(category)
                : null;

            const maxProducts = state.plan === 'free' ? 5 : 9999;
            const seeds = (categoryContent?.defaultProducts && categoryContent.defaultProducts.length > 0)
                ? categoryContent.defaultProducts
                : [
                    { name: 'Producto 1', desc: 'Descripción del producto', price: 10 },
                    { name: 'Producto 2', desc: 'Descripción del producto', price: 15 }
                ];

            const payloads = seeds.slice(0, maxProducts).map((p, idx) => ({
                business_id: business.id,
                name: p.name || `Producto ${idx + 1}`,
                description: p.desc || p.description || '',
                price: Number(p.price || 0),
                image_url: p.image_url || '',
                active: true,
                category,
                sort_order: idx
            }));

            if (!supabase || typeof supabase.from !== 'function') {
                state.products = payloads.map((p, idx) => ({
                    id: `demo-product-${idx + 1}`,
                    ...p
                }));
                return state.products;
            }

            try {
                const result = await this.withTimeout(
                    supabase.from('products').insert(payloads).select(),
                    12000,
                    'guardar productos'
                );

                if (result?.error) throw result.error;

                state.products = Array.isArray(result?.data) ? result.data : payloads;
                return state.products;
            } catch (err) {
                console.warn('No se pudieron guardar productos, usando fallback:', err);
                state.products = payloads.map((p, idx) => ({
                    id: `demo-product-${idx + 1}`,
                    ...p
                }));
                return state.products;
            }
        },

        async saveBusinessSeo(business) {
            const state = this.getState();
            const supabase = window.supabaseClient || state.supabase || null;
            if (!supabase || typeof supabase.from !== 'function') return null;

            const title = `${business.name} | ${business.category}`;
            const description = business.description || `Negocio creado con SiteFly.`;

            const payload = {
                business_id: business.id,
                title,
                description,
                keywords: `${business.name}, ${business.category}, ${business.city || business.address || ''}`,
                open_graph_url: '',
            };

            try {
                const result = await this.withTimeout(
                    supabase.from('business_seo').insert(payload).select().single(),
                    12000,
                    'guardar SEO'
                );
                if (result?.error) throw result.error;
                return result?.data || null;
            } catch (err) {
                console.warn('SEO no se pudo guardar:', err);
                return null;
            }
        },

        async finishPersistence(business) {
            await Promise.allSettled([
                this.saveBusinessSeo(business),
                this.saveInitialProducts(business)
            ]);
        }
    };

    CHAT.init();
})();
