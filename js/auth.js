/**
 * Authentication functionality for the Amadiri admin dashboard
 */

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const emailInput = document.getElementById('login-email');
const passwordInput = document.getElementById('login-password');
const registerNomInput = document.getElementById('register-nom');
const registerPrenomInput = document.getElementById('register-prenom');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const logoutBtn = document.getElementById('logoutBtn');

// Gestion des onglets
const tabs = document.querySelectorAll('.tab-btn');
const forms = document.querySelectorAll('.auth-form');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Rediriger vers le dashboard si déjà connecté
    if (window.authService.isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Gestion des onglets
    if (tabs && forms) {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetForm = tab.dataset.tab;
                
                // Mise à jour des onglets
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Mise à jour des formulaires
                forms.forEach(form => {
                    form.classList.add('hidden');
                    if (form.id === `${targetForm}-form`) {
                        form.classList.remove('hidden');
                    }
                });
            });
        });
    }

    // Gestion du formulaire de connexion
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                await window.authService.login(emailInput.value, passwordInput.value);
                window.location.href = 'dashboard.html';
            } catch (error) {
                window.utils.showToast(error.message, 'error');
            }
        });
    }

    // Gestion du formulaire d'inscription
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                await window.authService.register(
                    registerNomInput.value,
                    registerPrenomInput.value,
                    registerEmailInput.value,
                    registerPasswordInput.value
                );
                window.location.href = 'dashboard.html';
            } catch (error) {
                window.utils.showToast(error.message, 'error');
            }
        });
    }

    // Gestion du bouton de déconnexion
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.authService.logout();
        });
    }
});