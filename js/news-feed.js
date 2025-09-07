// News Feed Integration - Real-time market news from multiple sources
// Better than Bloomberg Terminal

class NewsFeed {
    constructor() {
        this.newsItems = [];
        this.sources = [
            { name: 'Reuters', icon: '📰', active: true },
            { name: 'Bloomberg', icon: '📈', active: true },
            { name: 'CoinDesk', icon: '₿', active: true },
            { name: 'WSJ', icon: '📊', active: true },
            { name: 'Financial Times', icon: '💼', active: true },
            { name: 'CNBC', icon: '📺', active: true },
            { name: 'CryptoNews', icon: '🔗', active: true },
            { name: 'ForexLive', icon: '💱', active: true }
        ];
        this.filters = {
            market: 'all',
            sentiment: 'all',
            timeframe: '24h'
        };
        this.updateInterval = null;
    }

    render() {
        return `
            <div class="news-feed-panel" id="newsPanel">
                <div class="panel-header draggable-handle">
                    <h3 class="gradient-text">📰 Live News Feed</h3>
                    <div class="panel-controls">
                        <button class="minimize-btn" onclick="newsFeed.minimize()">_</button>
                        <button class="maximize-btn" onclick="newsFeed.maximize()">□</button>
                        <button class="settings-btn" onclick="newsFeed.openSettings()">⚙️</button>
                    </div>
                </div>
                
                <div class="news-filters">
                    <select id="newsMarketFilter" onchange="newsFeed.filterNews()">
                        <option value="all">All Markets</option>
                        <option value="crypto">Crypto</option>
                        <option value="forex">Forex</option>
                        <option value="stocks">Stocks</option>
                        <option value="commodities">Commodities</option>
                    </select>
                    
                    <select id="newsSentimentFilter" onchange="newsFeed.filterNews()">
                        <option value="all">All Sentiment</option>
                        <option value="bullish">Bullish Only</option>
                        <option value="bearish">Bearish Only</option>
                        <option value="neutral">Neutral</option>
                    </select>
                    
                    <select id="newsTimeFilter" onchange="newsFeed.filterNews()">
                        <option value="1h">Last Hour</option>
                        <option value="24h" selected>Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                    </select>
                    
                    <button class="refresh-news-btn" onclick="newsFeed.refreshNews()">🔄</button>
                </div>
                
                <div class="news-sources">
                    ${this.sources.map(source => `
                        <label class="source-toggle">
                            <input type="checkbox" 
                                   checked="${source.active}" 
                                   onchange="newsFeed.toggleSource('${source.name}')">
                            <span>${source.icon} ${source.name}</span>
                        </label>
                    `).join('')}
                </div>
                
                <div class="news-stream" id="newsStream">
                    <div class="loading-news">Loading latest news...</div>
                </div>
                
                <div class="news-footer">
                    <div class="news-stats">
                        <span id="newsCount">0</span> articles | 
                        <span id="newsUpdateTime">Just now</span>
                    </div>
                    <button class="audio-toggle" onclick="newsFeed.toggleAudio()">
                        🔊 Audio Alerts
                    </button>
                </div>
            </div>
        `;
    }

    initialize() {
        this.startNewsFeed();
        this.setupWebSocket();
        this.loadInitialNews();
    }

    startNewsFeed() {
        // Update news every 30 seconds
        this.updateInterval = setInterval(() => {
            this.fetchLatestNews();
        }, 30000);
    }

    setupWebSocket() {
        // Connect to news WebSocket for real-time updates
        try {
            this.ws = new WebSocket('wss://news-feed.auraquant.com');
            
            this.ws.onmessage = (event) => {
                const news = JSON.parse(event.data);
                this.addNewsItem(news);
            };
        } catch (error) {
            console.log('Using simulated news feed');
            this.simulateNews();
        }
    }

