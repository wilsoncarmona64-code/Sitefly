// ===== STATE MANAGEMENT (GLOBAL & PERSISTENT) =====
// Inicializamos el estado global si no existe para evitar errores de referencia
if (typeof window.sf_state === 'undefined') {
    window.sf_state = {
        userData: {
            category: '',
            name: '',
            location: '', // Mantenemos por compatibilidad interna
            city: '',     // Nuevo campo correcto para la DB
            whatsapp: '',
            description: ''
        },
        products: [],
        chatStep: 1,
        businessId: null,
        currentTemplate: 'default',
        sessionToken: null
    };
}
const sf_state = window.sf_state;

// Contenido AI (Resumido para el ejemplo, asegúrate de tener tu objeto completo en sf_ai_content.js)
const sf_ai_content = window.sf_ai_content || {
    'default': {
        benefits: ['Calidad garantizada', 'Atención personalizada', 'Servicio rápido'],
        faqs: [{q: '¿Tienen garantía?', a: 'Sí, todos nuestros servicios tienen garantía.'}],
        defaultProducts: [{name: 'Producto Estrella', desc: 'Nuestro producto más vendido', price: 10.00}],
        templates: [{name: 'modern-clean', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'}]
    },
    'Restaurante': {
        benefits: ['Ingredientes frescos locales', 'Ambiente familiar', 'Delivery rápido'],
        faqs: [{q: '¿Hacen domicilios?', a: 'Sí, enviamos a toda la zona.'}],
        defaultProducts: [{name: 'Plato del Día', desc: 'Preparado con amor', price: 5.50}],
        templates: [{name: 'restaurant-dark', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'}]
    }
    // ... resto de categorías
};

// ===== CHAT INITIALIZATION =====
function sf_initChat() {
    const container = document.getElementById('sf-chat-messages');
    if (!container) return;
    
    container.innerHTML = '';
    sf_addAiMessage("¡Hola! 👋 Soy SiteFly, tu empleado digital.");
    
    setTimeout(() => {
        sf_addAiMessage("Voy a crear tu negocio digital completo con textos, SEO y diseño profesional. Primero, ¿qué tipo de negocio tienes?");
        sf_showCategoryButtons();
    }, 800);
}

// ===== MESSAGE HANDLING =====
function sf_addAiMessage(text) {
    const container = document.getElementById('sf-chat-messages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'flex gap-3 sf-animate-up';
    // Usamos un avatar genérico si no hay imagen específica
    const avatarUrl = "https://ui-avatars.com/api/?name=Site+Fly&background=6366f1&color=fff&rounded=true";
    
    div.innerHTML = `
        <img src="${avatarUrl}" class="w-8 h-8 rounded-full mt-1 drop-shadow-[0_0_5px_rgba(99,102,241,0.3)] flex-shrink-0" alt="AI">
        <div class="sf-bubble-ai text-white px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-lg bg-indigo-600/90 backdrop-blur-sm border border-indigo-500/30">${text}</div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function sf_addUserMessage(text) {
    const container = document.getElementById('sf-chat-messages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'flex justify-end sf-animate-up';
    div.innerHTML = `
        <div class="sf-bubble-user text-white px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-lg bg-slate-700/90 backdrop-blur-sm border border-slate-600/30">${text}</div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function sf_addTypingIndicator() {
    const container = document.getElementById('sf-chat-messages');
    if (!container) return;

    const div = document.createElement('div');
    div.id = 'sf-typing-indicator';
    div.className = 'flex gap-3 sf-animate-up';
    div.innerHTML = `
        <img src="https://ui-avatars.com/api/?name=Site+Fly&background=6366f1&color=fff&rounded=true" class="w-8 h-8 rounded-full mt-1 flex-shrink-0" alt="AI">
        <div class="sf-bubble-ai px-4 py-3 rounded-2xl flex items-center gap-1.5 bg-slate-800/50 border border-slate-700">
            <div class="w-2 h-2 bg-slate-400 rounded-full sf-typing-dot"></div>
            <div class="w-2 h-2 bg-slate-400 rounded-full sf-typing-dot" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-slate-400 rounded-full sf-typing-dot" style="animation-delay: 0.2s"></div>
        </div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function sf_removeTypingIndicator() {
    const el = document.getElementById('sf-typing-indicator');
    if (el) el.remove();
}

// ===== CATEGORY SELECTION =====
function sf_showCategoryButtons() {
    const container = document.getElementById('sf-chat-input-container');
    if (!container) return;

    // Lista completa de 15 categorías principales + subcategorías para llegar a las opciones
    const cats = [
        'Restaurante', 'Soda', 'Cafetería', 'Panadería', 
        'Barbería', 'Salón de Belleza', 'Tienda de Ropa', 
        'Ferretería', 'Taller Mecánico', 'Sublimado', 
        'Veterinaria', 'Gimnasio', 'Hotel', 'Tour Operador', 'Otro'
    ];

    container.innerHTML = `
        <div class="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 p-1 max-h-64 overflow-y-auto custom-scrollbar">
            ${cats.map(c => `
                <button onclick="sf_selectCategory('${c}')" 
                    class="sf-cat-btn bg-slate-800 hover:bg-indigo-600 text-white text-xs md:text-sm px-2 py-3 rounded-xl text-center transition-all duration-200 transform hover:scale-105 border border-slate-700 hover:border-indigo-500 shadow-md">
                    ${c}
                </button>
            `).join('')}
        </div>
    `;
}

function sf_selectCategory(cat) {
    sf_state.userData.category = cat;
    sf_addUserMessage(cat);
    
    const inputContainer = document.getElementById('sf-chat-input-container');
    if (inputContainer) inputContainer.innerHTML = '';
    
    sf_state.chatStep = 2;
    
    // Generar productos iniciales basados en la categoría
    const content = sf_ai_content[cat] || sf_ai_content['default'];
    sf_state.products = (content.defaultProducts || []).map((p, idx) => ({ 
        id: 'temp-' + Date.now() + '-' + idx, 
        name: p.name, 
        description: p.desc || p.description || '', 
        price: parseFloat(p.price) || 0 
    }));
    
    sf_nextQuestion();
}

// ===== QUESTION FLOW =====
function sf_nextQuestion() {
    sf_addTypingIndicator();
    
    setTimeout(() => {
        sf_removeTypingIndicator();
        const inputContainer = document.getElementById('sf-chat-input-container');
        if (!inputContainer) return;

        switch(sf_state.chatStep) {
            case 2:
                sf_addAiMessage(`¡Excelente elección! ¿Cómo se llama tu ${sf_state.userData.category}?`);
                inputContainer.innerHTML = sf_textInput('Ej: Delicias del Valle', 2);
                break;
            case 3:
                sf_addAiMessage('¿En qué ciudad o zona específica se encuentra? (Esto es vital para tu SEO local)');
                inputContainer.innerHTML = sf_textInput('Ej: San José, Centro...', 3);
                break;
            case 4:
                sf_addAiMessage('¿Cuál es tu número de WhatsApp para recibir pedidos? (Incluye el código de país)');
                inputContainer.innerHTML = sf_textInput('+506 8888 8888', 4);
                break;
            case 5:
                sf_addAiMessage('¡Todo listo! 🚀 Estoy generando tu página web con textos persuasivos, beneficios clave, FAQs y optimización SEO automática.');
                inputContainer.innerHTML = `
                    <button onclick="sf_finishChat()" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-4 rounded-xl text-base font-bold shadow-lg transform transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                        <i data-lucide="sparkles" class="w-5 h-5"></i> Crear mi negocio digital ahora
                    </button>
                `;
                if (typeof lucide !== 'undefined') lucide.createIcons();
                break;
        }
    }, 800);
}

function sf_textInput(placeholder, step) {
    return `
        <div class="flex w-full gap-2 animate-fade-in">
            <input type="text" id="sf-chat-text-input" placeholder="${placeholder}" 
                class="flex-1 bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-500" 
                onkeypress="if(event.key==='Enter') sf_submitText(${step})"
                autofocus>
            <button onclick="sf_submitText(${step})" 
                class="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg">
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
        </div>
    `;
}

function sf_submitText(step) {
    const input = document.getElementById('sf-chat-text-input');
    if (!input || !input.value.trim()) {
        input?.classList.add('animate-shake');
        setTimeout(() => input?.classList.remove('animate-shake'), 500);
        return;
    }

    const value = input.value.trim();
    sf_addUserMessage(value);
    
    const inputContainer = document.getElementById('sf-chat-input-container');
    if (inputContainer) inputContainer.innerHTML = '';

    // CORRECCIÓN CRÍTICA: Sincronizar location y city
    if (step === 2) sf_state.userData.name = value;
    if (step === 3) {
        sf_state.userData.location = value;
        sf_state.userData.city = value; // Guardar en el campo correcto para la DB
    }
    if (step === 4) sf_state.userData.whatsapp = value;
    
    sf_state.chatStep = step + 1;
    sf_nextQuestion();
}

function sf_finishChat() {
    sf_addUserMessage('¡Crear mi negocio!');
    const inputContainer = document.getElementById('sf-chat-input-container');
    if (inputContainer) inputContainer.innerHTML = '';
    
    setTimeout(() => { 
        sf_showView('generating'); 
        sf_runGeneration(); 
    }, 500);
}

// ===== GENERATION LOGIC =====
async function sf_runGeneration() {
    const container = document.getElementById('sf-gen-steps');
    if (!container) return;

    const steps = [
        { text: 'Redactando textos persuasivos y beneficios...', icon: 'file-text' },
        { text: `Optimizando SEO local para ${sf_state.userData.city || 'tu zona'}...`, icon: 'search' },
        { text: 'Diseñando interfaz con plantilla premium...', icon: 'palette' },
        { text: 'Guardando datos en base de datos segura...', icon: 'database' },
        { text: 'Publicando tu sitio web en la nube...', icon: 'rocket' }
    ];

    container.innerHTML = steps.map((step, idx) => `
        <div id="sf-gen-step-${idx}" class="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-xl opacity-30 transition-all duration-500 transform translate-y-2">
            <div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0" id="sf-gen-icon-${idx}">
                <i data-lucide="${step.icon}" class="w-5 h-5 text-slate-400"></i>
            </div>
            <span class="text-sm text-slate-300 font-medium">${step.text}</span>
            <div class="ml-auto" id="sf-gen-check-${idx}"></div>
        </div>
    `).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Preparar datos finales
    const content = sf_ai_content[sf_state.userData.category] || sf_ai_content['default'];
    sf_state.userData.description = `El mejor ${sf_state.userData.category.toLowerCase()} en ${sf_state.userData.city}. Ofrecemos ${content.benefits.join(', ').toLowerCase()}.`;
    sf_state.currentTemplate = content.templates ? content.templates[0].name : 'default';

    // Ejecutar pasos con animación
    for (let i = 0; i < steps.length; i++) {
        await new Promise(r => setTimeout(r, 1000)); // Un poco más lento para efecto dramático
        
        const el = document.getElementById(`sf-gen-step-${i}`);
        const iconEl = document.getElementById(`sf-gen-icon-${i}`);
        const checkEl = document.getElementById(`sf-gen-check-${i}`);
        
        if (el) {
            el.style.opacity = '1'; 
            el.classList.remove('translate-y-2');
            el.classList.add('border-indigo-500/50', 'bg-slate-800');
        }
        
        if (iconEl) {
            iconEl.classList.remove('bg-slate-700'); 
            iconEl.classList.add('bg-indigo-600', 'animate-pulse');
            iconEl.innerHTML = `<div class="sf-loading" style="width:20px;height:20px;border-width:2px;border-color:white transparent;"></div>`;
        }

        // Paso crítico: Guardar en DB
        if (i === 3) {
            try {
                await sf_createBusiness();
                if (sf_state.businessId) {
                    for (const product of sf_state.products) {
                        await sf_saveProduct(product);
                    }
                }
            } catch (error) {
                console.error("Error guardando datos:", error);
                sf_addAiMessage("⚠️ Hubo un pequeño error guardando, pero continuaremos...");
            }
        }

        // Completar paso visualmente
        setTimeout(() => {
            if (iconEl) {
                iconEl.classList.remove('bg-indigo-600', 'animate-pulse'); 
                iconEl.classList.add('bg-green-500');
                iconEl.innerHTML = `<i data-lucide="check" class="w-5 h-5 text-white"></i>`;
            }
            if (checkEl) {
                checkEl.innerHTML = '<span class="text-xs text-green-400 font-bold">Completado</span>';
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 400);
    }

    setTimeout(() => {
        sf_showView('admin');
        if (typeof sf_initAdmin === 'function') sf_initAdmin();
        
        // Mostrar preview automáticamente después de un momento
        setTimeout(() => { 
            if (typeof sf_showPreview === 'function') sf_showPreview();
        }, 1000);
    }, 800);
}

// ===== DB INTERACTION (WRAPPERS) =====
async function sf_createBusiness() {
    if (!window.supabaseClient) {
        console.warn("Supabase no inicializado, usando modo demo");
        sf_state.businessId = 'demo-' + Date.now();
        return { id: sf_state.businessId };
    }

    const { data, error } = await window.supabaseClient
        .from('businesses')
        .insert({
            name: sf_state.userData.name,
            category: sf_state.userData.category,
            description: sf_state.userData.description,
            city: sf_state.userData.city, // Campo correcto
            location: sf_state.userData.location, // Compatibilidad
            whatsapp: sf_state.userData.whatsapp,
            template_id: sf_state.currentTemplate,
            status: 'active',
            user_id: 'anon-user' // TODO: Reemplazar con ID real del usuario logueado
        })
        .select()
        .single();

    if (error) throw error;
    sf_state.businessId = data.id;
    return data;
}

async function sf_saveProduct(product) {
    if (!window.supabaseClient || !sf_state.businessId) return null;

    const { data, error } = await window.supabaseClient
        .from('products')
        .insert({
            business_id: sf_state.businessId,
            name: product.name,
            description: product.description,
            price: product.price,
            active: true
        })
        .select()
        .single();

    if (error) {
        console.error("Error guardando producto:", error);
        return null;
    }
    return data;
}
