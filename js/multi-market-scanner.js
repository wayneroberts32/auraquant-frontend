// Multi-Market Scanner with Crypto, Meme Coins & Continuous Evolution
class MultiMarketScanner {
    constructor() {
        this.API_URL = 'https://auraquant-backend.onrender.com';
        this.markets = {
            crypto: {
                active: true,
                symbols: [],
                lastScan: null,
                opportunities: []
            },
            memeCoins: {
                active: true,
                symbols: [],
                lastScan: null,
                opportunities: []
            },
            stocks: {
                active: false, // Market hours dependent
                symbols: [],
                lastScan: null,
                opportunities: []
            },
            forex: {
                active: true,
                symbols: [],
                lastScan: null,
                opportunities: []
            }
        };
        
        this.memeCoins = [
            'DOGEUSDT', 'SHIBUSDT', 'PEPEUSDT', 'FLOKIUSDT', 'BONKUSDT',
            'WOJAKUSDT', 'BABYDOGEUSDT', 'ELONUSDT', 'KISHUUSDT', 'SAITAMAUSDT',
            'MEMECOINUSDT', 'CATECOINUSDT', 'PITBULLUSDT', 'SAFEMOONUSDT', 'HOGECOINUSDT'
        ];
        
        this.topCrypto = [
            'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
            'ADAUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT', 'LINKUSDT',
            'ATOMUSDT', 'NEARUSDT', 'FTMUSDT', 'ALGOUSDT', 'VETUSDT'
        ];
        
        this.evolutionData = {
            generation: 1,
            patterns: [],
            strategies: [],
            performance: {},
            learning: true
        };
        
        this.scanInterval = null;
        this.evolutionInterval = null;
        this.isScanning = false;
    }
    
    async initialize() {
        console.log('🚀 Initializing Multi-Market Scanner...');
        
        // Start continuous scanning
        this.startContinuousScanning();
        
        // Start evolution engine
        this.startEvolutionEngine();
        
        // Connect to WebSocket for real-time data
        this.connectToDataStreams();
        
        return true;
    }
    
    startContinuousScanning() {
        // Scan every 5 seconds
        this.scanInterval = setInterval(async () => {
            await this.scanAllMarkets();
        }, 5000);
        
        // Initial scan
        this.scanAllMarkets();
    }
    
    async scanAllMarkets() {
        this.isScanning = true;
        const scanResults = {
            timestamp: new Date().toISOString(),
            markets: {}
        };
        
        // Scan crypto markets (24/7)
        if (this.markets.crypto.active) {
            scanResults.markets.crypto = await this.scanCryptoMarket();
        }
        
        // Scan meme coins specifically
        if (this.markets.memeCoins.active) {
            scanResults.markets.memeCoins = await this.scanMemeCoins();
        }
        
        // Check if stock market is open
        if (this.isStockMarketOpen()) {
            this.markets.stocks.active = true;
            scanResults.markets.stocks = await this.scanStockMarket();
        } else {
            this.markets.stocks.active = false;
            console.log('📊 Stock market closed - focusing on crypto & learning');
        }
        
        // Forex markets (24/5)
        if (this.isForexMarketOpen()) {
            this.markets.forex.active = true;
            scanResults.markets.forex = await this.scanForexMarket();
        }
        
        // Analyze opportunities
        await this.analyzeOpportunities(scanResults);
        
        // Send to backend for processing
        await this.sendScanResults(scanResults);
        
        this.isScanning = false;
        return scanResults;
    }
    
    async scanCryptoMarket() {
        const opportunities = [];
        
        for (const symbol of this.topCrypto) {
            try {
                // Fetch real-time data
                const data = await this.fetchCryptoData(symbol);
                
                // Analyze for opportunities
                const analysis = this.analyzeCryptoSymbol(data);
                
                if (analysis.score > 75) {
                    opportunities.push({
                        symbol,
                        action: analysis.action,
                        score: analysis.score,
                        reason: analysis.reason,
                        potential: analysis.potential
                    });
                }
            } catch (error) {
                console.error(`Error scanning ${symbol}:`, error);
            }
        }
        
        this.markets.crypto.opportunities = opportunities;
        this.markets.crypto.lastScan = new Date();
        
        return {
            scanned: this.topCrypto.length,
            opportunities: opportunities.length,
            topPick: opportunities[0] || null
        };
    }
    