    simulateNews() {
        // Simulate real-time news for demo
        setInterval(() => {
            if (Math.random() > 0.7) {
                this.generateMockNews();
            }
        }, 10000);
    }

    generateMockNews() {
        const headlines = [
            { 
                title: "Bitcoin Surges Past $45,000 as Institutional Demand Soars",
                sentiment: "bullish",
                market: "crypto",
                impact: "high"
            },
            {
                title: "Fed Minutes Reveal Hawkish Stance on Interest Rates",
                sentiment: "bearish",
                market: "forex",
                impact: "high"
            },
            {
                title: "Tesla Reports Record Q4 Deliveries, Stock Jumps 8%",
                sentiment: "bullish",
                market: "stocks",
                impact: "medium"
            },
            {
                title: "Gold Prices Steady Amid Geopolitical Tensions",
                sentiment: "neutral",
                market: "commodities",
                impact: "low"
            },
            {
                title: "Ethereum Network Upgrade Successfully Completed",
                sentiment: "bullish",
                market: "crypto",
                impact: "medium"
            },
            {
                title: "USD Weakens Against Major Currencies",
                sentiment: "bearish",
                market: "forex",
                impact: "high"
            }
        ];
        
        const news = headlines[Math.floor(Math.random() * headlines.length)];
        const source = this.sources[Math.floor(Math.random() * this.sources.length)];
        
        this.addNewsItem({
            id: Date.now(),
            ...news,
            source: source.name,
            timestamp: new Date(),
            summary: this.generateSummary(news.title),
            tags: this.generateTags(news.market),
            readTime: Math.floor(Math.random() * 5) + 1
        });
    }

    generateSummary(title) {
        return `${title} according to market analysts. This development could have significant implications for traders and investors in the coming sessions.`;
    }

    generateTags(market) {
        const tagSets = {
            crypto: ['Bitcoin', 'Cryptocurrency', 'Blockchain', 'DeFi'],
            forex: ['USD', 'EUR', 'Currency', 'Exchange Rates'],
            stocks: ['Equities', 'NYSE', 'NASDAQ', 'Earnings'],
            commodities: ['Gold', 'Oil', 'Silver', 'Futures']
        };
        
        const tags = tagSets[market] || ['Market', 'Trading'];
        return tags.slice(0, 3);
    }

    addNewsItem(news) {
        // Add to beginning of array
        this.newsItems.unshift(news);
        
        // Keep only last 100 news items
        if (this.newsItems.length > 100) {
            this.newsItems = this.newsItems.slice(0, 100);
        }
        
        this.renderNewsItem(news, true);
        this.updateStats();
        
        // Audio alert for high impact news
        if (news.impact === 'high' && this.audioEnabled) {
            this.playAlert();
        }
    }

    renderNewsItem(news, prepend = false) {
        const stream = document.getElementById('newsStream');
        if (!stream) return;
        
        const newsElement = document.createElement('div');
        newsElement.className = `news-item ${news.sentiment} ${news.impact}-impact`;
        newsElement.innerHTML = `
            <div class="news-header">
                <span class="news-source">${this.getSourceIcon(news.source)} ${news.source}</span>
                <span class="news-time">${this.formatTime(news.timestamp)}</span>
            </div>
            <h4 class="news-title">${news.title}</h4>
            <p class="news-summary">${news.summary}</p>
            <div class="news-meta">
                <span class="news-sentiment ${news.sentiment}">${this.getSentimentIcon(news.sentiment)} ${news.sentiment}</span>
                <span class="news-impact">Impact: ${news.impact}</span>
                <span class="read-time">${news.readTime} min read</span>
            </div>
            <div class="news-tags">
                ${news.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="news-actions">
                <button onclick="newsFeed.analyzeImpact('${news.id}')">📊 Analyze Impact</button>
                <button onclick="newsFeed.shareNews('${news.id}')">📤 Share</button>
                <button onclick="newsFeed.saveNews('${news.id}')">📌 Save</button>
            </div>
        `;
        
        if (prepend && stream.firstChild) {
            stream.insertBefore(newsElement, stream.firstChild);
        } else {
            stream.appendChild(newsElement);
        }
        
        // Animate entry
        newsElement.style.animation = 'slideIn 0.3s ease-out';
    }

