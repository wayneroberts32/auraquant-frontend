// Trading Memory System - Persistent Knowledge Base
class TradingMemorySystem {
    constructor() {
        this.memoryBank = {
            trades: [],
            strategies: [],
            patterns: [],
            marketConditions: [],
            learningOutcomes: [],
            profitHistory: [],
            manualTrades: [],
            botRecommendations: [],
            evolutionVersions: {},
            performance: {
                totalProfitLoss: 0,
                winRate: 0,
                bestStrategy: null,
                worstStrategy: null,
                overnightProfits: [],
                dailyStats: []
            }
        };

        this.initializeMemory();
        this.startMemoryBackup();
    }

    async initializeMemory() {
        console.log('🧠 Initializing Trading Memory System...');
        
        // Load existing memory from storage
        await this.loadMemory();
        
        // Initialize real-time memory capture
        this.startMemoryCapture();
        
        // Initialize learning system
        this.initializeLearningEngine();
    }

    async loadMemory() {
        try {
            // Load from localStorage first
            const localMemory = localStorage.getItem('tradingMemory');
            if (localMemory) {
                this.memoryBank = JSON.parse(localMemory);
                console.log('📚 Loaded existing memory bank');
            }

            // Sync with backend
            const response = await fetch('/api/memory/load', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const serverMemory = await response.json();
                this.mergeMemory(serverMemory);
            }
        } catch (error) {
            console.log('💾 Starting fresh memory bank');
        }
    }

    mergeMemory(serverMemory) {
        // Intelligent memory merging - keeps best of both
        Object.keys(serverMemory).forEach(key => {
            if (Array.isArray(serverMemory[key])) {
                this.memoryBank[key] = [...new Set([...this.memoryBank[key], ...serverMemory[key]])];
            } else if (typeof serverMemory[key] === 'object') {
                this.memoryBank[key] = { ...this.memoryBank[key], ...serverMemory[key] };
            }
        });
    }

    startMemoryCapture() {
        // Capture all trading events
        document.addEventListener('trade-executed', (event) => {
            this.recordTrade(event.detail);
        });

        document.addEventListener('strategy-created', (event) => {
            this.recordStrategy(event.detail);
        });

        document.addEventListener('pattern-detected', (event) => {
            this.recordPattern(event.detail);
        });

        document.addEventListener('manual-trade', (event) => {
            this.recordManualTrade(event.detail);
        });

        // Capture market conditions every 5 minutes
        setInterval(() => this.captureMarketConditions(), 5 * 60 * 1000);
    }

    recordTrade(trade) {
        const enrichedTrade = {
            ...trade,
            timestamp: Date.now(),
            marketConditionsAtTime: this.getCurrentMarketConditions(),
            strategyUsed: trade.strategy,
            outcome: trade.profit > 0 ? 'WIN' : 'LOSS',
            learnings: this.extractLearnings(trade)
        };

        this.memoryBank.trades.push(enrichedTrade);
        this.updatePerformanceMetrics(trade);
        this.saveMemory();
    }

    recordStrategy(strategy) {
        const enrichedStrategy = {
            ...strategy,
            createdAt: Date.now(),
            performance: {
                trades: 0,
                wins: 0,
                losses: 0,
                profitLoss: 0,
                avgProfit: 0,
                maxDrawdown: 0
            },
            evolutionVersion: this.getCurrentEvolutionVersion()
        };

        this.memoryBank.strategies.push(enrichedStrategy);
        this.saveMemory();
    }

    recordPattern(pattern) {
        const enrichedPattern = {
            ...pattern,
            detectedAt: Date.now(),
            reliability: this.calculatePatternReliability(pattern),
            profitPotential: this.estimateProfitPotential(pattern),
            riskLevel: this.assessRiskLevel(pattern)
        };

        this.memoryBank.patterns.push(enrichedPattern);
        this.saveMemory();
    }

