// js/auth.js
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('auraquant_token');
        this.user = null;
    }
    
    async login(username, password) {
        const response = await fetch(`${CONFIG.API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) throw new Error('Login failed');
        
        const data = await response.json();
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('auraquant_token', this.token);
        
        return data;
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