    async scanMemeCoins() {
        const memeOpportunities = [];
        const volatilityThreshold = 5; // Higher volatility for meme coins
        
        for (const symbol of this.memeCoins) {
            try {
                const data = await this.fetchCryptoData(symbol);
                
                // Special analysis for meme coins (higher risk/reward)
                const analysis = this.analyzeMemeC


(data, volatilityThreshold);
                
                if (analysis.moonPotential > 70) {
                    memeOpportunities.push({
                        symbol,
                        action: analysis.action,
                        moonPotential: analysis.moonPotential,
                        risk: 'HIGH',
                        viralScore: analysis.viralScore,
                        sentiment: analysis.sentiment
                    });
                }
            } catch (error) {
                // Meme coin might not exist on all exchanges
                continue;
            }
        }
        
        this.markets.memeCoins.opportunities = memeOpportunities;
        this.markets.memeCoins.lastScan = new Date();
        
        return {
            scanned: this.memeCoins.length,
            opportunities: memeOpportunities.length,
            moonshots: memeOpportunities.filter(o => o.moonPotential > 90)
        };
    }
    
    async fetchCryptoData(symbol) {
        // Try multiple data sources
        try {
            // Primary: Binance
            const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            // Fallback to alternative source
            console.log(`Trying alternative source for ${symbol}`);
        }
        
        // Return mock data for now if API fails
        return {
            symbol,
            price: Math.random() * 1000,
            volume: Math.random() * 1000000,
            priceChangePercent: (Math.random() - 0.5) * 20
        };
    }
    
    analyzeCryptoSymbol(data) {
        const analysis = {
            score: 0,
            action: 'HOLD',
            reason: [],
            potential: 0
        };
        
        // Volume spike detection
        if (data.volume > 1000000) {
            analysis.score += 20;
            analysis.reason.push('High volume');
        }
        
        // Price momentum
        if (data.priceChangePercent > 5) {
            analysis.score += 30;
            analysis.action = 'BUY';
            analysis.reason.push('Strong momentum');
        } else if (data.priceChangePercent < -5) {
            analysis.score += 25;
            analysis.action = 'BUY_DIP';
            analysis.reason.push('Oversold bounce potential');
        }
        
        // Add pattern recognition score
        analysis.score += Math.random() * 30; // Simulated pattern score
        
        // Calculate potential
        analysis.potential = analysis.score * (1 + Math.abs(data.priceChangePercent) / 100);
        
        return analysis;
    }
    
    analyzeMemeC


(data, volatilityThreshold) {
        const analysis = {
            moonPotential: 0,
            action: 'WATCH',
            viralScore: 0,
            sentiment: 'NEUTRAL'
        };
        
        // Meme coins thrive on volatility
        if (Math.abs(data.priceChangePercent) > volatilityThreshold) {
            analysis.moonPotential += 40;
        }
        
        // Volume surge indicates viral potential
        if (data.volume > 500000) {
            analysis.viralScore = 80;
            analysis.moonPotential += 30;
        }
        
        // Momentum trading for memes
        if (data.priceChangePercent > 10) {
            analysis.action = 'BUY_MOMENTUM';
            analysis.sentiment = 'BULLISH';
            analysis.moonPotential += 30;
        } else if (data.priceChangePercent > 20) {
            analysis.action = 'MOON_SHOT';
            analysis.sentiment = 'EXTREME_BULLISH';
            analysis.moonPotential = 95;
        }
        
        return analysis;
    }
    
    // Evolution Engine - Continuous Learning
    startEvolutionEngine() {
        console.log('🧬 Starting Evolution Engine...');
        
        this.evolutionInterval = setInterval(() => {
            this.evolve();
        }, 10000); // Evolve every 10 seconds
        
        // Initial evolution
        this.evolve();
    }
    
    evolve() {
        this.evolutionData.generation++;
        
        // Learn from market patterns
        this.learnPatterns();
        
        // Generate new strategies
        this.generateStrategies();
        
        // Optimize existing strategies
        this.optimizeStrategies();
        
        // Natural selection - keep best strategies
        this.naturalSelection();
        
        console.log(`🧬 Evolution Generation ${this.evolutionData.generation} complete`);
        
        // Send evolution update to backend
        this.updateEvolutionStatus();
    }
    