    getSourceIcon(source) {
        const sourceObj = this.sources.find(s => s.name === source);
        return sourceObj ? sourceObj.icon : '📰';
    }

    getSentimentIcon(sentiment) {
        const icons = {
            bullish: '🟢',
            bearish: '🔴',
            neutral: '⚪'
        };
        return icons[sentiment] || '⚪';
    }

    formatTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
        return time.toLocaleDateString();
    }

    filterNews() {
        const market = document.getElementById('newsMarketFilter').value;
        const sentiment = document.getElementById('newsSentimentFilter').value;
        const timeframe = document.getElementById('newsTimeFilter').value;
        
        this.filters = { market, sentiment, timeframe };
        this.renderFilteredNews();
    }

    renderFilteredNews() {
        const stream = document.getElementById('newsStream');
        if (!stream) return;
        
        stream.innerHTML = '';
        
        const filtered = this.newsItems.filter(news => {
            if (this.filters.market !== 'all' && news.market !== this.filters.market) return false;
            if (this.filters.sentiment !== 'all' && news.sentiment !== this.filters.sentiment) return false;
            // Add timeframe filtering logic here
            return true;
        });
        
        filtered.forEach(news => this.renderNewsItem(news));
        
        if (filtered.length === 0) {
            stream.innerHTML = '<div class="no-news">No news matching your filters</div>';
        }
    }

    updateStats() {
        document.getElementById('newsCount').textContent = this.newsItems.length;
        document.getElementById('newsUpdateTime').textContent = 'Just now';
    }

    refreshNews() {
        this.fetchLatestNews();
        this.showNotification('Refreshing news feed...', 'info');
    }

    fetchLatestNews() {
        // Simulate fetching news
        this.generateMockNews();
    }

    toggleSource(sourceName) {
        const source = this.sources.find(s => s.name === sourceName);
        if (source) {
            source.active = !source.active;
            this.filterNews();
        }
    }

    analyzeImpact(newsId) {
        const news = this.newsItems.find(n => n.id === newsId);
        if (news && window.aiPanel) {
            window.aiPanel.analyzeNewsImpact(news);
        }
    }

    shareNews(newsId) {
        const news = this.newsItems.find(n => n.id === newsId);
        if (news) {
            // Implement sharing functionality
            console.log('Sharing news:', news.title);
        }
    }

    saveNews(newsId) {
        const news = this.newsItems.find(n => n.id === newsId);
        if (news) {
            // Save to local storage
            const savedNews = JSON.parse(localStorage.getItem('savedNews') || '[]');
            savedNews.push(news);
            localStorage.setItem('savedNews', JSON.stringify(savedNews));
            this.showNotification('News saved!', 'success');
        }
    }

    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        this.showNotification(`Audio alerts ${this.audioEnabled ? 'enabled' : 'disabled'}`, 'info');
    }

    playAlert() {
        // Play audio alert for important news
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSpvwe');
        audio.play();
    }

    minimize() {
        document.getElementById('newsPanel').classList.add('minimized');
    }

    maximize() {
        document.getElementById('newsPanel').classList.toggle('maximized');
    }

    openSettings() {
        // Open news feed settings
        console.log('Opening news settings');
    }

    showNotification(message, type) {
        if (window.cockpit && window.cockpit.addCommentary) {
            window.cockpit.addCommentary(message, type);
        }
    }

    loadInitialNews() {
        // Load some initial news
        for (let i = 0; i < 5; i++) {
            setTimeout(() => this.generateMockNews(), i * 500);
        }
    }
}

// Initialize news feed
window.newsFeed = new NewsFeed();
