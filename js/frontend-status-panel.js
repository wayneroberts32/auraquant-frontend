// Frontend Status Panel - Monitor Frontend Health
// Embedded status panel for the platform

class FrontendStatusPanel {
    constructor() {
        this.status = {
            jsFiles: { loaded: 0, total: 23, status: 'checking' },
            cssFiles: { loaded: 0, total: 2, status: 'checking' },
            apiConnection: { status: 'checking', latency: 0 },
            websocket: { status: 'checking', messages: 0 },
            localStorage: { available: false, used: 0 },
            memory: { used: 0, limit: 0 },
            errors: [],
            warnings: [],
            loadTime: 0,
            version: '2.0'
        };
        
        this.panelVisible = false;
        this.updateInterval = null;
    }

    init() {
        this.createPanel();
        this.startMonitoring();
        this.attachErrorHandlers();
        console.log('📊 Frontend Status Panel initialized');
    }

    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'frontend-status-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 320px;
            max-height: 500px;
            background: rgba(10, 10, 10, 0.95);
            border: 2px solid rgba(0, 255, 136, 0.3);
            border-radius: 10px;
            padding: 15px;
            z-index: 9999;
            display: none;
            font-family: 'Segoe UI', system-ui, sans-serif;
            color: #fff;
            overflow-y: auto;
        `;

        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #00ff88; font-size: 16px;">🖥️ Frontend Status</h3>
                <button id="close-frontend-status" style="background: transparent; border: none; color: #fff; cursor: pointer; font-size: 20px;">×</button>
            </div>

            <div style="display: grid; gap: 10px;">
                <!-- Load Status -->
                <div style="background: rgba(255, 255, 255, 0.05); padding: 10px; border-radius: 5px;">
                    <div style="color: #00ff88; font-size: 12px; margin-bottom: 5px;">📦 RESOURCE LOADING</div>
                    <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                        <span style="font-size: 11px;">JavaScript:</span>
                        <span id="js-status" style="font-size: 11px;">0/23</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                        <span style="font-size: 11px;">CSS:</span>
                        <span id="css-status" style="font-size: 11px;">0/2</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                        <span style="font-size: 11px;">Load Time:</span>
                        <span id="load-time" style="font-size: 11px;">0ms</span>
                    </div>
                </div>

                <!-- API Connection -->
                <div style="background: rgba(255, 255, 255, 0.05); padding: 10px; border-radius: 5px;">
                    <div style="color: #00ff88; font-size: 12px; margin-bottom: 5px;">🔌 CONNECTIONS</div>
                    <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                        <span style="font-size: 11px;">Backend API:</span>
                        <span id="api-status" style="font-size: 11px;">Checking...</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                        <span style="font-size: 11px;">WebSocket:</span>
                        <span id="ws-status" style="font-size: 11px;">Checking...</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                        <span style="font-size: 11px;">Latency:</span>
                        <span id="latency" style="font-size: 11px;">0ms</span>
                    </div>
                </div>

                <!-- Memory Usage -->
                <div style="background: rgba(255, 255, 255, 0.05); padding: 10px; border-radius: 5px;">
                    <div style="color: #00ff88; font-size: 12px; margin-bottom: 5px;">💾 MEMORY</div>
                    <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                        <span style="font-size: 11px;">Used:</span>
                        <span id="memory-used" style="font-size: 11px;">0 MB</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                        <span style="font-size: 11px;">LocalStorage:</span>
                        <span id="storage-status" style="font-size: 11px;">Available</span>
                    </div>
                </div>

                <!-- Errors & Warnings -->
                <div style="background: rgba(255, 255, 255, 0.05); padding: 10px; border-radius: 5px;">
                    <div style="color: #00ff88; font-size: 12px; margin-bottom: 5px;">⚠️ DIAGNOSTICS</div>
                    <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                        <span style="font-size: 11px;">Errors:</span>
                        <span id="error-count" style="font-size: 11px; color: #ff4444;">0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                        <span style="font-size: 11px;">Warnings:</span>
                        <span id="warning-count" style="font-size: 11px; color: #ffaa00;">0</span>
                    </div>
                    <div id="error-list" style="max-height: 100px; overflow-y: auto; margin-top: 5px; font-size: 10px;"></div>
                </div>

                <!-- Overall Status -->
                <div style="background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 255, 255, 0.1)); padding: 10px; border-radius: 5px; text-align: center;">
                    <div id="overall-frontend-status" style="font-size: 14px; font-weight: bold;">
                        ⏳ Checking...
                    </div>
                </div>

                <!-- Refresh Button -->
                <button id="refresh-frontend-status" style="
                    background: linear-gradient(135deg, #00ff88, #00ffff);
                    border: none;
                    color: #000;
                    padding: 8px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 12px;
                ">🔄 Refresh Status</button>
            </div>
        `;

