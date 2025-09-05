// js/auth.js
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('auraquant_token');
        this.user = null;
    }
    
    async login(username, password) {
        let lastError = null;
        const urls = [CONFIG.API_URL, CONFIG.FALLBACK_API_URL];
        
        for (const apiUrl of urls) {
            try {
                console.log(`Attempting login to: ${apiUrl}`);
                const response = await fetch(`${apiUrl}/api/auth/login`, {
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
                localStorage.setItem('auraquant_api_url', apiUrl); // Save working URL
                
                // Update CONFIG to use working URL
                CONFIG.ACTIVE_API_URL = apiUrl;
                
                return data;
            } catch (error) {
                console.error(`Login failed for ${apiUrl}:`, error);
                lastError = error;
                if (apiUrl === CONFIG.API_URL) {
                    console.log('Trying fallback URL...');
                }
            }
        }
        
        // If both URLs failed
        if (lastError.message === 'Failed to fetch') {
            throw new Error('Cannot connect to server. Both primary and backup servers are unreachable.');
        }
        throw lastError;
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
