// js/app.js - Main Application
class AuraQuantApp {
    constructor() {
        this.auth = new AuthManager();
        this.ws = new WebSocketManager();
        this.trading = new TradingManager(this.auth);
        
        this.init();
    }
    
    async init() {
        if (this.auth.isAuthenticated()) {
            this.showDashboard();
            this.ws.connect(this.auth.token);
        } else {
            this.showLogin();
        }
        
        // Hide loading screen
        document.getElementById('loadingScreen').style.display = 'none';
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
        // Use the Cockpit Infinity dashboard
        if (window.cockpit) {
            window.cockpit.init();
        } else {
            // Fallback to simple dashboard
            document.getElementById('app').innerHTML = `
                <div class="dashboard">
                    <header>
                        <h1>AuraQuant Trading Platform</h1>
                        <button onclick="app.auth.logout()">Logout</button>
                    </header>
                    <main>
                        <div id="chart">Loading Cockpit Infinity...</div>
                        <div id="trading-panel">Initializing systems...</div>
                    </main>
                </div>
            `;
        }
    }
}

// Initialize app
const app = new AuraQuantApp();