        document.body.appendChild(panel);
        this.panel = panel;

        // Add toggle button
        this.createToggleButton();

        // Event listeners
        document.getElementById('close-frontend-status').addEventListener('click', () => {
            this.hide();
        });

        document.getElementById('refresh-frontend-status').addEventListener('click', () => {
            this.checkAllStatus();
        });
    }

    createToggleButton() {
        const button = document.createElement('button');
        button.id = 'frontend-status-toggle';
        button.innerHTML = '📱';
        button.title = 'Frontend Status';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #00ff88, #00ffff);
            border: none;
            cursor: pointer;
            z-index: 9998;
            font-size: 20px;
            box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
            transition: all 0.3s;
        `;

        button.addEventListener('click', () => {
            this.toggle();
        });

        document.body.appendChild(button);
        this.toggleButton = button;
    }

    toggle() {
        this.panelVisible = !this.panelVisible;
        this.panel.style.display = this.panelVisible ? 'block' : 'none';
        this.toggleButton.style.display = this.panelVisible ? 'none' : 'block';
        
        if (this.panelVisible) {
            this.checkAllStatus();
        }
    }

    show() {
        this.panelVisible = true;
        this.panel.style.display = 'block';
        this.toggleButton.style.display = 'none';
        this.checkAllStatus();
    }

    hide() {
        this.panelVisible = false;
        this.panel.style.display = 'none';
        this.toggleButton.style.display = 'block';
    }

    startMonitoring() {
        // Check status every 5 seconds
        this.updateInterval = setInterval(() => {
            if (this.panelVisible) {
                this.checkAllStatus();
            }
        }, 5000);

        // Initial check
        setTimeout(() => this.checkAllStatus(), 1000);
    }

    async checkAllStatus() {
        // Check JS files
        this.checkJavaScriptFiles();
        
        // Check CSS files
        this.checkCSSFiles();
        
        // Check API connection
        await this.checkAPIConnection();
        
        // Check WebSocket
        this.checkWebSocket();
        
        // Check memory
        this.checkMemory();
        
        // Check localStorage
        this.checkLocalStorage();
        
        // Update overall status
        this.updateOverallStatus();
    }

    checkJavaScriptFiles() {
        const scripts = document.querySelectorAll('script[src]');
        this.status.jsFiles.loaded = scripts.length;
        document.getElementById('js-status').textContent = `${scripts.length}/23`;
        document.getElementById('js-status').style.color = scripts.length >= 20 ? '#00ff88' : '#ffaa00';
    }

    checkCSSFiles() {
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        this.status.cssFiles.loaded = stylesheets.length;
        document.getElementById('css-status').textContent = `${stylesheets.length}/2`;
        document.getElementById('css-status').style.color = stylesheets.length >= 2 ? '#00ff88' : '#ffaa00';
    }

    async checkAPIConnection() {
        const startTime = Date.now();
        try {
            const response = await fetch('https://auraquant-backend.onrender.com/api/health');
            const latency = Date.now() - startTime;
            
            if (response.ok) {
                this.status.apiConnection.status = 'connected';
                this.status.apiConnection.latency = latency;
                document.getElementById('api-status').textContent = 'Connected';
                document.getElementById('api-status').style.color = '#00ff88';
                document.getElementById('latency').textContent = `${latency}ms`;
                document.getElementById('latency').style.color = latency < 500 ? '#00ff88' : '#ffaa00';
            } else {
                throw new Error('API not responding');
            }
        } catch (error) {
            this.status.apiConnection.status = 'disconnected';
            document.getElementById('api-status').textContent = 'Disconnected';
            document.getElementById('api-status').style.color = '#ff4444';
        }
    }

    checkWebSocket() {
        if (window.ws && window.ws.readyState === WebSocket.OPEN) {
            this.status.websocket.status = 'connected';
            document.getElementById('ws-status').textContent = 'Connected';
            document.getElementById('ws-status').style.color = '#00ff88';
        } else {
            this.status.websocket.status = 'disconnected';
            document.getElementById('ws-status').textContent = 'Disconnected';
            document.getElementById('ws-status').style.color = '#ff4444';
        }
    }

    checkMemory() {
        if (performance.memory) {
            const used = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
            const limit = (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2);
            this.status.memory.used = used;
            this.status.memory.limit = limit;
            document.getElementById('memory-used').textContent = `${used} MB`;
            
            const percentage = (used / limit) * 100;
            document.getElementById('memory-used').style.color = percentage < 80 ? '#00ff88' : '#ffaa00';
        } else {
            document.getElementById('memory-used').textContent = 'N/A';
        }
    }

    checkLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            this.status.localStorage.available = true;
            document.getElementById('storage-status').textContent = 'Available';
            document.getElementById('storage-status').style.color = '#00ff88';
        } catch (e) {
            this.status.localStorage.available = false;
            document.getElementById('storage-status').textContent = 'Unavailable';
            document.getElementById('storage-status').style.color = '#ff4444';
        }
    }

    updateOverallStatus() {
        const jsOk = this.status.jsFiles.loaded >= 20;
        const cssOk = this.status.cssFiles.loaded >= 2;
        const apiOk = this.status.apiConnection.status === 'connected';
        const wsOk = this.status.websocket.status === 'connected';
        const errorsOk = this.status.errors.length === 0;

        const overallElement = document.getElementById('overall-frontend-status');
        
        if (jsOk && cssOk && apiOk && errorsOk) {
            overallElement.innerHTML = '✅ ALL SYSTEMS OPERATIONAL';
            overallElement.style.color = '#00ff88';
            this.toggleButton.style.background = 'linear-gradient(135deg, #00ff88, #00ffff)';
        } else if (apiOk && jsOk) {
            overallElement.innerHTML = '⚠️ MINOR ISSUES';
            overallElement.style.color = '#ffaa00';
            this.toggleButton.style.background = 'linear-gradient(135deg, #ffaa00, #ffcc00)';
        } else {
            overallElement.innerHTML = '❌ CRITICAL ISSUES';
            overallElement.style.color = '#ff4444';
            this.toggleButton.style.background = 'linear-gradient(135deg, #ff4444, #ff8844)';
        }

        // Update load time
        if (performance.timing) {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            document.getElementById('load-time').textContent = `${loadTime}ms`;
            document.getElementById('load-time').style.color = loadTime < 3000 ? '#00ff88' : '#ffaa00';
        }
    }

    attachErrorHandlers() {
        // Capture errors
        window.addEventListener('error', (event) => {
            this.status.errors.push({
                message: event.message,
                source: event.filename,
                line: event.lineno,
                col: event.colno,
                time: new Date().toISOString()
            });
            
            // Keep only last 10 errors
            if (this.status.errors.length > 10) {
                this.status.errors.shift();
            }
            
            this.updateErrorDisplay();
        });

        // Capture unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.status.errors.push({
                message: event.reason,
                type: 'Promise Rejection',
                time: new Date().toISOString()
            });
            
            this.updateErrorDisplay();
        });

        // Capture console warnings
        const originalWarn = console.warn;
        console.warn = (...args) => {
            this.status.warnings.push({
                message: args.join(' '),
                time: new Date().toISOString()
            });
            this.updateErrorDisplay();
            originalWarn.apply(console, args);
        };
    }

    updateErrorDisplay() {
        document.getElementById('error-count').textContent = this.status.errors.length;
        document.getElementById('warning-count').textContent = this.status.warnings.length;
        
        const errorList = document.getElementById('error-list');
        errorList.innerHTML = '';
        
        // Show last 3 errors
        this.status.errors.slice(-3).forEach(error => {
            const div = document.createElement('div');
            div.style.cssText = 'color: #ff4444; margin: 2px 0; padding: 2px; border-left: 2px solid #ff4444; padding-left: 5px;';
            div.textContent = error.message || 'Unknown error';
            errorList.appendChild(div);
        });
    }
}

// Initialize frontend status panel
window.frontendStatus = new FrontendStatusPanel();
window.frontendStatus.init();
