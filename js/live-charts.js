// Live Charts - Real-time market data fetching
// Connects to multiple data sources for live price feeds

class LiveChartManager {
    constructor() {
        this.symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
        this.currentSymbol = 'BTCUSDT';
        this.chartData = {};
        this.ws = null;
        this.chart = null;
        this.updateCallbacks = [];
    }

    // Initialize live data feeds
    initialize() {
        console.log('📈 Initializing live chart feeds...');
        
        // Connect to Binance WebSocket for live data
        this.connectBinanceStream();
        
        // Initialize TradingView widget if available
        this.initTradingView();
        
        // Start fetching historical data
        this.fetchHistoricalData();
        
        console.log('✅ Live charts ready!');
    }

    // Connect to Binance WebSocket stream
    connectBinanceStream() {
        const streams = this.symbols.map(s => `${s.toLowerCase()}@ticker/${s.toLowerCase()}@kline_1m`).join('/');
        const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('✅ Connected to Binance live feed');
            this.updateStatus('Connected to live market data');
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.processLiveData(data);
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateStatus('Reconnecting to market data...');
            setTimeout(() => this.connectBinanceStream(), 5000);
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket disconnected, reconnecting...');
            setTimeout(() => this.connectBinanceStream(), 5000);
        };
    }

    // Process live data from Binance
    processLiveData(data) {
        if (!data.data) return;
        
        const stream = data.stream;
        const payload = data.data;
        
        if (stream.includes('@ticker')) {
            // Process ticker data
            const symbol = stream.split('@')[0].toUpperCase();
            this.updateTicker(symbol, {
                price: parseFloat(payload.c),
                change: parseFloat(payload.P),
                volume: parseFloat(payload.v),
                high: parseFloat(payload.h),
                low: parseFloat(payload.l)
            });
        } else if (stream.includes('@kline')) {
            // Process candlestick data
            const symbol = stream.split('@')[0].toUpperCase();
            const candle = payload.k;
            this.updateCandle(symbol, {
                time: candle.t,
                open: parseFloat(candle.o),
                high: parseFloat(candle.h),
                low: parseFloat(candle.l),
                close: parseFloat(candle.c),
                volume: parseFloat(candle.v)
            });
        }
    }

    // Update ticker display
    updateTicker(symbol, data) {
        if (symbol !== this.currentSymbol) return;
        
        // Update price display
        const priceEl = document.getElementById('currentPrice');
        if (priceEl) {
            priceEl.textContent = `$${data.price.toLocaleString()}`;
            priceEl.style.color = data.change >= 0 ? '#00ff88' : '#ff4444';
        }
        
        // Update change display
        const changeEl = document.getElementById('priceChange');
        if (changeEl) {
            const arrow = data.change >= 0 ? '▲' : '▼';
            changeEl.textContent = `${arrow} ${Math.abs(data.change).toFixed(2)}%`;
            changeEl.style.color = data.change >= 0 ? '#00ff88' : '#ff4444';
        }
        
        // Update market watch
        this.updateMarketWatch(symbol, data);
    }

    // Update candlestick chart
    updateCandle(symbol, candle) {
        if (!this.chartData[symbol]) {
            this.chartData[symbol] = [];
        }
        
        // Add or update candle
        const existing = this.chartData[symbol].find(c => c.time === candle.time);
        if (existing) {
            Object.assign(existing, candle);
        } else {
            this.chartData[symbol].push(candle);
            // Keep only last 500 candles
            if (this.chartData[symbol].length > 500) {
                this.chartData[symbol].shift();
            }
        }
        
        // Update chart if this is current symbol
        if (symbol === this.currentSymbol) {
            this.renderChart();
        }
    }

    // Fetch historical data from Binance API
    async fetchHistoricalData() {
        for (const symbol of this.symbols) {
            try {
                const response = await fetch(
                    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=100`
                );
                const data = await response.json();
                
                this.chartData[symbol] = data.map(candle => ({
                    time: candle[0],
                    open: parseFloat(candle[1]),
                    high: parseFloat(candle[2]),
                    low: parseFloat(candle[3]),
                    close: parseFloat(candle[4]),
                    volume: parseFloat(candle[5])
                }));
                
                console.log(`📊 Loaded ${data.length} candles for ${symbol}`);
            } catch (error) {
                console.error(`Error fetching data for ${symbol}:`, error);
            }
        }
        
        // Render initial chart
        this.renderChart();
    }

    // Render chart using Chart.js
    renderChart() {
        const canvas = document.getElementById('superChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const data = this.chartData[this.currentSymbol] || [];
        
        if (data.length === 0) return;
        
        // Prepare chart data
        const chartConfig = {
            type: 'candlestick',
            data: {
                datasets: [{
                    label: this.currentSymbol,
                    data: data.map(candle => ({
                        x: new Date(candle.time),
                        o: candle.open,
                        h: candle.high,
                        l: candle.low,
                        c: candle.close
                    }))
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#aaa'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#aaa'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        };
        
        // Create or update chart
        if (this.chart) {
            this.chart.data = chartConfig.data;
            this.chart.update();
        } else if (window.Chart) {
            // Fallback to line chart if candlestick not available
            chartConfig.type = 'line';
            chartConfig.data.datasets[0].data = data.map(c => ({
                x: new Date(c.time),
                y: c.close
            }));
            chartConfig.data.datasets[0].borderColor = '#00ff88';
            chartConfig.data.datasets[0].backgroundColor = 'rgba(0, 255, 136, 0.1)';
            
            this.chart = new Chart(ctx, chartConfig);
        }
    }

    // Initialize TradingView widget
    initTradingView() {
        const container = document.getElementById('tradingViewWidget');
        if (!container || !window.TradingView) return;
        
        new TradingView.widget({
            "width": "100%",
            "height": 400,
            "symbol": "BINANCE:BTCUSDT",
            "interval": "D",
            "timezone": "Australia/Perth",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "toolbar_bg": "#f1f3f6",
            "enable_publishing": false,
            "allow_symbol_change": true,
            "container_id": "tradingViewWidget",
            "hide_side_toolbar": false,
            "studies": [
                "MASimple@tv-basicstudies",
                "RSI@tv-basicstudies",
                "MACD@tv-basicstudies"
            ]
        });
        
        console.log('📺 TradingView widget initialized');
    }

    // Update market watch list
    updateMarketWatch(symbol, data) {
        const watchList = document.getElementById('marketWatchList');
        if (!watchList) return;
        
        let item = document.getElementById(`watch-${symbol}`);
        if (!item) {
            item = document.createElement('div');
            item.id = `watch-${symbol}`;
            item.className = 'watch-item';
            watchList.appendChild(item);
        }
        
        item.innerHTML = `
            <span class="symbol">${symbol}</span>
            <span class="price" style="color: ${data.change >= 0 ? '#00ff88' : '#ff4444'}">
                $${data.price.toLocaleString()}
            </span>
            <span class="change" style="color: ${data.change >= 0 ? '#00ff88' : '#ff4444'}">
                ${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}%
            </span>
        `;
        
        item.onclick = () => this.switchSymbol(symbol);
    }

    // Switch to different symbol
    switchSymbol(symbol) {
        this.currentSymbol = symbol;
        const selector = document.getElementById('symbolSelect');
        if (selector) {
            selector.value = symbol;
        }
        this.renderChart();
        console.log(`📊 Switched to ${symbol}`);
    }

    // Update status message
    updateStatus(message) {
        const commentary = document.getElementById('commentaryStream');
        if (commentary && window.cockpit) {
            window.cockpit.addCommentary(message, 'info');
        }
    }
}

// Initialize live charts when ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.liveCharts = new LiveChartManager();
        window.liveCharts.initialize();
    });
} else {
    window.liveCharts = new LiveChartManager();
    window.liveCharts.initialize();
}
