// js/app.js - Main Application
class AuraQuantApp {
    constructor() {
        this.auth = new AuthManager();
        this.ws = new WebSocketManager();
        this.trading = new TradingManager(this.auth);
        
        this.init();
    }
    
    async init() {
        try {
            // TEMPORARY: Skip auth and go straight to dashboard
            // TODO: Re-enable auth once login system is configured
            this.showDashboard();
            
            // Try to connect WebSocket without token for now
            try {
                this.ws.connect(null);
            } catch (error) {
                console.log('WebSocket connection pending...');
            }
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            // Show basic status even if dashboard fails
            document.getElementById('app').innerHTML = `
                <div style="padding: 20px; color: white;">
                    <h1>AuraQuant Status</h1>
                    <p>Backend: <a href="https://auraquant-backend.onrender.com/api/health" target="_blank">Check Health</a></p>
                    <p>Bot Status: <a href="https://auraquant-backend.onrender.com/api/bot/status" target="_blank">Check Bot</a></p>
                    <div id="botStatus">Loading bot status...</div>
                </div>
            `;
            // Fetch and display bot status
            this.fetchBotStatus();
        } finally {
            // Always hide loading screen
            document.getElementById('loadingScreen').style.display = 'none';
        }
        
        /* Original auth flow - restore later
        if (this.auth.isAuthenticated()) {
            this.showDashboard();
            this.ws.connect(this.auth.token);
        } else {
            this.showLogin();
        }
        */
    }
    
