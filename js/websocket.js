// js/websocket.js
class WebSocketManager {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
    }
    
    connect(token) {
        this.ws = new WebSocket(CONFIG.WS_URL);
        
        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.ws.send(JSON.stringify({
                type: 'authenticate',
                token: token
            }));
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };
        
        this.ws.onclose = () => {
            this.reconnect();
        };
    }
    
    handleMessage(data) {
        console.log('WebSocket message:', data);
        // Handle different message types
    }
    
    reconnect() {
        setTimeout(() => {
            if (this.reconnectAttempts < 5) {
                this.reconnectAttempts++;
                this.connect();
            }
        }, 3000);
    }
    
    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }
}
