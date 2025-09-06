// Frontend Health Monitor - Ensures the platform never goes down
class HealthMonitor {
    constructor() {
        this.status = {
            backend: 'checking',
            websocket: 'checking',
            trading: 'checking',
            lastCheck: null
        };
        
        this.endpoints = {
            health: 'https://auraquant-backend.onrender.com/api/health',
            login: 'https://auraquant-backend.onrender.com/api/auth/login'
        };
        
        this.checkInterval = 30000; // 30 seconds
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    // Start monitoring
    start() {
        console.log('🔍 Health Monitor: Starting continuous monitoring...');
        this.performHealthCheck();
        
        // Regular health checks
        setInterval(() => {
            this.performHealthCheck();
        }, this.checkInterval);
        
        // Display status in console
        this.displayStatus();
    }

    // Perform comprehensive health check
    async performHealthCheck() {
        const checks = await Promise.all([
            this.checkBackend(),
            this.checkWebSocket(),
            this.checkTradingSystem()
        ]);
        
        this.status.lastCheck = new Date().toISOString();
        
        // Auto-recover if issues detected
        if (checks.includes(false)) {
            this.handleFailure();
        } else {
            this.retryCount = 0;
            this.displayHealthy();
        }
    }

    // Check backend connection
    async checkBackend() {
        try {
            const response = await fetch(this.endpoints.health, {
                method: 'GET',
                timeout: 5000
            });
            
            if (response.ok) {
                this.status.backend = 'healthy';
                return true;
            }
        } catch (error) {
            console.error('❌ Backend check failed:', error.message);
        }
        
        this.status.backend = 'unhealthy';
        return false;
    }

    // Check WebSocket connection
    async checkWebSocket() {
        if (window.ws && window.ws.readyState === WebSocket.OPEN) {
            this.status.websocket = 'connected';
            return true;
        }
        
        this.status.websocket = 'disconnected';
        // Try to reconnect
        if (window.ws) {
            window.ws.connect();
        }
        return false;
    }

    // Check trading system
    async checkTradingSystem() {
        if (window.syntheticCore && window.syntheticCore.consciousness === 'ACTIVE') {
            this.status.trading = 'active';
            return true;
        }
        
        this.status.trading = 'inactive';
        // Try to restart trading
        if (window.syntheticCore && window.syntheticCore.consciousness !== 'ACTIVE') {
            window.syntheticCore.awaken();
        }
        return false;
    }

    // Handle failure
    handleFailure() {
        this.retryCount++;
        console.warn(`⚠️ Health Monitor: Issues detected (Retry ${this.retryCount}/${this.maxRetries})`);
        
        if (this.retryCount >= this.maxRetries) {
            this.emergencyRecovery();
        }
    }

    // Emergency recovery
    emergencyRecovery() {
        console.log('🚨 Health Monitor: Initiating emergency recovery...');
        
        // Reload the page after 5 seconds if critical failure
        setTimeout(() => {
            if (this.status.backend === 'unhealthy') {
                console.log('🔄 Reloading application...');
                window.location.reload();
            }
        }, 5000);
    }

    // Display healthy status
    displayHealthy() {
        console.log('✅ Health Monitor: All systems operational');
    }

    // Display current status
    displayStatus() {
        // Create status indicator in page
        const statusDiv = document.createElement('div');
        statusDiv.id = 'health-status';
        statusDiv.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(20, 20, 31, 0.9);
            border: 1px solid #2a2a3f;
            border-radius: 8px;
            padding: 10px;
            font-size: 12px;
            color: #9ca3af;
            z-index: 10000;
            font-family: monospace;
        `;
        
        // Update status display every second
        setInterval(() => {
            statusDiv.innerHTML = `
                <div style="color: #3b82f6; font-weight: bold; margin-bottom: 5px;">System Status</div>
                <div>Backend: <span style="color: ${this.getStatusColor(this.status.backend)}">${this.status.backend}</span></div>
                <div>WebSocket: <span style="color: ${this.getStatusColor(this.status.websocket)}">${this.status.websocket}</span></div>
                <div>Trading: <span style="color: ${this.getStatusColor(this.status.trading)}">${this.status.trading}</span></div>
                <div style="margin-top: 5px; font-size: 10px;">Last check: ${this.status.lastCheck ? new Date(this.status.lastCheck).toLocaleTimeString() : 'Never'}</div>
            `;
        }, 1000);
        
        document.body.appendChild(statusDiv);
    }

    // Get status color
    getStatusColor(status) {
        switch(status) {
            case 'healthy':
            case 'connected':
            case 'active':
                return '#10b981';
            case 'unhealthy':
            case 'disconnected':
            case 'inactive':
                return '#ef4444';
            default:
                return '#f59e0b';
        }
    }

    // Get current status
    getStatus() {
        return this.status;
    }
}

// Initialize and start health monitor
window.healthMonitor = new HealthMonitor();

// Start monitoring when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.healthMonitor.start();
    }, 2000);
});
