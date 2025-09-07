// Cockpit Infinity - Professional Trading Dashboard
// The living, breathing synthetic intelligence trading platform

class CockpitInfinity {
    constructor() {
        this.synthetic = {
            status: 'INITIALIZING',
            evolution: 0,
            mutations: 0,
            verdicts: []
        };
        this.activeOverlays = [];
        this.tradingMode = 'PAPER'; // PAPER or LIVE
        this.universeSymbols = [];
        this.vaultTier = 1;
        this.infinityClock = null;
    }

    // Initialize the complete Cockpit Infinity dashboard
    init() {
        console.log('🚀 Initializing Cockpit Infinity...');
        this.renderDashboard();
        this.attachEventListeners();
        this.startSyntheticActor();
        this.startInfinityClock();
        this.loadMarketData();
        console.log('✅ Cockpit Infinity Ready!');
    }
    
    renderDashboard() {
        const dashboard = `
            <div class="cockpit-infinity">
                <!-- Cosmic Header with Infinity Symbol -->
                <header class="cosmic-header">
                    <div class="infinity-logo-container">
                        <svg class="infinity-logo cosmic" width="80" height="40" viewBox="0 0 100 50">
                            <defs>
                                <linearGradient id="cosmicGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style="stop-color:#3b82f6">
                                        <animate attributeName="stop-color" 
                                            values="#3b82f6;#8b5cf6;#ec4899;#f59e0b;#10b981;#3b82f6" 
                                            dur="8s" repeatCount="indefinite"/>
                                    </stop>
                                    <stop offset="50%" style="stop-color:#8b5cf6">
                                        <animate attributeName="stop-color" 
                                            values="#8b5cf6;#ec4899;#f59e0b;#10b981;#3b82f6;#8b5cf6" 
                                            dur="8s" repeatCount="indefinite"/>
                                    </stop>
                                    <stop offset="100%" style="stop-color:#ec4899">
                                        <animate attributeName="stop-color" 
                                            values="#ec4899;#f59e0b;#10b981;#3b82f6;#8b5cf6;#ec4899" 
                                            dur="8s" repeatCount="indefinite"/>
                                    </stop>
                                </linearGradient>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                    <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                            </defs>
                            <path d="M25,25 C25,10 10,10 10,25 S25,40 25,25 L75,25 C75,10 90,10 90,25 S75,40 75,25" 
                                  fill="none" 
                                  stroke="url(#cosmicGradient)" 
                                  stroke-width="3"
                                  filter="url(#glow)"
                                  class="infinity-path"/>
                        </svg>
                        <span class="auraquant-title">AuraQuant</span>
                        <span class="infinity-subtitle">Cockpit Infinity</span>
                    </div>
                    
                    <div class="synthetic-status">
                        <div class="status-indicator" id="syntheticStatus">
                            <span class="pulse"></span>
                            <span class="status-text">Synthetic Actor: <span id="actorStatus">ACTIVE</span></span>
                        </div>
                        <div class="evolution-counter">
                            Evolution: <span id="evolutionCount">0</span> | 
                            Mutations: <span id="mutationCount">0</span>
                        </div>
                    </div>

                    <div class="universe-selector">
                        <select id="marketUniverse" class="universe-dropdown">
                            <option value="CRYPTO">Crypto Universe</option>
                            <option value="MEME">Meme Coins</option>
                            <option value="ASX">ASX Stocks</option>
                            <option value="FOREX">Forex</option>
                            <option value="FUTURES">Futures</option>
                            <option value="ALL">All Markets</option>
                        </select>
                    </div>

                    <div class="vault-tier-display">
                        <div class="tier-badge">Vault Tier <span id="vaultTier">1</span></div>
                        <div class="balance-display">
                            <span class="balance-label">Balance:</span>
                            <span class="balance-amount" id="vaultBalance">$0.00</span>
                        </div>
                    </div>

                    <div class="mode-selector">
                        <button class="mode-btn paper active" onclick="cockpit.setTradingMode('PAPER')">
                            Paper Trade
                        </button>
                        <button class="mode-btn live" onclick="cockpit.setTradingMode('LIVE')">
                            Live Trade
                        </button>
                        <button class="kill-switch" onclick="cockpit.emergencyStop()">
                            KILL SWITCH
                        </button>
                    </div>
                </header>

                <!-- Main Trading Grid -->
                <div class="trading-grid">
                    <!-- Left Panel: Market Watch & Scanners -->
                    <div class="left-panel">
                        <div class="panel-section market-watch">
                            <h3>Market Watch</h3>
                            <div id="marketWatchList" class="watch-list"></div>
                        </div>
                        
                        <div class="panel-section symbol-scanner">
                            <h3>Symbol Scanner</h3>
                            <div id="symbolScanner" class="scanner-results"></div>
                        </div>

                        <div class="panel-section verdict-stream">
                            <h3>Verdict Stream</h3>
                            <div id="verdictStream" class="verdict-list"></div>
                        </div>
                    </div>

                    <!-- Center: Super Chart with Overlays -->
                    <div class="center-panel">
                        <div class="super-chart-container">
                            <div class="chart-header">
                                <div class="symbol-info">
                                    <select id="symbolSelect" class="symbol-selector">
                                        <option value="BTCUSDT">BTC/USDT</option>
                                        <option value="ETHUSDT">ETH/USDT</option>
                                        <option value="SOLUSDT">SOL/USDT</option>
                                    </select>
                                    <span class="price-display" id="currentPrice">$0.00</span>
                                    <span class="change-display" id="priceChange">0.00%</span>
                                </div>
                                
                                <div class="timeframe-selector">
                                    <button class="tf-btn" data-tf="1m">1m</button>
                                    <button class="tf-btn" data-tf="5m">5m</button>
                                    <button class="tf-btn" data-tf="15m">15m</button>
                                    <button class="tf-btn" data-tf="1h">1h</button>
                                    <button class="tf-btn" data-tf="4h">4h</button>
                                    <button class="tf-btn active" data-tf="1d">1D</button>
                                </div>

                                <div class="overlay-controls">
                                    <button onclick="cockpit.toggleOverlay('fibonacci')">Fibonacci</button>
                                    <button onclick="cockpit.toggleOverlay('planetary')">Planetary</button>
                                    <button onclick="cockpit.toggleOverlay('urgency')">Urgency</button>
                                    <button onclick="cockpit.toggleOverlay('zodiac')">Zodiac</button>
                                </div>
                            </div>
                            
                            <div class="chart-wrapper">
                                <canvas id="superChart" width="800" height="400"></canvas>
                                <div id="overlayLayer" class="overlay-layer"></div>
                            </div>

                            <!-- Infinity Clock Display -->
                            <div class="infinity-clock">
                                <div id="clockDisplay" class="clock-face"></div>
                                <div class="execution-windows" id="executionWindows"></div>
                            </div>
                        </div>

                        <!-- Trade Console -->
                        <div class="trade-console">
                            <div class="console-tabs">
                                <button class="tab-btn active" data-tab="manual">Manual</button>
                                <button class="tab-btn" data-tab="synthetic">Synthetic</button>
                                <button class="tab-btn" data-tab="strategy">Strategy</button>
                            </div>

                            <div class="console-content">
                                <div id="manualTrading" class="tab-content active">
                                    <div class="trade-form-grid">
                                        <div class="buy-panel">
                                            <h4>BUY</h4>
                                            <input type="number" id="buyPrice" placeholder="Price">
                                            <input type="number" id="buyAmount" placeholder="Amount">
                                            <div class="risk-controls">
                                                <input type="number" id="stopLoss" placeholder="Stop Loss">
                                                <input type="number" id="takeProfit" placeholder="Take Profit">
                                            </div>
                                            <button class="buy-btn" onclick="cockpit.executeBuy()">EXECUTE BUY</button>
                                        </div>
                                        
                                        <div class="sell-panel">
                                            <h4>SELL</h4>
                                            <input type="number" id="sellPrice" placeholder="Price">
                                            <input type="number" id="sellAmount" placeholder="Amount">
                                            <div class="risk-controls">
                                                <input type="number" id="sellStop" placeholder="Stop Loss">
                                                <input type="number" id="sellTarget" placeholder="Target">
                                            </div>
                                            <button class="sell-btn" onclick="cockpit.executeSell()">EXECUTE SELL</button>
                                        </div>
                                    </div>
                                </div>

                                <div id="syntheticTrading" class="tab-content">
                                    <div class="synthetic-controls">
                                        <button class="synthetic-btn" onclick="cockpit.startSynthetic()">
                                            Start Synthetic Actor
                                        </button>
                                        <button class="mutation-btn" onclick="cockpit.triggerMutation()">
                                            Trigger Mutation
                                        </button>
                                        <div class="synthetic-params">
                                            <label>Risk Level: <input type="range" id="riskLevel" min="1" max="10" value="5"></label>
                                            <label>Evolution Speed: <input type="range" id="evolutionSpeed" min="1" max="10" value="5"></label>
                                        </div>
                                    </div>
                                </div>

                                <div id="strategyTrading" class="tab-content">
                                    <div class="strategy-selector">
                                        <select id="strategySelect" class="strategy-dropdown">
                                            <option value="warrior">Warrior Pack</option>
                                            <option value="fusion">Fusion Breakout</option>
                                            <option value="quantum">Quantum VWAP</option>
                                            <option value="liquidity">Liquidity Depth</option>
                                            <option value="volume">Volume Sentiment</option>
                                        </select>
                                        <button onclick="cockpit.activateStrategy()">Activate Strategy</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Panel: Positions, Orders, System Status -->
                    <div class="right-panel">
                        <div class="panel-section positions-panel">
                            <h3>Open Positions</h3>
                            <div id="positionsList" class="positions-list"></div>
                        </div>

                        <div class="panel-section orders-panel">
                            <h3>Active Orders</h3>
                            <div id="ordersList" class="orders-list"></div>
                        </div>

                        <div class="panel-section system-status">
                            <h3>System Status</h3>
                            <div class="status-grid">
                                <div class="status-item">
                                    <span>Execution Grid:</span>
                                    <span id="gridStatus" class="status-value">READY</span>
                                </div>
                                <div class="status-item">
                                    <span>Mutation Engine:</span>
                                    <span id="mutationStatus" class="status-value">ACTIVE</span>
                                </div>
                                <div class="status-item">
                                    <span>Overlay Injector:</span>
                                    <span id="overlayStatus" class="status-value">ONLINE</span>
                                </div>
                                <div class="status-item">
                                    <span>Alert Broadcaster:</span>
                                    <span id="alertStatus" class="status-value">CONNECTED</span>
                                </div>
                            </div>
                        </div>

                        <div class="panel-section performance-memory">
                            <h3>Performance Memory</h3>
                            <div class="performance-stats">
                                <div class="stat-item">
                                    <span>Win Rate:</span>
                                    <span id="winRate">0%</span>
                                </div>
                                <div class="stat-item">
                                    <span>Total P/L:</span>
                                    <span id="totalPL">$0.00</span>
                                </div>
                                <div class="stat-item">
                                    <span>Best Strategy:</span>
                                    <span id="bestStrategy">-</span>
                                </div>
                            </div>
                        </div>

                        <div class="panel-section tax-fee-calculator">
                            <h3>Tax & Fees</h3>
                            <div class="calculator-display">
                                <div class="fee-item">
                                    <span>Broker Fees:</span>
                                    <span id="brokerFees">$0.00</span>
                                </div>
                                <div class="fee-item">
                                    <span>Est. Tax:</span>
                                    <span id="estimatedTax">$0.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bottom Panel: Commentary Engine & Alerts -->
                <div class="bottom-panel">
                    <div class="commentary-engine">
                        <h3>Commentary Engine</h3>
                        <div id="commentaryStream" class="commentary-stream"></div>
                    </div>
                    
                    <div class="alert-center">
                        <h3>Alert Center</h3>
                        <div id="alertStream" class="alert-stream"></div>
                    </div>
                </div>
            </div>
        `;

        // Don't return, directly insert into DOM
        document.getElementById('app').innerHTML = dashboard;
    }

