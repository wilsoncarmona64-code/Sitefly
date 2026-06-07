const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email-input');
const submitBtn = document.getElementById('submit-btn');
const messageDiv = document.getElementById('auth-message');

let isProcessing = false;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof supabase === 'undefined') {
        console.error('Error: Supabase no está definido.');
        if (messageDiv) {
            messageDiv.textContent = 'Error de configuración interna. Contacta soporte.';
            messageDiv.style.display = 'block';
            messageDiv.style.color = 'red';
        }
        return;
    }
    if (loginForm) loginForm.addEventListener('submit', handleMagicLinkLogin);
    checkSession();
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) window.location.href = 'admin.html';
        if (event === 'SIGNED_OUT') window.location.href = 'index.html';
    });
});

async function checkSession() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session) {
            if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                window.location.href = 'admin.html';
            }
        }
    } catch (err) {
        console.error('Error verificando sesión:', err);
    }
}

async function handleMagicLinkLogin(e) {
    e.preventDefault();
    if (isProcessing) return;
    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
    if (!email || !isValidEmail(email)) {
        showMessage('Por favor ingresa un correo electrónico válido.', 'error');
        return;
    }
    setLoading(true);
    showMessage('', '');
    try {
        const { error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                emailRedirectTo: window.location.origin,
                shouldCreateUser: true
            }
        });
        if (error) throw error;
        showMessage('¡Enlace enviado! Revisa tu bandeja de entrada y la carpeta de Spam.', 'success');
        if (emailInput) emailInput.value = '';
    } catch (error) {
        let msg = 'Error al enviar el enlace. ';
        if (error.message.includes('rate limit') || error.message.includes('too many')) {
            msg = 'Demasiados intentos. Espera 1 minuto e intenta de nuevo.';
        } else {
            msg += error.message || 'Intenta de nuevo más tarde.';
        }
        showMessage(msg, 'error');
    } finally {
        setLoading(false);
    }
}

function setLoading(loading) {
    isProcessing = loading;
    if (!submitBtn) return;
    if (loading) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Enviando...';
    } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Enviar enlace mágico';
    }
}

function showMessage(text, type) {
    if (!messageDiv) return;
    messageDiv.textContent = text;
    if (type === 'error') {
        messageDiv.style.display = 'block';
        messageDiv.style.color = '#ef4444';
        messageDiv.style.background = '#fee2e2';
        messageDiv.style.padding = '0.5rem';
        messageDiv.style.borderRadius = '4px';
        messageDiv.style.marginTop = '1rem';
    } else if (type === 'success') {
        messageDiv.style.display = 'block';
        messageDiv.style.color = '#059669';
        messageDiv.style.background = '#d1fae5';
        messageDiv.style.padding = '0.5rem';
        messageDiv.style.borderRadius = '4px';
        messageDiv.style.marginTop = '1rem';
    } else {
        messageDiv.style.display = 'none';
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

window.logout = async () => {
    try {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    } catch (e) {
        console.error('Error al cerrar sesión', e);
    }
};
