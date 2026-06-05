// ===== SECURITY: HTML ESCAPE FUNCTION =====
function sf_escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// ===== TOAST NOTIFICATIONS =====
function sf_showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `sf-toast sf-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('sf-toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ===== WHATSAPP VALIDATION =====
function sf_validateWhatsapp(whatsapp) {
    if (!whatsapp) return null;
    const cleaned = whatsapp.replace(/\D/g, '');
    if (cleaned.length < 8) return null;
    return cleaned;
}

// ===== VIEW MANAGEMENT =====
function sf_showView(viewName) {
    ['login', 'chat', 'generating', 'admin', 'checkout'].forEach(v => {
        const el = document.getElementById(`sf-view-${v}`);
        if (el) el.classList.add('sf-hidden');
    });
    const target = document.getElementById(`sf-view-${viewName}`);
    if (target) { target.classList.remove('sf-hidden'); target.classList.add('sf-animate-fade'); }
    sf_state.view = viewName;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}
