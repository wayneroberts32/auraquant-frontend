// Real-Time Data Integration Engine
// Pulls legitimate data from multiple sources without copying

class RealtimeDataEngine {
    constructor() {
        this.dataSources = {
            crypto: {
                binance: {
                    ws: 'wss://stream.binance.com:9443/ws',
                    rest: 'https://api.binance.com/api/v3',
                    enabled: true
                },
                coinbase: {
                    ws: 'wss://ws-feed.exchange.coinbase.com',
                    rest: 'https://api.exchange.coinbase.com',
                    enabled: true
                },
                kraken: {
                    ws: 'wss://ws.kraken.com',
                    rest: 'https://api.kraken.com/0',
                    enabled: true
                },
                coingecko: {
                    rest: 'https://api.coingecko.com/api/v3',
                    enabled: true
                }
            },
            forex: {
                fixer: {
                    rest: 'https://api.fixer.io/latest',
                    enabled: true
                },
                exchangerate: {
                    rest: 'https://api.exchangerate-api.com/v4/latest',
                    enabled: true
                }
            },
            stocks: {
                alphaVantage: {
                    rest: 'https://www.alphavantage.co/query',
                    enabled: true
                },
                finnhub: {
                    ws: 'wss://ws.finnhub.io',
                    rest: 'https://finnhub.io/api/v1',
                    enabled: true
                },
                polygon: {
                    ws: 'wss://socket.polygon.io',
                    rest: 'https://api.polygon.io',
                    enabled: true
                }
            },
            news: {
                newsapi: {
                    rest: 'https://newsapi.org/v2',
                    enabled: true
                },
                benzinga: {
                    rest: 'https://api.benzinga.com/api/v2',
                    enabled: true
                }
            },
            social: {
                reddit: {
                    rest: 'https://www.reddit.com/r',
                    enabled: true
                },
                stocktwits: {
                    rest: 'https://api.stocktwits.com/api/2',
                    enabled: true
                }
            }
        };

        this.connections = new Map();
        this.dataStreams = new Map();
        this.cache = new Map();
        this.subscribers = new Map();
        
        this.initialize();
    }

    async initialize() {
        console.log('🌐 Initializing Real-Time Data Engine...');
        
        // Connect to all WebSocket sources
        await this.connectAllWebSockets();
        
        // Start data aggregation
        this.startDataAggregation();
        
        // Start cache management
        this.startCacheManagement();
        
        // Monitor connection health
        this.monitorConnections();
    }

    async connectAllWebSockets() {
        // Connect to Binance
        if (this.dataSources.crypto.binance.enabled) {
            await this.connectBinance();
        }
        
        // Connect to Coinbase
        if (this.dataSources.crypto.coinbase.enabled) {
            await this.connectCoinbase();
        }
        
        // Connect to Kraken
        if (this.dataSources.crypto.kraken.enabled) {
            await this.connectKraken();
        }
        
        // Connect to Finnhub for stocks
        if (this.dataSources.stocks.finnhub.enabled) {
            await this.connectFinnhub();
        }
    }

