// js/auth.js
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('auraquant_token');
        this.user = null;
    }
    
    async login(username, password) {
        try {
            console.log(`Attempting login to: ${CONFIG.API_URL}`);
            const response = await fetch(`${CONFIG.API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                credentials: 'omit',
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `Login failed: ${response.status}`);
            }
            
            if (!data.token) {
                throw new Error('No authentication token received');
            }
            
            this.token = data.token;
            this.user = data.user;
            localStorage.setItem('auraquant_token', this.token);
            
            return data;
        } catch (error) {
            console.error('Login error:', error);
            if (error.message === 'Failed to fetch') {
                throw new Error('Cannot connect to server. Please check your connection.');
            }
            throw error;
        }
    }
    
    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('auraquant_token');
        window.location.reload();
    }
    
    isAuthenticated() {
        return !!this.token;
    }
}