    recordManualTrade(trade) {
        const botRecommendation = this.getBotRecommendation(trade);
        
        const enrichedManualTrade = {
            ...trade,
            timestamp: Date.now(),
            botRecommendation: botRecommendation,
            agreedWithBot: trade.action === botRecommendation.action,
            outcome: null // Will be updated when trade closes
        };

        this.memoryBank.manualTrades.push(enrichedManualTrade);
        this.memoryBank.botRecommendations.push(botRecommendation);
        this.saveMemory();

        // Provide real-time guidance
        this.provideManualTradeGuidance(enrichedManualTrade);
    }

    getBotRecommendation(tradeContext) {
        // Analyze context and provide recommendation
        const analysis = {
            marketTrend: this.analyzeMarketTrend(),
            patterns: this.detectRelevantPatterns(tradeContext),
            riskAssessment: this.assessTradeRisk(tradeContext),
            profitProbability: this.calculateProfitProbability(tradeContext),
            similarTradesOutcome: this.findSimilarTradesOutcome(tradeContext)
        };

        const recommendation = {
            action: this.determineOptimalAction(analysis),
            confidence: this.calculateConfidence(analysis),
            reasoning: this.generateReasoning(analysis),
            suggestedStopLoss: this.calculateOptimalStopLoss(tradeContext),
            suggestedTakeProfit: this.calculateOptimalTakeProfit(tradeContext),
            riskWarnings: this.identifyRisks(analysis),
            alternativeStrategies: this.suggestAlternatives(tradeContext)
        };

        return recommendation;
    }

    provideManualTradeGuidance(trade) {
        const guidance = {
            preTradeChecklist: [
                `Market Trend: ${trade.botRecommendation.marketTrend}`,
                `Risk Level: ${trade.botRecommendation.riskAssessment}`,
                `Profit Probability: ${trade.botRecommendation.profitProbability}%`,
                `Similar Trades Win Rate: ${trade.botRecommendation.similarTradesOutcome}%`
            ],
            warnings: trade.botRecommendation.riskWarnings,
            suggestions: trade.botRecommendation.alternativeStrategies
        };

        // Display guidance to user
        this.displayGuidance(guidance);
        
        return guidance;
    }

    captureMarketConditions() {
        const conditions = {
            timestamp: Date.now(),
            volatility: this.calculateVolatility(),
            trend: this.identifyTrend(),
            volume: this.getMarketVolume(),
            sentiment: this.analyzeSentiment(),
            keyLevels: this.identifyKeyLevels(),
            correlations: this.analyzeCorrelations()
        };

        this.memoryBank.marketConditions.push(conditions);
        
        // Keep only last 30 days of conditions
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        this.memoryBank.marketConditions = this.memoryBank.marketConditions.filter(
            c => c.timestamp > thirtyDaysAgo
        );

        this.saveMemory();
    }

    extractLearnings(trade) {
        const learnings = {
            whatWorked: [],
            whatFailed: [],
            improvements: [],
            marketInsights: []
        };

        // Analyze what worked
        if (trade.profit > 0) {
            learnings.whatWorked.push(`Entry at ${trade.entryPrice} was optimal`);
            if (trade.strategy) {
                learnings.whatWorked.push(`Strategy ${trade.strategy} effective in current conditions`);
            }
        }

        // Analyze what failed
        if (trade.profit < 0) {
            learnings.whatFailed.push(`Entry timing needs improvement`);
            if (trade.stopLossHit) {
                learnings.whatFailed.push(`Stop loss placement too tight`);
            }
        }

        // Suggest improvements
        learnings.improvements = this.generateImprovements(trade);
        
        // Extract market insights
        learnings.marketInsights = this.extractMarketInsights(trade);

        return learnings;
    }

    updatePerformanceMetrics(trade) {
        const metrics = this.memoryBank.performance;
        
        // Update P&L
        metrics.totalProfitLoss += trade.profit || 0;
        
        // Update win rate
        const allTrades = this.memoryBank.trades;
        const wins = allTrades.filter(t => t.profit > 0).length;
        metrics.winRate = (wins / allTrades.length) * 100;
        
        // Track best/worst strategies
        this.updateStrategyPerformance(trade);
        
        // Track overnight profits if trade was overnight
        if (this.isOvernightTrade(trade)) {
            metrics.overnightProfits.push({
                date: new Date(trade.timestamp).toDateString(),
                profit: trade.profit
            });
        }
        
        // Update daily stats
        this.updateDailyStats(trade);
    }

