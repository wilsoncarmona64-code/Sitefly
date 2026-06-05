function sf_initChat() {
    const container = document.getElementById('sf-chat-messages');
    container.innerHTML = '';
    sf_addAiMessage("¡Hola! 👋 Soy SiteFly, tu empleado digital.");
    setTimeout(() => {
        sf_addAiMessage("Voy a crear tu negocio digital completo con textos, SEO y diseño profesional. Primero, ¿qué tipo de negocio tienes?");
        sf_showCategoryButtons();
    }, 800);
}

function sf_addAiMessage(text) {
    const container = document.getElementById('sf-chat-messages');
    const div = document.createElement('div');
    div.className = 'flex gap-3 sf-animate-up';
    div.innerHTML = `<img src="https://image.qwenlm.ai/public_source/0ba08b56-35a5-4f25-adda-eb45071b3040/115239c29-3833-4da1-a16c-f38fdf34252c.png" class="w-8 h-8 rounded-full mt-1 drop-shadow-[0_0_5px_rgba(99,102,241,0.3)]"><div class="sf-bubble-ai text-white px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed">${text}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function sf_addUserMessage(text) {
    const container = document.getElementById('sf-chat-messages');
    const div = document.createElement('div');
    div.className = 'flex justify-end sf-animate-up';
    div.innerHTML = `<div class="sf-bubble-user text-white px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed">${text}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function sf_addTypingIndicator() {
    const container = document.getElementById('sf-chat-messages');
    const div = document.createElement('div');
    div.id = 'sf-typing-indicator';
    div.className = 'flex gap-3 sf-animate-up';
    div.innerHTML = `<img src="https://image.qwenlm.ai/public_source/0ba08b56-35a5-4f25-adda-eb45071b3040/115239c29-3833-4da1-a16c-f38fdf34252c.png" class="w-8 h-8 rounded-full mt-1"><div class="sf-bubble-ai px-4 py-3 rounded-2xl flex items-center gap-1.5"><div class="w-2 h-2 bg-slate-400 rounded-full sf-typing-dot"></div><div class="w-2 h-2 bg-slate-400 rounded-full sf-typing-dot"></div><div class="w-2 h-2 bg-slate-400 rounded-full sf-typing-dot"></div></div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function sf_removeTypingIndicator() {
    const el = document.getElementById('sf-typing-indicator');
    if (el) el.remove();
}

function sf_showCategoryButtons() {
    const container = document.getElementById('sf-chat-input-container');
    const cats = ['Restaurante', 'Soda', 'Cafetería', 'Panadería', 'Barbería', 'Belleza', 'Tienda de ropa', 'Ferretería', 'Taller mecánico', 'Sublimado', 'Veterinaria', 'Gimnasio', 'Otro'];
    container.innerHTML = `<div class="w-full grid grid-cols-2 md:grid-cols-4 gap-2 p-1 max-h-64 overflow-y-auto">${cats.map(c => `<button onclick="sf_selectCategory('${c}')" class="sf-cat-btn bg-slate-800 text-white text-xs md:text-sm px-3 py-2.5 rounded-xl text-center">${c}</button>`).join('')}</div>`;
}

function sf_selectCategory(cat) {
    sf_state.userData.category = cat;
    sf_addUserMessage(cat);
    document.getElementById('sf-chat-input-container').innerHTML = '';
    sf_state.chatStep = 2;
    const content = sf_ai_content[cat] || sf_ai_content['default'];
    sf_state.products = content.defaultProducts.map((p, idx) => ({ id: 'demo-' + (Date.now() + idx), name: p.name, description: p.desc, price: p.price }));
    sf_nextQuestion();
}

function sf_nextQuestion() {
    sf_addTypingIndicator();
    setTimeout(() => {
        sf_removeTypingIndicator();
        const inputContainer = document.getElementById('sf-chat-input-container');
        switch(sf_state.chatStep) {
            case 2:
                sf_addAiMessage(`¡Perfecto! ¿Cómo se llama tu ${sf_state.userData.category}?`);
                inputContainer.innerHTML = sf_textInput('Nombre del negocio...', 2);
                break;
            case 3:
                sf_addAiMessage('¿En qué ciudad o zona se encuentra? (Esto optimizará tu SEO local)');
                inputContainer.innerHTML = sf_textInput('Ej: Pavas, San José...', 3);
                break;
            case 4:
                sf_addAiMessage('¿Cuál es tu número de WhatsApp para recibir pedidos?');
                inputContainer.innerHTML = sf_textInput('+506 8888 8888', 4);
                break;
            case 5:
                sf_addAiMessage('¡Listo! Estoy generando tu página web con textos persuasivos, beneficios, FAQs y optimización SEO.');
                inputContainer.innerHTML = `<button onclick="sf_finishChat()" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"><i data-lucide="sparkles" class="w-4 h-4"></i> Crear mi negocio digital</button>`;
                if (typeof lucide !== 'undefined') lucide.createIcons();
                break;
        }
    }, 1000);
}

