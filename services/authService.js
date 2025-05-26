/**
 * Authentication service for the Amadiri admin dashboard
 */

window.authService = {
    async login(email, password) {
        try {
            const response = await window.utils.apiRequest(`${window.utils.API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                return response;
            } else {
                throw new Error('Token non reçu');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw new Error('Email ou mot de passe incorrect');
        }
    },

    async register(nom, prenom, email, password) {
        try {
            const response = await window.utils.apiRequest(`${window.utils.API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nom, prenom, email, password })
            });

            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                return response;
            } else {
                throw new Error('Token non reçu');
            }
        } catch (error) {
            console.error('Register error:', error);
            throw new Error('Erreur lors de l\'inscription');
        }
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    },

    isAuthenticated() {
        return window.utils.isAuthenticated();
    },

    getToken() {
        return window.utils.getToken();
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
}; 