// js/config.js
const CONFIG = {
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000' 
        : 'https://auraquant-api.onrender.com',
    WS_URL: window.location.hostname === 'localhost'
        ? 'ws://localhost:3000'
        : 'wss://auraquant-api.onrender.com',
    VERSION: '1.0.0'
};