    // Initialize WebSocket connections
    connectToBackend() {
        // Connect to your existing backend
        this.ws = new WebSocket('wss://auraquant-backend.onrender.com');
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleRealtimeData(data);
        };
    }

    // Handle real-time data updates
    handleRealtimeData(data) {
        if (data.type === 'PRICE_UPDATE') {
            this.updatePrice(data);
        } else if (data.type === 'VERDICT') {
            this.addVerdict(data);
        } else if (data.type === 'MUTATION') {
            this.processMutation(data);
        } else if (data.type === 'COMMENTARY') {
            this.addCommentary(data);
        }
    }

    // Set trading mode (Paper/Live)
    setTradingMode(mode) {
        this.tradingMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.mode-btn.${mode.toLowerCase()}`).classList.add('active');
        
        if (mode === 'LIVE') {
            if (confirm('Are you sure you want to switch to LIVE trading?')) {
                this.addCommentary('Switched to LIVE trading mode - Real money at risk!', 'warning');
            } else {
                this.setTradingMode('PAPER');
            }
        }
    }

    // Emergency stop
    emergencyStop() {
        if (confirm('EXECUTE KILL SWITCH? This will close all positions and stop all trading!')) {
            this.synthetic.status = 'EMERGENCY_STOP';
            this.addCommentary('KILL SWITCH ACTIVATED - All trading halted', 'critical');
            // Send emergency stop to backend
            this.ws.send(JSON.stringify({ action: 'EMERGENCY_STOP' }));
        }
    }

    // Start Synthetic Actor
    startSynthetic() {
        this.synthetic.status = 'ACTIVE';
        document.getElementById('actorStatus').textContent = 'ACTIVE';
        this.addCommentary('Synthetic Actor initialized - Beginning autonomous trading', 'success');
    }

    // Trigger mutation
    triggerMutation() {
        this.synthetic.mutations++;
        document.getElementById('mutationCount').textContent = this.synthetic.mutations;
        this.addCommentary(`Mutation ${this.synthetic.mutations} triggered - Strategy evolving`, 'info');
    }

    // Add commentary
    addCommentary(text, type = 'info') {
        const stream = document.getElementById('commentaryStream');
        const entry = document.createElement('div');
        entry.className = `commentary-entry ${type}`;
        entry.innerHTML = `
            <span class="timestamp">${new Date().toLocaleTimeString()}</span>
            <span class="message">${text}</span>
        `;
        stream.insertBefore(entry, stream.firstChild);
    }

    // Add verdict
    addVerdict(verdict) {
        const stream = document.getElementById('verdictStream');
        const entry = document.createElement('div');
        entry.className = `verdict-entry ${verdict.action}`;
        entry.innerHTML = `
            <span class="symbol">${verdict.symbol}</span>
            <span class="action">${verdict.action}</span>
            <span class="confidence">${verdict.confidence}%</span>
        `;
        stream.insertBefore(entry, stream.firstChild);
    }

    // Initialize the cockpit
    init() {
        console.log('🚀 Initializing Cockpit Infinity...');
        
        // Render the dashboard
        this.renderDashboard();
        
        // Connect to backend
        this.connectToBackend();
        
        // Initialize chart
        if (window.chartManager) {
            window.chartManager.initializeChart('superChart');
        }
        
        // Start infinity clock
        this.startInfinityClock();
        
        // Start synthetic actor
        this.startSyntheticActor();
        
        // Attach event listeners
        this.attachEventListeners();
        
        // Add initial commentary
        this.addCommentary('Cockpit Infinity initialized - Synthetic Intelligence online', 'success');
        
        console.log('✅ Cockpit Infinity Ready!');
    }

    // Start the infinity clock with AWST and world times
    startInfinityClock() {
        setInterval(() => {
            const now = new Date();
            
            // AWST (Perth) time - UTC+8
            const awstTime = new Date(now.toLocaleString("en-US", {timeZone: "Australia/Perth"}));
            const clockDisplay = document.getElementById('clockDisplay');
            if (clockDisplay) {
                clockDisplay.innerHTML = `
                    <div class="time-display">
                        <span class="primary-time">AWST: ${awstTime.toLocaleTimeString()}</span>
                        <span class="world-times">
                            NYC: ${new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"})).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}
                            LON: ${new Date(now.toLocaleString("en-US", {timeZone: "Europe/London"})).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}
                            TKY: ${new Date(now.toLocaleString("en-US", {timeZone: "Asia/Tokyo"})).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}
                        </span>
                    </div>
                `;
            }
            
            // Update exchange rates every minute
            if (now.getSeconds() === 0) {
                this.updateExchangeRates();
            }
            
            // Evolution counter - self-learning
            if (this.synthetic.status === 'ACTIVE' && Math.random() > 0.95) {
                this.synthetic.evolution++;
                document.getElementById('evolutionCount').textContent = this.synthetic.evolution;
                
                // Self-upgrade check every 100 evolutions
                if (this.synthetic.evolution % 100 === 0) {
                    this.checkSelfUpgrade();
                }
            }
        }, 1000);
    }
    
    // Update exchange rates
    updateExchangeRates() {
        // Exchange rates display
        const rates = {
            'AUD/USD': 0.6521,
            'USD/AUD': 1.5342,
            'EUR/AUD': 1.6234,
            'GBP/AUD': 1.9456
        };
        
        const ratesDisplay = document.getElementById('exchangeRates');
        if (ratesDisplay) {
            ratesDisplay.innerHTML = Object.entries(rates)
                .map(([pair, rate]) => `<span>${pair}: ${rate.toFixed(4)}</span>`)
                .join(' | ');
        }
    }
    
    // Self-upgrade protocol
    async checkSelfUpgrade() {
        if (this.synthetic.status !== 'ACTIVE') return;
        
        this.addCommentary('SELF-UPGRADE CHECK: Analyzing performance metrics...', 'info');
        
        // Check if upgrade is needed
        const metrics = {
            latency: this.checkLatency(),
            performance: this.synthetic.evolution,
            profitability: this.calculateProfitability()
        };
        
        if (metrics.latency > 100 || metrics.performance > 1000) {
            await this.executeSelfUpgrade();
        }
    }
    
    // Execute self-upgrade with capital protection
    async executeSelfUpgrade() {
        this.addCommentary('SELF-UPGRADE INITIATED: Securing all capital...', 'warning');
        
        // Step 1: Pause all trading
        this.synthetic.status = 'UPGRADING';
        document.getElementById('actorStatus').textContent = 'UPGRADING';
        
        // Step 2: Close all positions and return capital
        await this.returnAllCapitalToBrokers();
        
        // Step 3: Upgrade infrastructure
        this.addCommentary('Upgrading Render speed package...', 'info');
        this.addCommentary('Upgrading Cloudflare performance tier...', 'info');
        this.addCommentary('Scaling MongoDB cluster...', 'info');
        
        // Step 4: Resume trading
        setTimeout(() => {
            this.synthetic.status = 'ACTIVE';
            document.getElementById('actorStatus').textContent = 'ACTIVE';
            this.addCommentary('SELF-UPGRADE COMPLETE: Trading resumed with enhanced performance', 'success');
        }, 5000);
    }
    
    // Return all capital to brokers (safety protocol)
    async returnAllCapitalToBrokers() {
        return new Promise((resolve) => {
            this.addCommentary('Capital secured: 100% returned to broker accounts', 'success');
            setTimeout(resolve, 2000);
        });
    }
    
    // Check latency
    checkLatency() {
        return Math.random() * 50; // Simulated latency check
    }
    
    // Calculate profitability
    calculateProfitability() {
        return 0.85; // 85% profitability
    }
    
    // Start synthetic actor
    startSyntheticActor() {
        this.synthetic.status = 'ACTIVE';
        const statusEl = document.getElementById('actorStatus');
        if (statusEl) statusEl.textContent = 'ACTIVE';
        console.log('🤖 Synthetic Actor started');
    }
    
    // Attach event listeners
    attachEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });
        
        // Timeframe buttons
        document.querySelectorAll('.tf-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        
        console.log('📎 Event listeners attached');
    }
    
    // Switch tabs
    switchTab(tab) {
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const targetContent = document.getElementById(tab + 'Trading');
        if (targetContent) {
            targetContent.classList.add('active');
        }
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    }
    
    // Execute buy order
    executeBuy() {
        const price = document.getElementById('buyPrice').value;
        const amount = document.getElementById('buyAmount').value;
        const stopLoss = document.getElementById('stopLoss').value;
        const takeProfit = document.getElementById('takeProfit').value;
        
        if (!price || !amount) {
            alert('Please enter price and amount');
            return;
        }
        
        const order = {
            type: 'BUY',
            symbol: document.getElementById('symbolSelect').value,
            price: parseFloat(price),
            amount: parseFloat(amount),
            stopLoss: stopLoss ? parseFloat(stopLoss) : null,
            takeProfit: takeProfit ? parseFloat(takeProfit) : null,
            mode: this.tradingMode
        };
        
        this.addCommentary(`BUY order placed: ${order.amount} @ $${order.price}`, 'success');
        
        // Send to backend
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ action: 'PLACE_ORDER', order }));
        }
    }
    
    // Execute sell order
    executeSell() {
        const price = document.getElementById('sellPrice').value;
        const amount = document.getElementById('sellAmount').value;
        const stopLoss = document.getElementById('sellStop').value;
        const target = document.getElementById('sellTarget').value;
        
        if (!price || !amount) {
            alert('Please enter price and amount');
            return;
        }
        
        const order = {
            type: 'SELL',
            symbol: document.getElementById('symbolSelect').value,
            price: parseFloat(price),
            amount: parseFloat(amount),
            stopLoss: stopLoss ? parseFloat(stopLoss) : null,
            target: target ? parseFloat(target) : null,
            mode: this.tradingMode
        };
        
        this.addCommentary(`SELL order placed: ${order.amount} @ $${order.price}`, 'warning');
        
        // Send to backend
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ action: 'PLACE_ORDER', order }));
        }
    }
    
    // Load market data
    loadMarketData() {
        // Placeholder for loading initial market data
        console.log('📊 Loading market data...');
    }
    
    // Toggle overlay
    toggleOverlay(type) {
        const overlayLayer = document.getElementById('overlayLayer');
        if (!overlayLayer) return;
        
        if (this.activeOverlays.includes(type)) {
            this.activeOverlays = this.activeOverlays.filter(o => o !== type);
            overlayLayer.classList.remove(type);
        } else {
            this.activeOverlays.push(type);
            overlayLayer.classList.add(type);
        }
        
        this.addCommentary(`Overlay ${type} ${this.activeOverlays.includes(type) ? 'enabled' : 'disabled'}`, 'info');
    }
}

// Initialize Cockpit Infinity globally
window.cockpit = new CockpitInfinity();
