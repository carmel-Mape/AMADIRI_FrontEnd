// Récupération des éléments DOM
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Rediriger vers le dashboard si déjà connecté
    if (window.authService.isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Configuration du formulaire
    setupLoginForm();
});

function setupLoginForm() {
    // Validation de l'email
    emailInput.addEventListener('blur', validateEmail);
    
    // Validation du mot de passe
    passwordInput.addEventListener('blur', validatePassword);
    
    // Soumission du formulaire
    loginForm.addEventListener('submit', handleLogin);
}

function validateEmail() {
    const email = emailInput.value.trim();
    
    if (!email) {
        showError(emailError, 'L\'email est requis');
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError(emailError, 'Format d\'email invalide');
        return false;
    }
    
    hideError(emailError);
    return true;
}

function validatePassword() {
    const password = passwordInput.value;
    
    if (!password) {
        showError(passwordError, 'Le mot de passe est requis');
        return false;
    }
    
    if (password.length < 6) {
        showError(passwordError, 'Le mot de passe doit contenir au moins 6 caractères');
        return false;
    }
    
    hideError(passwordError);
    return true;
}

async function handleLogin(e) {
    e.preventDefault();
    
    // Validation des champs
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    
    if (!isEmailValid || !isPasswordValid) {
        return;
    }
    
    try {
        // Tentative de connexion
        await window.authService.login(emailInput.value, passwordInput.value);
        
        // Redirection vers le dashboard en cas de succès
        window.location.href = 'dashboard.html';
    } catch (error) {
        showError(emailError, 'Email ou mot de passe incorrect');
    }
}

// Fonctions utilitaires
function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

function hideError(element) {
    element.textContent = '';
    element.style.display = 'none';
} 