function sf_textInput(placeholder, step) {
    return `<input type="text" id="sf-chat-text-input" placeholder="${placeholder}" class="sf-input flex-1 px-4 py-3 rounded-xl text-white placeholder-slate-500" onkeypress="if(event.key==='Enter') sf_submitText(${step})"><button onclick="sf_submitText(${step})" class="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"><i data-lucide="arrow-right" class="w-4 h-4"></i></button>`;
}

function sf_submitText(step) {
    const input = document.getElementById('sf-chat-text-input');
    if (!input || !input.value.trim()) return;
    sf_addUserMessage(input.value.trim());
    document.getElementById('sf-chat-input-container').innerHTML = '';
    if (step === 2) sf_state.userData.name = input.value.trim();
    if (step === 3) sf_state.userData.location = input.value.trim();
    if (step === 4) sf_state.userData.whatsapp = input.value.trim();
    sf_state.chatStep = step + 1;
    sf_nextQuestion();
}

function sf_finishChat() {
    sf_addUserMessage('¡Crear mi negocio!');
    document.getElementById('sf-chat-input-container').innerHTML = '';
    setTimeout(() => { sf_showView('generating'); sf_runGeneration(); }, 500);
}

// ===== GENERATION =====
async function sf_runGeneration() {
    const container = document.getElementById('sf-gen-steps');
    const steps = [
        { text: 'Generando textos persuasivos y beneficios...', icon: 'file-text' },
        { text: 'Optimizando SEO local para ' + (sf_state.userData.location || 'tu zona') + '...', icon: 'search' },
        { text: 'Aplicando plantilla premium y paleta de colores...', icon: 'palette' },
        { text: 'Guardando en base de datos...', icon: 'database' },
        { text: 'Publicando tu sitio web...', icon: 'rocket' }
    ];

    container.innerHTML = steps.map((step, idx) => `
        <div id="sf-gen-step-${idx}" class="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-xl opacity-30 transition-all">
            <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center" id="sf-gen-icon-${idx}"><i data-lucide="${step.icon}" class="w-4 h-4 text-slate-400"></i></div>
            <span class="text-sm text-slate-300">${step.text}</span>
            <div class="ml-auto" id="sf-gen-check-${idx}"></div>
        </div>
    `).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();

    const content = sf_ai_content[sf_state.userData.category] || sf_ai_content['default'];
    sf_state.userData.description = `El mejor ${sf_state.userData.category.toLowerCase()} en ${sf_state.userData.location || 'la zona'}. ${content.benefits[0]} y ${content.benefits[1].toLowerCase()}.`;
    sf_state.currentTemplate = content.templates[0].name;

    for (let i = 0; i < steps.length; i++) {
        await new Promise(r => setTimeout(r, 800));
        const el = document.getElementById(`sf-gen-step-${i}`);
        const iconEl = document.getElementById(`sf-gen-icon-${i}`);
        const checkEl = document.getElementById(`sf-gen-check-${i}`);
        el.style.opacity = '1'; el.classList.add('border-indigo-500/50');
        iconEl.classList.add('bg-indigo-500');
        iconEl.innerHTML = `<div class="sf-loading" style="width:16px;height:16px;border-width:2px;"></div>`;

        if (i === 3) {
            await sf_createBusiness();
            if (sf_state.businessId) {
                for (const product of sf_state.products) {
                    const savedProduct = await sf_saveProduct(product);
                    if (savedProduct) product.id = savedProduct.id;
                }
            }
        }

        setTimeout(() => {
            iconEl.classList.remove('bg-indigo-500'); iconEl.classList.add('bg-green-500');
            iconEl.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-white"></i>`;
            checkEl.innerHTML = '<span class="text-xs text-green-400">Listo</span>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 400);
    }

    setTimeout(() => {
        sf_showView('admin');
        sf_initAdmin();
        setTimeout(() => { sf_showPreview(); }, 800);
    }, 800);
}