    generateOvernightReport() {
        const report = {
            timestamp: Date.now(),
            totalOvernightProfit: 0,
            tradesExecuted: [],
            strategiesUsed: [],
            marketConditions: [],
            learnings: [],
            recommendations: []
        };

        // Calculate overnight profits
        const yesterday = Date.now() - (24 * 60 * 60 * 1000);
        const overnightTrades = this.memoryBank.trades.filter(
            t => t.timestamp > yesterday && this.isOvernightTrade(t)
        );

        report.tradesExecuted = overnightTrades;
        report.totalOvernightProfit = overnightTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
        
        // Extract unique strategies
        report.strategiesUsed = [...new Set(overnightTrades.map(t => t.strategy))];
        
        // Compile learnings
        report.learnings = overnightTrades.flatMap(t => t.learnings || []);
        
        // Generate recommendations for today
        report.recommendations = this.generateDailyRecommendations();

        return report;
    }

    initializeLearningEngine() {
        // Continuous learning from all data
        setInterval(() => {
            this.learn();
            this.evolve();
            this.optimize();
        }, 60 * 60 * 1000); // Every hour
    }

    learn() {
        // Pattern recognition improvement
        this.improvePatternRecognition();
        
        // Strategy optimization
        this.optimizeStrategies();
        
        // Risk management refinement
        this.refineRiskManagement();
        
        // Market adaptation
        this.adaptToMarketChanges();
    }

    evolve() {
        // Evolutionary algorithm for strategy improvement
        const currentVersion = this.getCurrentEvolutionVersion();
        const nextVersion = this.createNextEvolution(currentVersion);
        
        this.memoryBank.evolutionVersions[nextVersion.id] = nextVersion;
        
        console.log(`🧬 Evolved to ${nextVersion.id}`);
    }

    optimize() {
        // Remove underperforming strategies
        this.pruneWeakStrategies();
        
        // Enhance successful patterns
        this.enhanceSuccessfulPatterns();
        
        // Adjust risk parameters
        this.optimizeRiskParameters();
    }

    startMemoryBackup() {
        // Auto-save every 30 seconds
        setInterval(() => this.saveMemory(), 30000);
        
        // Backup to server every 5 minutes
        setInterval(() => this.backupToServer(), 5 * 60 * 1000);
    }

    async saveMemory() {
        try {
            // Save to localStorage
            localStorage.setItem('tradingMemory', JSON.stringify(this.memoryBank));
            
            // Mark last save time
            this.memoryBank.lastSaved = Date.now();
        } catch (error) {
            console.error('Failed to save memory:', error);
        }
    }

    async backupToServer() {
        try {
            const response = await fetch('/api/memory/backup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(this.memoryBank)
            });

            if (response.ok) {
                console.log('☁️ Memory backed up to server');
            }
        } catch (error) {
            console.error('Server backup failed:', error);
        }
    }

    // Helper methods
    getCurrentEvolutionVersion() {
        const versions = Object.keys(this.memoryBank.evolutionVersions);
        return versions.length > 0 ? versions[versions.length - 1] : 'V1';
    }

    calculatePatternReliability(pattern) {
        // Complex reliability calculation based on historical performance
        return Math.random() * 100; // Placeholder
    }

    estimateProfitPotential(pattern) {
        // Estimate based on similar patterns
        return Math.random() * 1000; // Placeholder
    }

    assessRiskLevel(pattern) {
        // Risk assessment algorithm
        return Math.random() * 10; // Placeholder
    }

    isOvernightTrade(trade) {
        const tradeHour = new Date(trade.timestamp).getHours();
        return tradeHour < 6 || tradeHour > 20;
    }

    displayGuidance(guidance) {
        // Display guidance in UI
        console.log('📊 Trading Guidance:', guidance);
    }
}

// Initialize the memory system
window.tradingMemory = new TradingMemorySystem();