    showLogin() {
        document.getElementById('app').innerHTML = `
            <div class="login-container">
                <form id="loginForm">
                    <div class="logo-container">
                        <svg class="infinity-logo" width="60" height="60" viewBox="0 0 100 50">
                            <path d="M25,25 C25,10 10,10 10,25 S25,40 25,25 L75,25 C75,10 90,10 90,25 S75,40 75,25" 
                                  fill="none" 
                                  stroke="url(#gradient)" 
                                  stroke-width="4"
                                  class="infinity-path"/>
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style="stop-color:#3b82f6">
                                        <animate attributeName="stop-color" values="#3b82f6;#8b5cf6;#ec4899;#f59e0b;#3b82f6" dur="4s" repeatCount="indefinite"/>
                                    </stop>
                                    <stop offset="50%" style="stop-color:#8b5cf6">
                                        <animate attributeName="stop-color" values="#8b5cf6;#ec4899;#f59e0b;#3b82f6;#8b5cf6" dur="4s" repeatCount="indefinite"/>
                                    </stop>
                                    <stop offset="100%" style="stop-color:#ec4899">
                                        <animate attributeName="stop-color" values="#ec4899;#f59e0b;#3b82f6;#8b5cf6;#ec4899" dur="4s" repeatCount="indefinite"/>
                                    </stop>
                                </linearGradient>
                            </defs>
                        </svg>
                        <h1 class="logo-text">AuraQuant</h1>
                    </div>
                    <div id="error-message" style="color: #ef4444; text-align: center; margin-bottom: 15px; display: none;"></div>
                    <input type="text" id="username" placeholder="Username" required>
                    <input type="password" id="password" placeholder="Password" required>
                    <button type="submit">Login</button>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="#" id="forgotPassword" style="color: #3b82f6; text-decoration: none; font-size: 0.9rem;">Forgot Password?</a>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('loginForm').onsubmit = async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('error-message');
            
            // Show loading state
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;
            
            try {
                console.log('Attempting login to:', CONFIG.API_URL);
                await this.auth.login(username, password);
                this.showDashboard();
                this.ws.connect(this.auth.token);
            } catch (error) {
                console.error('Login error:', error);
                errorDiv.textContent = error.message || 'Login failed. Please check your credentials.';
                errorDiv.style.display = 'block';
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        };
        
        // Add forgot password handler
        document.getElementById('forgotPassword').onclick = (e) => {
            e.preventDefault();
            this.showPasswordReset();
        };
    }
    
    showPasswordReset() {
        document.getElementById('app').innerHTML = `
            <div class="login-container">
                <form id="resetForm">
                    <div class="logo-container">
                        <svg class="infinity-logo" width="60" height="60" viewBox="0 0 100 50">
                            <path d="M25,25 C25,10 10,10 10,25 S25,40 25,25 L75,25 C75,10 90,10 90,25 S75,40 75,25" 
                                  fill="none" 
                                  stroke="url(#gradient2)" 
                                  stroke-width="4"
                                  class="infinity-path"/>
                            <defs>
                                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style="stop-color:#3b82f6">
                                        <animate attributeName="stop-color" values="#3b82f6;#8b5cf6;#ec4899;#f59e0b;#3b82f6" dur="4s" repeatCount="indefinite"/>
                                    </stop>
                                    <stop offset="50%" style="stop-color:#8b5cf6">
                                        <animate attributeName="stop-color" values="#8b5cf6;#ec4899;#f59e0b;#3b82f6;#8b5cf6" dur="4s" repeatCount="indefinite"/>
                                    </stop>
                                    <stop offset="100%" style="stop-color:#ec4899">
                                        <animate attributeName="stop-color" values="#ec4899;#f59e0b;#3b82f6;#8b5cf6;#ec4899" dur="4s" repeatCount="indefinite"/>
                                    </stop>
                                </linearGradient>
                            </defs>
                        </svg>
                        <h1 class="logo-text">Reset Password</h1>
                    </div>
                    <div id="reset-message" style="text-align: center; margin-bottom: 15px; display: none;"></div>
                    <input type="email" id="resetEmail" placeholder="Enter your email" required>
                    <button type="submit">Send Reset Link</button>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="#" id="backToLogin" style="color: #3b82f6; text-decoration: none; font-size: 0.9rem;">Back to Login</a>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('resetForm').onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('resetEmail').value;
            const messageDiv = document.getElementById('reset-message');
            const submitBtn = e.target.querySelector('button[type="submit"]');
            
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch(`${CONFIG.API_URL}/api/auth/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                
                if (response.ok) {
                    messageDiv.style.color = '#10b981';
                    messageDiv.textContent = 'Reset link sent! Check your email.';
                } else {
                    messageDiv.style.color = '#ef4444';
                    messageDiv.textContent = 'Failed to send reset link. Please try again.';
                }
                messageDiv.style.display = 'block';
            } catch (error) {
                messageDiv.style.color = '#ef4444';
                messageDiv.textContent = 'Network error. Please try again.';
                messageDiv.style.display = 'block';
            }
            
            submitBtn.textContent = 'Send Reset Link';
            submitBtn.disabled = false;
        };
        
        document.getElementById('backToLogin').onclick = (e) => {
            e.preventDefault();
            this.showLogin();
        };
    }
    
    showDashboard() {
        try {
            // Use the Cockpit Infinity dashboard
            if (window.cockpit) {
                window.cockpit.init();
            } else {
                // Fallback to simple dashboard
                document.getElementById('app').innerHTML = `
                    <div class="dashboard">
                        <header>
                            <h1>AuraQuant Trading Platform</h1>
                        </header>
                        <main>
                            <div id="botStatusDisplay" style="padding: 20px; background: rgba(0,0,0,0.5); border-radius: 10px; margin: 20px;">
                                <h2 style="color: #00ff88;">Bot Status</h2>
                                <div id="statusContent">Loading...</div>
                            </div>
                        </main>
                    </div>
                `;
                this.fetchBotStatus();
            }
        } catch (error) {
            console.error('Dashboard error:', error);
            this.fetchBotStatus();
        }
    }
    
    async fetchBotStatus() {
        try {
            const response = await fetch('https://auraquant-backend.onrender.com/api/bot/status');
            const data = await response.json();
            
            const statusHTML = `
                <div style="color: white; font-family: monospace;">
                    <p>✅ Backend: ${data.status}</p>
                    <p>💰 Balance: $${data.bot.balance}</p>
                    <p>📊 Total Trades: ${data.bot.totalTrades}</p>
                    <p>🎯 Win Rate: ${data.bot.winRate}%</p>
                    <p>📈 Mode: ${data.bot.mode}</p>
                    <p>🤖 Trading: ${data.bot.trading ? 'Active' : 'Inactive'}</p>
                </div>
            `;
            
            const container = document.getElementById('statusContent') || document.getElementById('botStatus');
            if (container) {
                container.innerHTML = statusHTML;
            }
        } catch (error) {
            console.error('Failed to fetch bot status:', error);
        }
    }
}

// Initialize app
const app = new AuraQuantApp();
