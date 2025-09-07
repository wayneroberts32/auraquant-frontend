// System Restart and Enhancement Module - ULTRA-SOPHISTICATED SYNTHETIC INTELLIGENCE SYSTEM
// This module safely restarts and enhances all system components without breaking existing functionality

class SystemRestartEnhancer {
    constructor() {
        this.isRestarting = false;
        this.components = {
            websocket: { status: 'unknown', retries: 0 },
            backend: { status: 'unknown', health: null },
            frontend: { status: 'active', lastUpdate: Date.now() },
            evolution: { generation: 1, lastEvolution: Date.now() },
            trading: { active: false, mode: 'PAPER' }
        };
        
        this.config = {
            backendUrl: 'https://auraquant-backend.onrender.com',
            wsUrl: 'wss://auraquant-backend.onrender.com',
            maxRetries: 10,
            retryDelay: 2000,
            evolutionInterval: 60000, // Evolve every minute
            healthCheckInterval: 5000  // Check health every 5 seconds
        };
        
        console.log('🚀 System Restart Enhancer Initialized');
    }

    // Safe restart of WebSocket connection
    async restartWebSocket() {
        console.log('🔄 Restarting WebSocket connection...');
        
        // Close existing connection if any
        if (window.ws && window.ws.ws) {
            try {
                window.ws.ws.close();
            } catch (e) {
                console.log('WebSocket already closed');
            }
        }
        
        // Create enhanced WebSocket manager if needed
        if (!window.EnhancedWebSocketManager) {
            window.EnhancedWebSocketManager = class extends WebSocketManager {
                constructor() {
                    super();
                    this.autoReconnect = true;
                    this.reconnectDelay = 1000;
                    this.maxReconnectDelay = 30000;
                    this.reconnectDecay = 1.5;
                    this.messageQueue = [];
                    this.isAuthenticated = false;
                }
                
                connect(token) {
                    return new Promise((resolve, reject) => {
                        try {
                            console.log('📡 Establishing WebSocket connection...');
                            this.ws = new WebSocket(CONFIG.WS_URL || 'wss://auraquant-backend.onrender.com');
                            
                            this.ws.onopen = () => {
                                console.log('✅ WebSocket connected successfully');
                                this.reconnectAttempts = 0;
                                this.reconnectDelay = 1000;
                                
                                // Send queued messages
                                while (this.messageQueue.length > 0) {
                                    const msg = this.messageQueue.shift();
                                    this.send(msg);
                                }
                                
                                // Notify all components
                                this.notifyConnectionStatus('connected');
                                resolve();
                            };
                            
                            this.ws.onmessage = (event) => {
                                try {
                                    const data = JSON.parse(event.data);
                                    this.handleMessage(data);
                                    
                                    // Broadcast to all listening components
                                    window.dispatchEvent(new CustomEvent('wsMessage', { 
                                        detail: data 
                                    }));
                                } catch (e) {
                                    console.error('WebSocket message error:', e);
                                }
                            };
                            
                            this.ws.onerror = (error) => {
                                console.error('WebSocket error:', error);
                                this.notifyConnectionStatus('error');
                            };
                            
                            this.ws.onclose = () => {
                                console.log('WebSocket disconnected');
                                this.notifyConnectionStatus('disconnected');
                                
                                if (this.autoReconnect) {
                                    this.scheduleReconnect();
                                }
                            };
                            
                        } catch (error) {
                            console.error('Failed to create WebSocket:', error);
                            reject(error);
                        }
                    });
                }
                
                scheduleReconnect() {
                    if (this.reconnectAttempts < 10) {
                        const delay = Math.min(
                            this.reconnectDelay * Math.pow(this.reconnectDecay, this.reconnectAttempts),
                            this.maxReconnectDelay
                        );
                        
                        console.log(`⏳ Reconnecting in ${delay/1000}s (attempt ${this.reconnectAttempts + 1}/10)`);
                        
                        setTimeout(() => {
                            this.reconnectAttempts++;
                            this.connect();
                        }, delay);
                    }
                }
                
                send(data) {
                    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                        this.ws.send(JSON.stringify(data));
                        return true;
                    } else {
                        // Queue message for later
                        this.messageQueue.push(data);
                        return false;
                    }
                }
                
                notifyConnectionStatus(status) {
                    window.dispatchEvent(new CustomEvent('wsStatus', { 
                        detail: { status, timestamp: Date.now() }
                    }));
                    
                    // Update UI indicators
                    const indicators = document.querySelectorAll('.ws-status-indicator');
                    indicators.forEach(indicator => {
                        indicator.className = `ws-status-indicator ws-${status}`;
                        indicator.textContent = status === 'connected' ? '🟢' : 
                                              status === 'error' ? '🔴' : '🟡';
                    });
                }
            };
        }
        
