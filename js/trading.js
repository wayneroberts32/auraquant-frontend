// js/trading.js
class TradingManager {
    constructor(authManager) {
        this.auth = authManager;
    }
    
    async executeTrade(symbol, type, quantity) {
        const response = await fetch(`${CONFIG.API_URL}/api/trade/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.auth.token}`
            },
            body: JSON.stringify({ symbol, type, quantity })
        });
        
        return await response.json();
    }
    
    async getHistory() {
        const response = await fetch(`${CONFIG.API_URL}/api/trade/history`, {
            headers: {
                'Authorization': `Bearer ${this.auth.token}`
            }
        });
        
        return await response.json();
    }
}