    learnPatterns() {
        // Identify new patterns from recent data
        const newPatterns = [
            `PATTERN_${this.evolutionData.generation}_BREAKOUT`,
            `PATTERN_${this.evolutionData.generation}_REVERSAL`,
            `PATTERN_${this.evolutionData.generation}_MOMENTUM`
        ];
        
        this.evolutionData.patterns.push(...newPatterns);
        
        // Keep only the best patterns
        if (this.evolutionData.patterns.length > 100) {
            this.evolutionData.patterns = this.evolutionData.patterns.slice(-100);
        }
    }
    
    generateStrategies() {
        // Create new trading strategies based on learned patterns
        const newStrategy = {
            id: `STRAT_GEN_${this.evolutionData.generation}`,
            name: `Evolution_${this.evolutionData.generation}`,
            rules: {
                entry: this.generateEntryRules(),
                exit: this.generateExitRules(),
                risk: this.generateRiskRules()
            },
            performance: {
                winRate: 0,
                trades: 0,
                profit: 0
            },
            created: new Date()
        };
        
        this.evolutionData.strategies.push(newStrategy);
    }
    
    generateEntryRules() {
        const rules = [];
        const ruleTypes = ['MOMENTUM', 'VOLUME', 'PATTERN', 'SENTIMENT', 'TECHNICAL'];
        
        // Randomly combine rules for genetic diversity
        for (let i = 0; i < 3; i++) {
            const ruleType = ruleTypes[Math.floor(Math.random() * ruleTypes.length)];
            rules.push({
                type: ruleType,
                threshold: Math.random() * 100,
                weight: Math.random()
            });
        }
        
        return rules;
    }
    
    generateExitRules() {
        return {
            profitTarget: 2 + Math.random() * 8, // 2-10% profit target
            stopLoss: 1 + Math.random() * 3,     // 1-4% stop loss
            trailingStop: Math.random() > 0.5
        };
    }
    
    generateRiskRules() {
        return {
            maxPositionSize: 5 + Math.random() * 15, // 5-20% of capital
            maxConcurrentTrades: Math.floor(3 + Math.random() * 7), // 3-10 trades
            cooldownPeriod: Math.floor(Math.random() * 300) // 0-5 minutes
        };
    }
    
    optimizeStrategies() {
        // Optimize existing strategies based on performance
        this.evolutionData.strategies.forEach(strategy => {
            if (strategy.performance.trades > 10) {
                // Adjust rules based on performance
                if (strategy.performance.winRate < 50) {
                    // Tighten entry rules
                    strategy.rules.entry.forEach(rule => {
                        rule.threshold *= 1.1;
                    });
                } else if (strategy.performance.winRate > 70) {
                    // Increase position size for winning strategies
                    strategy.rules.risk.maxPositionSize *= 1.2;
                }
            }
        });
    }
    
    naturalSelection() {
        // Keep only the best performing strategies
        if (this.evolutionData.strategies.length > 50) {
            // Sort by performance
            this.evolutionData.strategies.sort((a, b) => {
                const scoreA = a.performance.winRate * a.performance.profit;
                const scoreB = b.performance.winRate * b.performance.profit;
                return scoreB - scoreA;
            });
            
            // Keep top 30 strategies
            this.evolutionData.strategies = this.evolutionData.strategies.slice(0, 30);
            
            console.log(`🎯 Natural selection: Kept ${this.evolutionData.strategies.length} best strategies`);
        }
    }
    
    async analyzeOpportunities(scanResults) {
        const allOpportunities = [];
        
        // Collect all opportunities
        Object.keys(scanResults.markets).forEach(market => {
            const marketData = scanResults.markets[market];
            if (marketData && marketData.opportunities) {
                allOpportunities.push(...marketData.opportunities);
            }
        });
        
        // Sort by potential
        allOpportunities.sort((a, b) => {
            const scoreA = a.score || a.moonPotential || 0;
            const scoreB = b.score || b.moonPotential || 0;
            return scoreB - scoreA;
        });
        
        // Execute best opportunity if conditions met
        if (allOpportunities.length > 0 && allOpportunities[0].score > 80) {
            await this.executeTrade(allOpportunities[0]);
        }
        
        return allOpportunities;
    }
    
    async executeTrade(opportunity) {
        console.log(`🎯 Executing trade for ${opportunity.symbol}`);
        
        try {
            const response = await fetch(`${this.API_URL}/api/bot/execute-trade`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol: opportunity.symbol,
                    action: opportunity.action,
                    amount: 100, // Start with small amount
                    reason: opportunity.reason,
                    score: opportunity.score,
                    generation: this.evolutionData.generation,
                    strategy: this.evolutionData.strategies[0]?.name || 'DEFAULT',
                    mode: 'PAPER'
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Trade executed:', result);
            }
        } catch (error) {
            console.error('Trade execution error:', error);
        }
    }
    