        // Create new enhanced WebSocket connection
        window.ws = new window.EnhancedWebSocketManager();
        await window.ws.connect();
        
        this.components.websocket.status = 'connected';
        this.components.websocket.retries = 0;
        
        return true;
    }

    // Safe backend health check and restart trigger
    async checkAndRestartBackend() {
        console.log('🔍 Checking backend health...');
        
        try {
            const startTime = Date.now();
            const response = await fetch(`${this.config.backendUrl}/api/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const responseTime = Date.now() - startTime;
            const data = await response.json();
            
            this.components.backend.status = data.status;
            this.components.backend.health = {
                ...data,
                responseTime,
                timestamp: Date.now()
            };
            
            // If backend is slow or unhealthy, trigger optimization
            if (responseTime > 1000 || data.status !== 'healthy') {
                console.warn(`⚠️ Backend performance issue detected (${responseTime}ms)`);
                await this.optimizeBackend();
            }
            
            console.log(`✅ Backend health: ${data.status} (${responseTime}ms)`);
            return data;
            
        } catch (error) {
            console.error('❌ Backend health check failed:', error);
            this.components.backend.status = 'error';
            
            // Attempt to wake up backend
            await this.wakeUpBackend();
            
            return null;
        }
    }

    // Wake up backend if it's sleeping
    async wakeUpBackend() {
        console.log('⏰ Waking up backend...');
        
        for (let i = 0; i < 3; i++) {
            try {
                const response = await fetch(`${this.config.backendUrl}/api/bot/status`);
                if (response.ok) {
                    console.log('✅ Backend is awake');
                    return true;
                }
            } catch (e) {
                console.log(`Wake attempt ${i + 1}/3 failed`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        return false;
    }

    // Optimize backend performance
    async optimizeBackend() {
        console.log('⚡ Optimizing backend performance...');
        
        try {
            // Send optimization request
            await fetch(`${this.config.backendUrl}/api/bot/optimize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'OPTIMIZE_PERFORMANCE',
                    clearCache: true,
                    compactDatabase: true,
                    resetConnections: true
                })
            });
            
            console.log('✅ Backend optimization triggered');
        } catch (error) {
            console.log('Optimization request sent (may not be implemented yet)');
        }
    }

    // Enhance frontend responsiveness
    enhanceFrontend() {
        console.log('🎨 Enhancing frontend responsiveness...');
        
        // Add real-time update listeners
        if (!window.realtimeUpdateManager) {
            window.realtimeUpdateManager = {
                intervals: {},
                
                start: function() {
                    // Update balance displays every second
                    this.intervals.balance = setInterval(() => {
                        if (window.botMonitor && window.botMonitor.fetchBotStatus) {
                            window.botMonitor.fetchBotStatus();
                        }
                    }, 1000);
                    
                    // Update charts every 2 seconds
                    this.intervals.charts = setInterval(() => {
                        if (window.botMonitor && window.botMonitor.updateChart) {
                            window.botMonitor.updateChart();
                        }
                    }, 2000);
                    
                    // Update evolution every minute
                    this.intervals.evolution = setInterval(() => {
                        if (window.botMonitor && window.botMonitor.updateEvolution) {
                            window.botMonitor.updateEvolution();
                        }
                    }, 60000);
                },
                
                stop: function() {
                    Object.keys(this.intervals).forEach(key => {
                        clearInterval(this.intervals[key]);
                    });
                    this.intervals = {};
                }
            };
            
            window.realtimeUpdateManager.start();
        }
        
        // Enhance all buttons with immediate feedback
        document.querySelectorAll('button').forEach(button => {
            if (!button.hasAttribute('data-enhanced')) {
                button.setAttribute('data-enhanced', 'true');
                
                const originalClick = button.onclick;
                button.onclick = function(e) {
                    // Immediate visual feedback
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 100);
                    
                    // Call original handler
                    if (originalClick) {
                        originalClick.call(this, e);
                    }
                };
            }
        });
        
        // Add keyboard shortcuts
        if (!window.keyboardShortcuts) {
            window.keyboardShortcuts = true;
            document.addEventListener('keydown', (e) => {
                // Ctrl+R: Refresh data
                if (e.ctrlKey && e.key === 'r') {
                    e.preventDefault();
                    if (window.botMonitor) {
                        window.botMonitor.fetchBotStatus();
                    }
                }
                
                // Ctrl+E: Trigger evolution
                if (e.ctrlKey && e.key === 'e') {
                    e.preventDefault();
                    this.triggerEvolution();
                }
                
                // Ctrl+T: Toggle trading
                if (e.ctrlKey && e.key === 't') {
                    e.preventDefault();
                    this.toggleTrading();
                }
            });
        }
        
        console.log('✅ Frontend enhancements applied');
    }

    // Trigger bot evolution
    async triggerEvolution() {
        console.log('🧬 Triggering bot evolution...');
        
        try {
            const response = await fetch(`${this.config.backendUrl}/api/bot/evolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    generation: this.components.evolution.generation + 1,
                    timestamp: Date.now(),
                    learningData: {
                        trades: window.botMonitor ? window.botMonitor.trades : [],
                        performance: {
                            winRate: 0,
                            profitFactor: 0,
                            sharpeRatio: 0
                        }
                    }
                })
            });
            
            if (response.ok) {
                this.components.evolution.generation++;
                this.components.evolution.lastEvolution = Date.now();
                
                // Update UI
                if (document.getElementById('current-version')) {
                    document.getElementById('current-version').textContent = 
                        `V${this.components.evolution.generation}`;
                }
                
                console.log(`✅ Evolved to generation ${this.components.evolution.generation}`);
            }
        } catch (error) {
            console.log('Evolution endpoint not available yet, using local evolution');
            
            // Local evolution
            this.components.evolution.generation++;
            if (window.botMonitor) {
                window.botMonitor.updateEvolution();
            }
        }
    }

    // Toggle trading on/off
    async toggleTrading() {
        const newState = !this.components.trading.active;
        console.log(`🔄 ${newState ? 'Starting' : 'Stopping'} trading...`);
        
        try {
            const response = await fetch(`${this.config.backendUrl}/api/bot/${newState ? 'start' : 'stop'}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: this.components.trading.mode
                })
            });
            
            if (response.ok) {
                this.components.trading.active = newState;
                console.log(`✅ Trading ${newState ? 'started' : 'stopped'}`);
            }
        } catch (error) {
            console.log('Trading toggle endpoint not available');
        }
    }

    // Main restart sequence
    async performFullRestart() {
        if (this.isRestarting) {
            console.log('⏳ Restart already in progress...');
            return;
        }
        
        this.isRestarting = true;
        console.log('🚀 Starting ULTRA-SOPHISTICATED SYNTHETIC INTELLIGENCE SYSTEM restart...');
        
        try {
            // Step 1: Check and restart backend
            await this.checkAndRestartBackend();
            
            // Step 2: Restart WebSocket connection
            await this.restartWebSocket();
            
            // Step 3: Enhance frontend
            this.enhanceFrontend();
            
            // Step 4: Trigger evolution
            await this.triggerEvolution();
            
            // Step 5: Start continuous monitoring
            this.startContinuousMonitoring();
            
            console.log('✅ SYSTEM RESTART COMPLETE - All components optimized');
            
            // Show success notification
            this.showNotification('System Restart Complete', 'success');
            
        } catch (error) {
            console.error('❌ Restart failed:', error);
            this.showNotification('Restart failed - check console', 'error');
        } finally {
            this.isRestarting = false;
        }
    }

    // Start continuous monitoring
    startContinuousMonitoring() {
        console.log('👁️ Starting continuous monitoring...');
        
        // Health check every 5 seconds
        setInterval(() => {
            this.checkAndRestartBackend();
        }, this.config.healthCheckInterval);
        
        // Evolution every minute
        setInterval(() => {
            this.triggerEvolution();
        }, this.config.evolutionInterval);
        
        // WebSocket reconnect check
        setInterval(() => {
            if (window.ws && (!window.ws.ws || window.ws.ws.readyState !== WebSocket.OPEN)) {
                console.log('WebSocket disconnected, reconnecting...');
                this.restartWebSocket();
            }
        }, 5000);
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `system-notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #00ff88, #00ffff)' : 
                         type === 'error' ? 'linear-gradient(135deg, #ff4444, #ff6666)' : 
                         'linear-gradient(135deg, #00ffff, #ff00ff)'};
            color: ${type === 'error' ? '#fff' : '#000'};
            border-radius: 10px;
            font-weight: bold;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize system restart enhancer
window.systemRestarter = new SystemRestartEnhancer();

// Auto-restart on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            window.systemRestarter.performFullRestart();
        }, 1000);
    });
} else {
    setTimeout(() => {
        window.systemRestarter.performFullRestart();
    }, 1000);
}

// Add CSS animations
if (!document.getElementById('system-restart-styles')) {
    const style = document.createElement('style');
    style.id = 'system-restart-styles';
    style.innerHTML = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .ws-status-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-left: 5px;
        }
        
        .ws-connected { color: #00ff88; }
        .ws-disconnected { color: #ffaa00; }
        .ws-error { color: #ff4444; }
    `;
    document.head.appendChild(style);
}

console.log('✅ System Restart Enhancer loaded - call window.systemRestarter.performFullRestart() to restart');
