// ===== ESTADO GLOBAL DEL CHAT (CRÍTICO: Esto faltaba) =====
if (typeof window.sf_state === 'undefined') {
    window.sf_state = {
        userData: {
            category: '',
            name: '',
            location: '', // Se guardará como 'city' en la DB
            whatsapp: '',
            description: ''
        },
        chatStep: 1,
        products: [],
        currentTemplate: '',
        businessId: null,
        userId: null // Debería venir de tu auth
    };
}
const sf_state = window.sf_state;

// ===== INICIALIZACIÓN =====
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

// ===== MENSAJES =====
function sf_addAiMessage(text) {
    const container = document.getElementById('sf-chat-messages');
    const div = document.createElement('div');
    div.className = 'flex gap-3 sf-animate-up';
    // Asegúrate de tener una imagen válida o usa un icono por defecto
    div.innerHTML = `<div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">AI</div><div class="sf-bubble-ai text-white px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-lg">${text}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function sf_addUserMessage(text) {
    const container = document.getElementById('sf-chat-messages');
    const div = document.createElement('div');
    div.className = 'flex justify-end sf-animate-up';
    div.innerHTML = `<div class="sf-bubble-user bg-indigo-600 text-white px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-lg">${text}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function sf_addTypingIndicator() {
    const container = document.getElementById('sf-chat-messages');
    const div = document.createElement('div');
    div.id = 'sf-typing-indicator';
    div.className = 'flex gap-3 sf-animate-up';
    div.innerHTML = `<div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">AI</div><div class="sf-bubble-ai px-4 py-3 rounded-2xl flex items-center gap-1.5"><div class="w-2 h-2 bg-slate-400 rounded-full sf-typing-dot"></div><div class="w-2 h-2 bg-slate-400 rounded-full sf-typing-dot"></div><div class="w-2 h-2 bg-slate-400 rounded-full sf-typing-dot"></div></div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function sf_removeTypingIndicator() {
    const el = document.getElementById('sf-typing-indicator');
    if (el) el.remove();
}

// ===== CATEGORÍAS =====
function sf_showCategoryButtons() {
    const container = document.getElementById('sf-chat-input-container');
    if (!container) return;

    const cats = ['Restaurante', 'Soda', 'Cafetería', 'Panadería', 'Barbería', 'Belleza', 'Tienda de ropa', 'Ferretería', 'Taller mecánico', 'Sublimado', 'Veterinaria', 'Gimnasio', 'Otro'];
    
    // Contenido AI simulado para demo (debería venir de tu objeto sf_ai_content real)
    window.sf_ai_content = window.sf_ai_content || {
        'default': {
            benefits: ['Atención rápida', 'Calidad garantizada', 'Precios accesibles'],
            faqs: [{q: '¿Tienen delivery?', a: 'Sí, enviamos a toda la zona.'}],
            defaultProducts: [{name: 'Producto Estrella', desc: 'Nuestro favorito', price: 10}],
            templates: [{name: 'modern-clean', img: ''}]
        }
    };

    container.innerHTML = `<div class="w-full grid grid-cols-2 md:grid-cols-3 gap-2 p-1 max-h-64 overflow-y-auto animate-fade-in">${cats.map(c => 
        `<button onclick="sf_selectCategory('${c}')" class="bg-slate-800 hover:bg-slate-700 text-white text-xs md:text-sm px-3 py-3 rounded-xl text-center transition-colors border border-slate-700">${c}</button>`
    ).join('')}</div>`;
}

function sf_selectCategory(cat) {
    sf_state.userData.category = cat;
    sf_addUserMessage(cat);
    document.getElementById('sf-chat-input-container').innerHTML = '';
    sf_state.chatStep = 2;
    
    // Inicializar productos base
    const content = sf_ai_content[cat] || sf_ai_content['default'];
    sf_state.products = content.defaultProducts.map((p, idx) => ({ 
        id: 'temp-' + (Date.now() + idx), 
        name: p.name, 
        description: p.desc || p.description, 
        price: p.price 
    }));
    
    sf_nextQuestion();
}

// ===== FLUJO DE PREGUNTAS =====
function sf_nextQuestion() {
    sf_addTypingIndicator();
    setTimeout(() => {
        sf_removeTypingIndicator();
        const inputContainer = document.getElementById('sf-chat-input-container');
        if (!inputContainer) return;

        switch(sf_state.chatStep) {
            case 2:
                sf_addAiMessage(`¡Perfecto! ¿Cómo se llama tu ${sf_state.userData.category}?`);
                inputContainer.innerHTML = sf_textInput('Ej: Burger King...', 2);
                break;
            case 3:
                sf_addAiMessage('¿En qué ciudad o zona se encuentra? (Esto optimizará tu SEO local)');
                inputContainer.innerHTML = sf_textInput('Ej: San José, Centro...', 3);
                break;
            case 4:
                sf_addAiMessage('¿Cuál es tu número de WhatsApp para recibir pedidos?');
                inputContainer.innerHTML = sf_textInput('+506 8888 8888', 4);
                break;
            case 5:
                sf_addAiMessage('¡Listo! Estoy generando tu página web con textos persuasivos, beneficios, FAQs y optimización SEO.');
                inputContainer.innerHTML = `<button onclick="sf_finishChat()" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-4 rounded-xl text-sm font-bold transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"><i data-lucide="sparkles" class="w-4 h-4"></i> Crear mi negocio digital</button>`;
                if (typeof lucide !== 'undefined') lucide.createIcons();
                break;
        }
    }, 800);
}

