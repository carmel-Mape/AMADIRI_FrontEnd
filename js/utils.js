/**
 * Utility functions for the Amadiri admin dashboard
 */

// Create global utils object
window.utils = {
    // Configuration
    API_URL: 'http://localhost:8080/api',

    // Toast Types
    toastTypes: {
        SUCCESS: 'success',
        ERROR: 'error',
        INFO: 'info',
        WARNING: 'warning'
    },

    // Toast Icons
    toastIcons: {
        success: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z" fill="currentColor"/></svg>',
        error: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" fill="currentColor"/></svg>',
        info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z" fill="currentColor"/></svg>',
        warning: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" fill="currentColor"/></svg>'
    },

    // Show toast notification
    showToast(message, type = 'info', title = '') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        if (!title) {
            switch (type) {
                case 'success': title = 'Succès'; break;
                case 'error': title = 'Erreur'; break;
                case 'warning': title = 'Attention'; break;
                default: title = 'Information';
            }
        }
        
        toast.innerHTML = `
            <div class="toast-icon">${this.toastIcons[type]}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <div class="toast-progress"></div>
        `;
        
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    },

    // Format date
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },

    // Format date with time
    formatDateTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Format currency
    formatCurrency(value) {
        if (value === null || value === undefined) return '';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    },

    // Decode JWT token
    decodeJwtPayload(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding JWT:', error);
            return null;
        }
    },

    // Check authentication
    isAuthenticated() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return false;
            
            const payload = this.decodeJwtPayload(token);
            if (!payload) return false;
            
            const isExpired = payload.exp * 1000 <= Date.now();
            if (isExpired) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    },

    // Get token
    getToken() {
        return localStorage.getItem('token');
    },

    // Make API request
    async apiRequest(url, options = {}) {
        try {
            if (!url.includes('/auth/') && !this.isAuthenticated()) {
                this.showToast('Session expirée. Veuillez vous reconnecter.', 'error');
                window.location.href = 'index.html';
                throw new Error('Non authentifié');
            }

            const token = this.getToken();
            const headers = {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
                ...options.headers
            };

            const response = await fetch(url, {
                ...options,
                headers
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                this.showToast('Session expirée. Veuillez vous reconnecter.', 'error');
                window.location.href = 'index.html';
                throw new Error('Session expirée');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Une erreur inattendue s\'est produite');
            }

            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    },

    // Form validation
    validateField(inputElement, validationFn, errorElement) {
        const value = inputElement.value;
        const result = validationFn(value);
        
        if (result === true) {
            inputElement.classList.remove('invalid');
            inputElement.classList.add('valid');
            errorElement.textContent = '';
            return true;
        } else {
            inputElement.classList.remove('valid');
            inputElement.classList.add('invalid');
            errorElement.textContent = result;
            return false;
        }
    },

    // Get URL parameters
    getUrlParams() {
        const params = {};
        new URLSearchParams(window.location.search).forEach((value, key) => {
            params[key] = value;
        });
        return params;
    },

    // Initialize modal
    initModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return null;

        return {
            open() {
                modal.style.display = 'block';
            },
            close() {
                modal.style.display = 'none';
            }
        };
    }
};