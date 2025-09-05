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
                    <h1>AuraQuant</h1>
                    <input type="text" id="username" placeholder="Username" required>
                    <input type="password" id="password" placeholder="Password" required>
                    <button type="submit">Login</button>
                </form>
            </div>
        `;
        
        document.getElementById('loginForm').onsubmit = async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                await this.auth.login(username, password);
                this.showDashboard();
                this.ws.connect(this.auth.token);
            } catch (error) {
                alert('Login failed: ' + error.message);
            }
        };
    }
    
    showDashboard() {
        document.getElementById('app').innerHTML = `
            <div class="dashboard">
                <header>
                    <h1>AuraQuant Trading Platform</h1>
                    <button onclick="app.auth.logout()">Logout</button>
                </header>
                <main>
                    <div id="chart">Chart will load here</div>
                    <div id="trading-panel">Trading panel</div>
                </main>
            </div>
        `;
    }
}

// Initialize app
const app = new AuraQuantApp();