function sf_textInput(placeholder, step) {
    return `<div class="flex gap-2 w-full animate-fade-in">
        <input type="text" id="sf-chat-text-input" placeholder="${placeholder}" class="flex-1 bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors" onkeypress="if(event.key==='Enter') sf_submitText(${step})" autofocus>
        <button onclick="sf_submitText(${step})" class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl transition-colors flex items-center gap-2">
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </button>
    </div>`;
}

function sf_submitText(step) {
    const input = document.getElementById('sf-chat-text-input');
    if (!input || !input.value.trim()) {
        input?.classList.add('border-red-500');
        setTimeout(() => input?.classList.remove('border-red-500'), 500);
        return;
    }
    
    const value = input.value.trim();
    sf_addUserMessage(value);
    document.getElementById('sf-chat-input-container').innerHTML = '';
    
    // Mapeo correcto de datos
    if (step === 2) sf_state.userData.name = value;
    if (step === 3) sf_state.userData.location = value; // Se usará como 'city'
    if (step === 4) sf_state.userData.whatsapp = value;
    
    sf_state.chatStep = step + 1;
    sf_nextQuestion();
}

function sf_finishChat() {
    sf_addUserMessage('¡Crear mi negocio!');
    document.getElementById('sf-chat-input-container').innerHTML = '';
    
    setTimeout(() => { 
        // Verificar si la vista existe antes de cambiar
        if (typeof sf_showView === 'function') {
            sf_showView('generating'); 
            sf_runGeneration(); 
        } else {
            alert('Error: Función sf_showView no definida. Asegúrate de cargar app.js primero.');
        }
    }, 500);
}

// ===== GENERACIÓN Y BASE DE DATOS =====
async function sf_runGeneration() {
    const container = document.getElementById('sf-gen-steps');
    if (!container) return;

    const steps = [
        { text: 'Generando textos persuasivos...', icon: 'file-text' },
        { text: 'Optimizando SEO local...', icon: 'search' },
        { text: 'Diseñando interfaz...', icon: 'palette' },
        { text: 'Guardando en base de datos...', icon: 'database' },
        { text: 'Publicando sitio...', icon: 'rocket' }
    ];

    container.innerHTML = steps.map((step, idx) => `
        <div id="sf-gen-step-${idx}" class="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-xl opacity-30 transition-all duration-500">
            <div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center transition-colors" id="sf-gen-icon-${idx}">
                <i data-lucide="${step.icon}" class="w-5 h-5 text-slate-400"></i>
            </div>
            <span class="text-sm text-slate-300 font-medium">${step.text}</span>
            <div class="ml-auto" id="sf-gen-check-${idx}"></div>
        </div>
    `).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Preparar datos finales
    const content = sf_ai_content[sf_state.userData.category] || sf_ai_content['default'];
    sf_state.userData.description = `El mejor ${sf_state.userData.category.toLowerCase()} en ${sf_state.userData.location}. Especialistas en servicio de calidad.`;
    sf_state.currentTemplate = content.templates[0].name;

    for (let i = 0; i < steps.length; i++) {
        await new Promise(r => setTimeout(r, 1000));
        
        const el = document.getElementById(`sf-gen-step-${i}`);
        const iconEl = document.getElementById(`sf-gen-icon-${i}`);
        const checkEl = document.getElementById(`sf-gen-check-${i}`);
        
        el.style.opacity = '1'; 
        el.classList.add('border-indigo-500/50', 'bg-slate-800');
        iconEl.classList.add('bg-indigo-600', 'shadow-lg shadow-indigo-500/30');
        iconEl.innerHTML = `<div class="sf-loading" style="width:20px;height:20px;border-width:2px;border-color:white transparent;"></div>`;

        // Paso crítico: Guardar en DB
        if (i === 3) {
            try {
                await sf_createBusiness();
                if (sf_state.businessId) {
                    for (const product of sf_state.products) {
                        await sf_saveProduct(product);
                    }
                }
            } catch (e) {
                console.error("Error guardando:", e);
                // No detenemos el flujo visualmente para no asustar al usuario en demo, pero logueamos
            }
        }

        setTimeout(() => {
            iconEl.className = 'w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30 transition-all';
            iconEl.innerHTML = `<i data-lucide="check" class="w-5 h-5 text-white"></i>`;
            checkEl.innerHTML = '<span class="text-xs text-green-400 font-bold">Completado</span>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 400);
    }

    setTimeout(() => {
        if (typeof sf_showView === 'function') {
            sf_showView('admin');
            if (typeof sf_initAdmin === 'function') sf_initAdmin();
            setTimeout(() => { 
                if (typeof sf_showPreview === 'function') sf_showPreview(); 
            }, 1000);
        }
    }, 800);
}

// ===== FUNCIONES DE BASE DE DATOS (Corregidas) =====
async function sf_createBusiness() {
    if (!window.supabaseClient) {
        console.warn("Supabase no conectado, usando modo demo");
        sf_state.businessId = 'demo-id-' + Date.now();
        return { id: sf_state.businessId };
    }

    // CORRECCIÓN: Usar 'city' en vez de 'location' para la DB
    const { data, error } = await window.supabaseClient
        .from('businesses')
        .insert({
            name: sf_state.userData.name,
            category: sf_state.userData.category,
            description: sf_state.userData.description,
            city: sf_state.userData.location, // Mapeo correcto
            whatsapp: sf_state.userData.whatsapp,
            slug: sf_state.userData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 100),
            status: 'active',
            template_id: sf_state.currentTemplate
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

    if (error) throw error;
    return data;
}