    async connectBinance() {
        try {
            const ws = new WebSocket(this.dataSources.crypto.binance.ws + '/!ticker@arr');
            
            ws.onopen = () => {
                console.log('✅ Connected to Binance WebSocket');
                this.connections.set('binance', ws);
            };
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.processBinanceData(data);
            };
            
            ws.onerror = (error) => {
                console.error('Binance WebSocket error:', error);
                this.reconnect('binance');
            };
            
            ws.onclose = () => {
                console.log('Binance WebSocket closed');
                this.reconnect('binance');
            };
            
        } catch (error) {
            console.error('Failed to connect to Binance:', error);
        }
    }

    async connectCoinbase() {
        try {
            const ws = new WebSocket(this.dataSources.crypto.coinbase.ws);
            
            ws.onopen = () => {
                console.log('✅ Connected to Coinbase WebSocket');
                this.connections.set('coinbase', ws);
                
                // Subscribe to ticker channel
                ws.send(JSON.stringify({
                    type: 'subscribe',
                    channels: ['ticker'],
                    product_ids: ['BTC-USD', 'ETH-USD', 'SOL-USD']
                }));
            };
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.processCoinbaseData(data);
            };
            
            ws.onerror = (error) => {
                console.error('Coinbase WebSocket error:', error);
                this.reconnect('coinbase');
            };
            
        } catch (error) {
            console.error('Failed to connect to Coinbase:', error);
        }
    }

    async connectKraken() {
        try {
            const ws = new WebSocket(this.dataSources.crypto.kraken.ws);
            
            ws.onopen = () => {
                console.log('✅ Connected to Kraken WebSocket');
                this.connections.set('kraken', ws);
                
                // Subscribe to ticker
                ws.send(JSON.stringify({
                    event: 'subscribe',
                    pair: ['XBT/USD', 'ETH/USD'],
                    subscription: { name: 'ticker' }
                }));
            };
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.processKrakenData(data);
            };
            
        } catch (error) {
            console.error('Failed to connect to Kraken:', error);
        }
    }

    async connectFinnhub() {
        try {
            const apiKey = localStorage.getItem('finnhub_api_key') || 'free_key';
            const ws = new WebSocket(`${this.dataSources.stocks.finnhub.ws}?token=${apiKey}`);
            
            ws.onopen = () => {
                console.log('✅ Connected to Finnhub WebSocket');
                this.connections.set('finnhub', ws);
                
                // Subscribe to symbols
                ws.send(JSON.stringify({'type':'subscribe', 'symbol': 'AAPL'}));
                ws.send(JSON.stringify({'type':'subscribe', 'symbol': 'GOOGL'}));
                ws.send(JSON.stringify({'type':'subscribe', 'symbol': 'TSLA'}));
            };
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.processFinnhubData(data);
            };
            
        } catch (error) {
            console.error('Failed to connect to Finnhub:', error);
        }
    }

    processBinanceData(data) {
        if (Array.isArray(data)) {
            data.forEach(ticker => {
                const symbol = ticker.s;
                const price = parseFloat(ticker.c);
                const volume = parseFloat(ticker.v);
                const change = parseFloat(ticker.P);
                
                this.updateDataStream('binance', symbol, {
                    price,
                    volume,
                    change,
                    timestamp: Date.now()
                });
            });
        }
    }

    processCoinbaseData(data) {
        if (data.type === 'ticker') {
            const symbol = data.product_id;
            const price = parseFloat(data.price);
            const volume = parseFloat(data.volume_24h);
            
            this.updateDataStream('coinbase', symbol, {
                price,
                volume,
                bid: parseFloat(data.best_bid),
                ask: parseFloat(data.best_ask),
                timestamp: Date.now()
            });
        }
    }

    processKrakenData(data) {
        if (Array.isArray(data) && data[2] === 'ticker') {
            const symbol = data[3];
            const tickerData = data[1];
            
            this.updateDataStream('kraken', symbol, {
                price: parseFloat(tickerData.c[0]),
                volume: parseFloat(tickerData.v[1]),
                bid: parseFloat(tickerData.b[0]),
                ask: parseFloat(tickerData.a[0]),
                timestamp: Date.now()
            });
        }
    }

    processFinnhubData(data) {
        if (data.type === 'trade') {
            data.data.forEach(trade => {
                this.updateDataStream('finnhub', trade.s, {
                    price: trade.p,
                    volume: trade.v,
                    timestamp: trade.t
                });
            });
        }
    }

    updateDataStream(source, symbol, data) {
        const key = `${source}:${symbol}`;
        
        // Update cache
        this.cache.set(key, data);
        
        // Update data stream
        if (!this.dataStreams.has(symbol)) {
            this.dataStreams.set(symbol, {});
        }
        
        const stream = this.dataStreams.get(symbol);
        stream[source] = data;
        
        // Calculate aggregated price
        const aggregated = this.aggregateData(symbol);
        
        // Notify subscribers
        this.notifySubscribers(symbol, aggregated);
    }

    aggregateData(symbol) {
        const stream = this.dataStreams.get(symbol);
        if (!stream) return null;
        
        const prices = [];
        const volumes = [];
        
        Object.values(stream).forEach(data => {
            if (data.price) prices.push(data.price);
            if (data.volume) volumes.push(data.volume);
        });
        
        return {
            symbol,
            price: prices.length > 0 ? prices.reduce((a, b) => a + b) / prices.length : 0,
            volume: volumes.reduce((a, b) => a + b, 0),
            sources: Object.keys(stream).length,
            timestamp: Date.now()
        };
    }

    notifySubscribers(symbol, data) {
        if (this.subscribers.has(symbol)) {
            this.subscribers.get(symbol).forEach(callback => {
                callback(data);
            });
        }
    }

    subscribe(symbol, callback) {
        if (!this.subscribers.has(symbol)) {
            this.subscribers.set(symbol, []);
        }
        this.subscribers.get(symbol).push(callback);
    }

    async fetchHistoricalData(symbol, timeframe = '1d', limit = 100) {
        const results = [];
        
        // Fetch from Binance
        try {
            const binanceData = await this.fetchBinanceHistorical(symbol, timeframe, limit);
            results.push({ source: 'binance', data: binanceData });
        } catch (error) {
            console.error('Binance historical fetch failed:', error);
        }
        
        // Aggregate and return
        return this.aggregateHistorical(results);
    }

    async fetchBinanceHistorical(symbol, interval, limit) {
        const url = `${this.dataSources.crypto.binance.rest}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
        const response = await fetch(url);
        const data = await response.json();
        
        return data.map(candle => ({
            time: candle[0],
            open: parseFloat(candle[1]),
            high: parseFloat(candle[2]),
            low: parseFloat(candle[3]),
            close: parseFloat(candle[4]),
            volume: parseFloat(candle[5])
        }));
    }

    async fetchMarketSentiment(symbol) {
        const sentiment = {
            overall: 0,
            sources: []
        };
        
        // Fetch Reddit sentiment
        try {
            const redditSentiment = await this.fetchRedditSentiment(symbol);
            sentiment.sources.push({ source: 'reddit', score: redditSentiment });
        } catch (error) {
            console.error('Reddit sentiment fetch failed:', error);
        }
        
        // Calculate overall sentiment
        if (sentiment.sources.length > 0) {
            sentiment.overall = sentiment.sources.reduce((a, b) => a + b.score, 0) / sentiment.sources.length;
        }
        
        return sentiment;
    }

    async fetchRedditSentiment(symbol) {
        // Simplified sentiment analysis
        const subreddits = ['wallstreetbets', 'cryptocurrency', 'stocks'];
        let totalSentiment = 0;
        let count = 0;
        
        for (const subreddit of subreddits) {
            try {
                const url = `${this.dataSources.social.reddit.rest}/${subreddit}/search.json?q=${symbol}&limit=10&sort=hot`;
                const response = await fetch(url);
                const data = await response.json();
                
                // Simple sentiment based on upvotes
                data.data.children.forEach(post => {
                    const score = post.data.score;
                    totalSentiment += score > 0 ? 1 : -1;
                    count++;
                });
            } catch (error) {
                console.error(`Reddit ${subreddit} fetch failed:`, error);
            }
        }
        
        return count > 0 ? totalSentiment / count : 0;
    }

    reconnect(source) {
        console.log(`Reconnecting to ${source}...`);
        setTimeout(() => {
            switch(source) {
                case 'binance':
                    this.connectBinance();
                    break;
                case 'coinbase':
                    this.connectCoinbase();
                    break;
                case 'kraken':
                    this.connectKraken();
                    break;
                case 'finnhub':
                    this.connectFinnhub();
                    break;
            }
        }, 5000); // Reconnect after 5 seconds
    }

    monitorConnections() {
        setInterval(() => {
            this.connections.forEach((ws, source) => {
                if (ws.readyState !== WebSocket.OPEN) {
                    console.log(`${source} connection lost, reconnecting...`);
                    this.reconnect(source);
                }
            });
        }, 30000); // Check every 30 seconds
    }

    startDataAggregation() {
        // Aggregate data from all sources every second
        setInterval(() => {
            this.dataStreams.forEach((stream, symbol) => {
                const aggregated = this.aggregateData(symbol);
                if (aggregated) {
                    // Store aggregated data
                    this.cache.set(`aggregated:${symbol}`, aggregated);
                }
            });
        }, 1000);
    }

    startCacheManagement() {
        // Clean old cache entries every minute
        setInterval(() => {
            const now = Date.now();
            const maxAge = 5 * 60 * 1000; // 5 minutes
            
            this.cache.forEach((value, key) => {
                if (value.timestamp && (now - value.timestamp) > maxAge) {
                    this.cache.delete(key);
                }
            });
        }, 60000);
    }

    async getPrice(symbol) {
        const aggregated = this.cache.get(`aggregated:${symbol}`);
        if (aggregated) {
            return aggregated.price;
        }
        
        // Fallback to fetching fresh data
        return await this.fetchCurrentPrice(symbol);
    }

    async fetchCurrentPrice(symbol) {
        // Try multiple sources
        const prices = [];
        
        // Try Binance
        try {
            const url = `${this.dataSources.crypto.binance.rest}/ticker/price?symbol=${symbol}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.price) prices.push(parseFloat(data.price));
        } catch (error) {
            console.error('Binance price fetch failed:', error);
        }
        
        // Return average price
        return prices.length > 0 ? prices.reduce((a, b) => a + b) / prices.length : 0;
    }
}

// Initialize the Real-Time Data Engine
window.realtimeData = new RealtimeDataEngine();
console.log('📡 Real-Time Data Engine initialized - Pulling from all legitimate sources');