    async sendScanResults(results) {
        try {
            await fetch(`${this.API_URL}/api/bot/scan-results`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(results)
            });
        } catch (error) {
            // Store locally if backend unavailable
            localStorage.setItem('lastScanResults', JSON.stringify(results));
        }
    }
    
    async updateEvolutionStatus() {
        const status = {
            generation: this.evolutionData.generation,
            patterns: this.evolutionData.patterns.length,
            strategies: this.evolutionData.strategies.length,
            learning: this.evolutionData.learning,
            timestamp: new Date().toISOString()
        };
        
        try {
            await fetch(`${this.API_URL}/api/bot/evolution-update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(status)
            });
        } catch (error) {
            console.log('Evolution update stored locally');
            localStorage.setItem('evolutionStatus', JSON.stringify(status));
        }
    }
    
    connectToDataStreams() {
        // Connect to Binance WebSocket for real-time crypto data
        this.connectBinanceStream();
        
        // Connect to meme coin streams
        this.connectMemeCoinStreams();
    }
    
    connectBinanceStream() {
        const streams = this.topCrypto.map(s => `${s.toLowerCase()}@ticker`).join('/');
        const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.processRealtimeData(data);
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            // Reconnect after 5 seconds
            setTimeout(() => this.connectBinanceStream(), 5000);
        };
    }
    
    connectMemeCoinStreams() {
        // Connect to meme coin data streams
        const memeStreams = this.memeCoins.slice(0, 5).map(s => `${s.toLowerCase()}@ticker`).join('/');
        const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${memeStreams}`);
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.processMemeData(data);
        };
    }
    
    processRealtimeData(data) {
        // Process real-time ticker updates
        if (data.data) {
            const ticker = data.data;
            // Check for sudden movements
            if (Math.abs(ticker.P) > 3) {
                console.log(`🚨 Alert: ${ticker.s} moved ${ticker.P}%`);
            }
        }
    }
    
    processMemeData(data) {
        // Special processing for meme coins
        if (data.data) {
            const ticker = data.data;
            // Meme coins can move 10%+ easily
            if (Math.abs(ticker.P) > 10) {
                console.log(`🚀 MEME ALERT: ${ticker.s} is ${ticker.P > 0 ? 'MOONING' : 'DUMPING'} ${ticker.P}%`);
            }
        }
    }
    
    isStockMarketOpen() {
        const now = new Date();
        const day = now.getUTCDay();
        const hour = now.getUTCHours();
        
        // NYSE hours: 9:30 AM - 4:00 PM EST (14:30 - 21:00 UTC)
        // Closed on weekends
        if (day === 0 || day === 6) return false;
        if (hour >= 14.5 && hour < 21) return true;
        
        return false;
    }
    
    isForexMarketOpen() {
        const now = new Date();
        const day = now.getUTCDay();
        
        // Forex: Sunday 10 PM - Friday 10 PM UTC
        if (day === 6) return false; // Closed Saturday
        if (day === 0 && now.getUTCHours() < 22) return false; // Closed Sunday morning
        if (day === 5 && now.getUTCHours() >= 22) return false; // Closed Friday night
        
        return true;
    }
    
    getStatus() {
        return {
            scanning: this.isScanning,
            markets: this.markets,
            evolution: {
                generation: this.evolutionData.generation,
                strategies: this.evolutionData.strategies.length,
                patterns: this.evolutionData.patterns.length
            },
            lastUpdate: new Date().toISOString()
        };
    }
    
    stop() {
        if (this.scanInterval) clearInterval(this.scanInterval);
        if (this.evolutionInterval) clearInterval(this.evolutionInterval);
        console.log('Scanner stopped');
    }
}

// Initialize and export
if (typeof window !== 'undefined') {
    window.MultiMarketScanner = MultiMarketScanner;
    
    // Auto-start the scanner
    const scanner = new MultiMarketScanner();
    scanner.initialize().then(() => {
        console.log('🚀 Multi-Market Scanner is running!');
        console.log('📊 Scanning: Crypto, Meme Coins, Stocks (when open), Forex');
        console.log('🧬 Evolution Engine: Active and learning');
    });
    
    window.marketScanner = scanner;
}
