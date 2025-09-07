// Profit Optimizer - Target: >80% profit, <1.25% max loss
// This ADDS to existing system without breaking anything
class ProfitOptimizer {
    constructor() {
        this.config = {
            // Profit targets
            minProfitTarget: 0.80,    // 80% minimum profit target
            idealProfitTarget: 1.50,  // 150% ideal profit
            
            // Risk management - ULTRA STRICT
            maxLossPerTrade: 0.0125,  // 1.25% max loss per trade
            stopLoss: 0.01,            // 1% stop loss
            trailingStop: 0.008,       // 0.8% trailing stop
            
            // Position sizing
            maxPositionSize: 0.10,     // 10% of capital per trade
            scalingEnabled: true,      // Scale into positions
            
            // Entry criteria - VERY STRICT
            minConfidence: 0.85,       // 85% confidence minimum
            requiredIndicators: 4,     // Need 4+ indicators agreeing
            
            // Market conditions
            volatilityThreshold: 0.03, // 3% volatility for entry
            volumeMultiplier: 2.0,     // 2x average volume required
        };
        
        this.indicators = {
            rsi: { weight: 0.20, signal: null },
            macd: { weight: 0.20, signal: null },
            bollinger: { weight: 0.15, signal: null },
            volume: { weight: 0.15, signal: null },
            momentum: { weight: 0.15, signal: null },
            ai: { weight: 0.15, signal: null }
        };
        
        this.performance = {
            totalTrades: 0,
            winningTrades: 0,
            losingTrades: 0,
            totalProfit: 0,
            totalLoss: 0,
            largestWin: 0,
            largestLoss: 0,
            currentStreak: 0,
            bestStreak: 0
        };
        
        this.activePositions = [];
        this.pendingOrders = [];
        
        console.log('💰 Profit Optimizer initialized - Target: >80% profit, <1.25% loss');
    }
    
    // Analyze market for high-probability trades
    async analyzeMarket(symbol, data) {
        const analysis = {
            symbol,
            timestamp: Date.now(),
            confidence: 0,
            action: 'HOLD',
            signals: [],
            risk: 0,
            reward: 0,
            riskRewardRatio: 0
        };
        
        // Calculate all indicators
        const rsi = this.calculateRSI(data);
        const macd = this.calculateMACD(data);
        const bollinger = this.calculateBollinger(data);
        const volume = this.analyzeVolume(data);
        const momentum = this.calculateMomentum(data);
        const ai = await this.getAISignal(data);
        
        // Update indicator signals
        this.indicators.rsi.signal = rsi.signal;
        this.indicators.macd.signal = macd.signal;
        this.indicators.bollinger.signal = bollinger.signal;
        this.indicators.volume.signal = volume.signal;
        this.indicators.momentum.signal = momentum.signal;
        this.indicators.ai.signal = ai.signal;
        
        // Count bullish signals
        let bullishCount = 0;
        let bearishCount = 0;
        let totalWeight = 0;
        
        for (const [key, indicator] of Object.entries(this.indicators)) {
            if (indicator.signal === 'BUY') {
                bullishCount++;
                totalWeight += indicator.weight;
                analysis.signals.push(`${key.toUpperCase()}: BUY`);
            } else if (indicator.signal === 'SELL') {
                bearishCount++;
                analysis.signals.push(`${key.toUpperCase()}: SELL`);
            }
        }
        
        // Calculate confidence
        analysis.confidence = totalWeight;
        
        // Determine action - VERY STRICT CRITERIA
        if (bullishCount >= this.config.requiredIndicators && 
            analysis.confidence >= this.config.minConfidence) {
            
            // Additional filters for high win rate
            const volatility = this.calculateVolatility(data);
            const trend = this.identifyTrend(data);
            
            if (volatility < this.config.volatilityThreshold && trend === 'UP') {
                analysis.action = 'BUY';
                
                // Calculate risk/reward
                const entry = data.price;
                const stopLoss = entry * (1 - this.config.stopLoss);
                const target = entry * (1 + this.config.minProfitTarget);
                
                analysis.risk = this.config.stopLoss;
                analysis.reward = this.config.minProfitTarget;
                analysis.riskRewardRatio = analysis.reward / analysis.risk;
                
                // Only trade if risk/reward > 10:1
                if (analysis.riskRewardRatio < 10) {
                    analysis.action = 'HOLD';
                    analysis.reason = 'Risk/Reward ratio too low';
                }
            }
        }
        
        return analysis;
    }
    
