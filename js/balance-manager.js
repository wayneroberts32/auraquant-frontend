// Global Balance Manager - Handles Paper vs Real Money Trading Safely
class BalanceManager {
    constructor() {
        this.API_URL = 'https://auraquant-backend.onrender.com';
        this.mode = 'PAPER'; // PAPER or REAL
        this.currentBalance = 0;
        this.listeners = [];
        this.syncInterval = null;
        
        // Load saved state
        this.loadState();
        
        // Start sync based on mode
        this.startSync();
    }
    
    loadState() {
        // Get mode from localStorage
        this.mode = localStorage.getItem('trading_mode') || 'PAPER';
        
        // Load balance based on mode
        if (this.mode === 'PAPER') {
            // Paper mode - we can use local overrides
            this.currentBalance = parseFloat(
                localStorage.getItem('forced_balance') || 
                localStorage.getItem('paper_balance') || 
                3947.83
            );
        } else {
            // REAL mode - MUST use backend balance only
            this.currentBalance = parseFloat(
                localStorage.getItem('last_real_balance') || 0
            );
            console.warn('⚠️ REAL MONEY MODE - Balance controlled by backend only');
        }
    }
    
    startSync() {
        // Different sync intervals for different modes
        const interval = this.mode === 'REAL' ? 2000 : 5000; // Real money syncs faster
        
        this.syncInterval = setInterval(() => {
            this.syncWithBackend();
        }, interval);
        
        // Initial sync
        this.syncWithBackend();
    }
    
    async syncWithBackend() {
        try {
            const response = await fetch(`${this.API_URL}/api/bot/status`);
            if (response.ok) {
                const data = await response.json();
                
                if (this.mode === 'REAL') {
                    // REAL MODE - Backend is the source of truth
                    if (data.bot && data.bot.balance !== undefined) {
                        this.currentBalance = data.bot.balance;
                        localStorage.setItem('last_real_balance', this.currentBalance);
                        this.notifyListeners();
                    }
                } else {
                    // PAPER MODE - Check for local overrides
                    const forcedBalance = localStorage.getItem('forced_balance');
                    if (forcedBalance) {
                        // User has manually set a balance
                        this.currentBalance = parseFloat(forcedBalance);
                    } else if (data.bot && data.bot.balance !== undefined) {
                        // Use backend balance
                        this.currentBalance = data.bot.balance;
                    }
                    
                    localStorage.setItem('paper_balance', this.currentBalance);
                    this.notifyListeners();
                }
            }
        } catch (error) {
            console.error('Sync error:', error);
            // In paper mode, we can continue with local balance
            // In real mode, this is a critical error
            if (this.mode === 'REAL') {
                console.error('⚠️ CRITICAL: Cannot sync real money balance!');
                this.notifyListeners({ error: 'Cannot sync with backend' });
            }
        }
    }
    
    async setBalance(newBalance, force = false) {
        // Validate amount
        if (isNaN(newBalance) || newBalance < 0) {
            throw new Error('Invalid balance amount');
        }
        
        if (this.mode === 'REAL' && !force) {
            // REAL MONEY - Must go through backend
            const confirmed = confirm(
                `⚠️ REAL MONEY MODE\n\n` +
                `You are about to change REAL MONEY balance to $${newBalance.toFixed(2)}\n\n` +
                `This will affect actual funds!\n\n` +
                `Are you ABSOLUTELY SURE?`
            );
            
            if (!confirmed) {
                return false;
            }
            
            // Send to backend for real money
            try {
                const response = await fetch(`${this.API_URL}/api/bot/set-balance`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        balance: newBalance,
                        mode: 'REAL',
                        requireAuth: true, // Backend should require authentication
                        timestamp: new Date().toISOString()
                    })
                });
                