    // Calculate RSI
    calculateRSI(data, period = 14) {
        if (!data.prices || data.prices.length < period) {
            return { value: 50, signal: 'NEUTRAL' };
        }
        
        const prices = data.prices.slice(-period - 1);
        let gains = 0;
        let losses = 0;
        
        for (let i = 1; i < prices.length; i++) {
            const diff = prices[i] - prices[i - 1];
            if (diff > 0) gains += diff;
            else losses -= diff;
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        
        return {
            value: rsi,
            signal: rsi < 30 ? 'BUY' : rsi > 70 ? 'SELL' : 'NEUTRAL'
        };
    }
    
    // Calculate MACD
    calculateMACD(data) {
        if (!data.prices || data.prices.length < 26) {
            return { signal: 'NEUTRAL' };
        }
        
        const ema12 = this.calculateEMA(data.prices, 12);
        const ema26 = this.calculateEMA(data.prices, 26);
        const macd = ema12 - ema26;
        const signal = this.calculateEMA([macd], 9);
        
        return {
            macd,
            signal: macd > signal ? 'BUY' : macd < signal ? 'SELL' : 'NEUTRAL'
        };
    }
    
    // Calculate Bollinger Bands
    calculateBollinger(data, period = 20) {
        if (!data.prices || data.prices.length < period) {
            return { signal: 'NEUTRAL' };
        }
        
        const prices = data.prices.slice(-period);
        const sma = prices.reduce((a, b) => a + b) / period;
        const variance = prices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        
        const upper = sma + (stdDev * 2);
        const lower = sma - (stdDev * 2);
        const current = data.price;
        
        return {
            upper,
            lower,
            middle: sma,
            signal: current < lower ? 'BUY' : current > upper ? 'SELL' : 'NEUTRAL'
        };
    }
    
    // Analyze volume
    analyzeVolume(data) {
        if (!data.volumes || data.volumes.length < 20) {
            return { signal: 'NEUTRAL' };
        }
        
        const avgVolume = data.volumes.slice(-20).reduce((a, b) => a + b) / 20;
        const currentVolume = data.volume;
        const ratio = currentVolume / avgVolume;
        
        return {
            ratio,
            signal: ratio > this.config.volumeMultiplier ? 'BUY' : 'NEUTRAL'
        };
    }
    
    // Calculate momentum
    calculateMomentum(data, period = 10) {
        if (!data.prices || data.prices.length < period) {
            return { signal: 'NEUTRAL' };
        }
        
        const current = data.price;
        const past = data.prices[data.prices.length - period];
        const momentum = ((current - past) / past) * 100;
        
        return {
            value: momentum,
            signal: momentum > 5 ? 'BUY' : momentum < -5 ? 'SELL' : 'NEUTRAL'
        };
    }
    
    // Get AI signal (simplified for now)
    async getAISignal(data) {
        // This would connect to your AI model
        // For now, using pattern recognition
        const patterns = this.detectPatterns(data);
        
        if (patterns.includes('BULLISH_ENGULFING') || 
            patterns.includes('MORNING_STAR') ||
            patterns.includes('DOUBLE_BOTTOM')) {
            return { signal: 'BUY', confidence: 0.9 };
        }
        
        return { signal: 'NEUTRAL', confidence: 0.5 };
    }
    
    // Detect chart patterns
    detectPatterns(data) {
        const patterns = [];
        
        if (!data.candles || data.candles.length < 3) {
            return patterns;
        }
        
        const last3 = data.candles.slice(-3);
        
        // Bullish engulfing
        if (last3[1].close < last3[1].open && 
            last3[2].close > last3[2].open &&
            last3[2].close > last3[1].open) {
            patterns.push('BULLISH_ENGULFING');
        }
        
        return patterns;
    }
    
    // Calculate volatility
    calculateVolatility(data, period = 20) {
        if (!data.prices || data.prices.length < period) {
            return 0;
        }
        
        const returns = [];
        for (let i = 1; i < period; i++) {
            returns.push((data.prices[i] - data.prices[i-1]) / data.prices[i-1]);
        }
        
        const mean = returns.reduce((a, b) => a + b) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        
        return Math.sqrt(variance);
    }
    
    // Identify trend
    identifyTrend(data, period = 50) {
        if (!data.prices || data.prices.length < period) {
            return 'NEUTRAL';
        }
        
        const sma50 = this.calculateSMA(data.prices, 50);
        const sma20 = this.calculateSMA(data.prices, 20);
        const current = data.price;
        
        if (current > sma20 && sma20 > sma50) {
            return 'UP';
        } else if (current < sma20 && sma20 < sma50) {
            return 'DOWN';
        }
        
        return 'NEUTRAL';
    }
    
    // Calculate Simple Moving Average
    calculateSMA(prices, period) {
        const relevantPrices = prices.slice(-period);
        return relevantPrices.reduce((a, b) => a + b) / relevantPrices.length;
    }
    
    // Calculate Exponential Moving Average
    calculateEMA(prices, period) {
        const k = 2 / (period + 1);
        let ema = prices[0];
        
        for (let i = 1; i < prices.length; i++) {
            ema = (prices[i] * k) + (ema * (1 - k));
        }
        
        return ema;
    }
    
    // Execute trade with strict risk management
    async executeTrade(signal, balance) {
        // Calculate position size
        const positionSize = Math.min(
            balance * this.config.maxPositionSize,
            balance * (this.config.maxLossPerTrade / this.config.stopLoss)
        );
        
        const trade = {
            symbol: signal.symbol,
            action: signal.action,
            entry: signal.price,
            size: positionSize,
            stopLoss: signal.price * (1 - this.config.stopLoss),
            target: signal.price * (1 + this.config.minProfitTarget),
            trailingStop: null,
            timestamp: Date.now(),
            status: 'OPEN'
        };
        
        // Add to active positions
        this.activePositions.push(trade);
        
        console.log(`📈 Trade executed: ${trade.action} ${trade.symbol} @ ${trade.entry}`);
        console.log(`   Stop Loss: ${trade.stopLoss}, Target: ${trade.target}`);
        console.log(`   Risk/Reward: 1:${(this.config.minProfitTarget / this.config.stopLoss).toFixed(1)}`);
        
        return trade;
    }
    
    // Monitor and manage positions
    async managePositions(currentPrices) {
        for (const position of this.activePositions) {
            if (position.status !== 'OPEN') continue;
            
            const currentPrice = currentPrices[position.symbol];
            if (!currentPrice) continue;
            
            const profitPercent = (currentPrice - position.entry) / position.entry;
            
            // Check stop loss
            if (currentPrice <= position.stopLoss) {
                await this.closePosition(position, currentPrice, 'STOP_LOSS');
                continue;
            }
            
            // Check profit target
            if (currentPrice >= position.target) {
                await this.closePosition(position, currentPrice, 'TARGET_HIT');
                continue;
            }
            
            // Update trailing stop if in profit
            if (profitPercent > 0.02) { // 2% profit
                const newTrailingStop = currentPrice * (1 - this.config.trailingStop);
                if (!position.trailingStop || newTrailingStop > position.trailingStop) {
                    position.trailingStop = newTrailingStop;
                    position.stopLoss = Math.max(position.stopLoss, position.trailingStop);
                    console.log(`📊 Trailing stop updated for ${position.symbol}: ${position.trailingStop}`);
                }
            }
            
            // Scale out at certain profit levels
            if (this.config.scalingEnabled) {
                if (profitPercent > 0.40 && !position.scaled40) {
                    await this.scaleOut(position, 0.25); // Take 25% profit at 40%
                    position.scaled40 = true;
                }
                if (profitPercent > 0.60 && !position.scaled60) {
                    await this.scaleOut(position, 0.25); // Take another 25% at 60%
                    position.scaled60 = true;
                }
            }
        }
    }
    
    // Close position
    async closePosition(position, exitPrice, reason) {
        const profitLoss = (exitPrice - position.entry) * position.size;
        const profitPercent = ((exitPrice - position.entry) / position.entry) * 100;
        
        position.status = 'CLOSED';
        position.exitPrice = exitPrice;
        position.exitReason = reason;
        position.profitLoss = profitLoss;
        position.profitPercent = profitPercent;
        
        // Update performance metrics
        this.performance.totalTrades++;
        
        if (profitLoss > 0) {
            this.performance.winningTrades++;
            this.performance.totalProfit += profitLoss;
            this.performance.currentStreak = Math.max(0, this.performance.currentStreak) + 1;
            this.performance.bestStreak = Math.max(this.performance.bestStreak, this.performance.currentStreak);
            this.performance.largestWin = Math.max(this.performance.largestWin, profitPercent);
        } else {
            this.performance.losingTrades++;
            this.performance.totalLoss += Math.abs(profitLoss);
            this.performance.currentStreak = Math.min(0, this.performance.currentStreak) - 1;
            this.performance.largestLoss = Math.min(this.performance.largestLoss, profitPercent);
        }
        
        const winRate = (this.performance.winningTrades / this.performance.totalTrades) * 100;
        
        console.log(`💰 Position closed: ${position.symbol}`);
        console.log(`   Exit: ${exitPrice} (${reason})`);
        console.log(`   P/L: ${profitPercent.toFixed(2)}%`);
        console.log(`   Win Rate: ${winRate.toFixed(1)}%`);
        
        return position;
    }
    
    // Scale out of position
    async scaleOut(position, percentage) {
        const scaleSize = position.size * percentage;
        position.size -= scaleSize;
        
        console.log(`📉 Scaled out ${percentage * 100}% of ${position.symbol} position`);
        
        return scaleSize;
    }
    
    // Get performance report
    getPerformanceReport() {
        const winRate = this.performance.totalTrades > 0 ? 
            (this.performance.winningTrades / this.performance.totalTrades) * 100 : 0;
        
        const avgWin = this.performance.winningTrades > 0 ?
            this.performance.totalProfit / this.performance.winningTrades : 0;
        
        const avgLoss = this.performance.losingTrades > 0 ?
            this.performance.totalLoss / this.performance.losingTrades : 0;
        
        const profitFactor = this.performance.totalLoss > 0 ?
            this.performance.totalProfit / this.performance.totalLoss : 0;
        
        return {
            totalTrades: this.performance.totalTrades,
            winRate: winRate.toFixed(2) + '%',
            avgWin: avgWin.toFixed(2),
            avgLoss: avgLoss.toFixed(2),
            largestWin: this.performance.largestWin.toFixed(2) + '%',
            largestLoss: this.performance.largestLoss.toFixed(2) + '%',
            profitFactor: profitFactor.toFixed(2),
            currentStreak: this.performance.currentStreak,
            bestStreak: this.performance.bestStreak,
            totalProfitPercent: ((this.performance.totalProfit - this.performance.totalLoss) / 1000 * 100).toFixed(2) + '%'
        };
    }
}

// Initialize and export
window.ProfitOptimizer = ProfitOptimizer;
window.profitOptimizer = new ProfitOptimizer();

console.log('💰 Profit Optimizer loaded - Target: >80% profit, <1.25% max loss');