                if (response.ok) {
                    this.currentBalance = newBalance;
                    localStorage.setItem('last_real_balance', newBalance);
                    this.notifyListeners();
                    return true;
                } else {
                    throw new Error('Backend rejected balance change');
                }
            } catch (error) {
                alert(`❌ REAL MONEY balance change failed!\n\n${error.message}`);
                return false;
            }
        } else {
            // PAPER MODE - Can set locally
            this.currentBalance = newBalance;
            
            // Store in multiple places for redundancy
            localStorage.setItem('forced_balance', newBalance);
            localStorage.setItem('paper_balance', newBalance);
            localStorage.setItem('last_set_balance', newBalance);
            localStorage.setItem('balance_set_time', new Date().toISOString());
            
            // Try to sync with backend but don't fail if it doesn't work
            try {
                await fetch(`${this.API_URL}/api/bot/set-balance`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        balance: newBalance,
                        mode: 'PAPER',
                        override: true,
                        timestamp: new Date().toISOString()
                    })
                });
            } catch (error) {
                console.log('Backend sync failed, using local balance');
            }
            
            this.notifyListeners();
            return true;
        }
    }
    
    async resetBot(resetAmount) {
        if (this.mode === 'REAL') {
            // Extra confirmation for real money
            const tripleConfirm = prompt(
                `🔴 REAL MONEY RESET\n\n` +
                `Type "RESET REAL MONEY" to confirm resetting to $${resetAmount.toFixed(2)}`
            );
            
            if (tripleConfirm !== 'RESET REAL MONEY') {
                alert('Reset cancelled - confirmation text did not match');
                return false;
            }
        }
        
        // Clear all stored data
        const keysToRemove = [
            'forced_balance',
            'paper_balance',
            'last_real_balance',
            'pending_balance',
            'balance_set_time',
            'last_known_balance'
        ];
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Set new balance
        const success = await this.setBalance(resetAmount, true);
        
        if (success) {
            // Reset other metrics
            this.notifyListeners({ reset: true, newBalance: resetAmount });
        }
        
        return success;
    }
    
    switchMode(newMode) {
        if (newMode === 'REAL') {
            const confirmed = confirm(
                `⚠️ SWITCHING TO REAL MONEY MODE\n\n` +
                `• Real funds will be at risk\n` +
                `• Balance will be controlled by backend\n` +
                `• All trades will use actual money\n\n` +
                `Are you sure you want to switch to REAL MONEY?`
            );
            
            if (!confirmed) {
                return false;
            }
        }
        
        this.mode = newMode;
        localStorage.setItem('trading_mode', newMode);
        
        // Reload state for new mode
        this.loadState();
        
        // Restart sync with appropriate interval
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        this.startSync();
        
        this.notifyListeners({ modeChanged: newMode });
        return true;
    }
    
    // Register listeners for balance updates
    addListener(callback) {
        this.listeners.push(callback);
    }
    
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }
    
    notifyListeners(additionalData = {}) {
        const data = {
            balance: this.currentBalance,
            mode: this.mode,
            timestamp: new Date().toISOString(),
            ...additionalData
        };
        
        this.listeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                console.error('Listener error:', error);
            }
        });
        
        // Broadcast to all open panels via storage event
        localStorage.setItem('balance_update', JSON.stringify(data));
        
        // Also broadcast via custom event
        window.dispatchEvent(new CustomEvent('balanceUpdate', { detail: data }));
    }
    
    getBalance() {
        return this.currentBalance;
    }
    
    getMode() {
        return this.mode;
    }
    
    isRealMoney() {
        return this.mode === 'REAL';
    }
    
    // Update all UI elements across all panels
    updateAllDisplays() {
        const balanceStr = `$${this.currentBalance.toFixed(2)}`;
        
        // Update all possible balance displays
        const selectors = [
            '#current-capital',
            '#current-balance',
            '#balance',
            '.current-balance',
            '.balance-display'
        ];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el) {
                    el.textContent = balanceStr;
                }
            });
        });
        
        // Update Starting Capital
        const startingCapitalElements = document.querySelectorAll('.metric-value');
        if (startingCapitalElements[0]) {
            startingCapitalElements[0].textContent = `${balanceStr} AUD`;
        }
        
        // Update mode indicators
        const modeElements = document.querySelectorAll('.trading-mode');
        modeElements.forEach(el => {
            if (el) {
                el.textContent = this.mode;
                el.className = `trading-mode ${this.mode.toLowerCase()}`;
            }
        });
        
        // Show warnings for real money mode
        if (this.mode === 'REAL') {
            const warningHtml = `<span style="color: #ff4444; font-weight: bold;">⚠️ REAL MONEY MODE</span>`;
            const warningElements = document.querySelectorAll('.mode-warning');
            warningElements.forEach(el => {
                if (el) el.innerHTML = warningHtml;
            });
        }
    }
}

// Create global instance
window.balanceManager = new BalanceManager();

// Listen for storage events from other tabs/panels
window.addEventListener('storage', (e) => {
    if (e.key === 'balance_update') {
        try {
            const data = JSON.parse(e.newValue);
            window.balanceManager.currentBalance = data.balance;
            window.balanceManager.mode = data.mode;
            window.balanceManager.updateAllDisplays();
        } catch (error) {
            console.error('Error processing balance update:', error);
        }
    }
});

// Auto-update displays when balance changes
window.balanceManager.addListener((data) => {
    window.balanceManager.updateAllDisplays();
});

console.log('💰 Balance Manager initialized');
console.log(`Mode: ${window.balanceManager.getMode()}`);
console.log(`Balance: $${window.balanceManager.getBalance().toFixed(2)}`);
