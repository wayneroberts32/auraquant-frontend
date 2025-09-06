// Chart.js implementation for AuraQuant Trading Platform
class ChartManager {
    constructor() {
        this.chart = null;
        this.candleData = [];
        this.volumeData = [];
    }

    // Initialize the main trading chart
    initializeChart(containerId) {
        const ctx = document.getElementById(containerId);
        if (!ctx) {
            console.error('Chart container not found:', containerId);
            return;
        }

        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.destroy();
        }

        // Create the candlestick chart
        this.chart = new Chart(ctx, {
            type: 'candlestick',
            data: {
                datasets: [{
                    label: 'Price',
                    data: this.candleData,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    zoom: {
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'x',
                        },
                        pan: {
                            enabled: true,
                            mode: 'x',
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const point = context.raw;
                                return [
                                    'Open: ' + point.o.toFixed(2),
                                    'High: ' + point.h.toFixed(2),
                                    'Low: ' + point.l.toFixed(2),
                                    'Close: ' + point.c.toFixed(2)
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    y: {
                        position: 'right',
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    }
                }
            }
        });
    }

    // Update chart with new data
    updateChart(data) {
        if (!this.chart) return;

        // Convert data to candlestick format
        this.candleData = data.map(candle => ({
            x: new Date(candle.time),
            o: candle.open,
            h: candle.high,
            l: candle.low,
            c: candle.close
        }));

        this.chart.data.datasets[0].data = this.candleData;
        this.chart.update('none'); // Update without animation for performance
    }

    // Add indicators to the chart
    addIndicator(type, params) {
        switch(type) {
            case 'SMA':
                this.addSMA(params.period || 20);
                break;
            case 'EMA':
                this.addEMA(params.period || 20);
                break;
            case 'BB':
                this.addBollingerBands(params.period || 20, params.stdDev || 2);
                break;
            case 'RSI':
                this.addRSI(params.period || 14);
                break;
        }
    }

    // Simple Moving Average
    addSMA(period) {
        const smaData = this.calculateSMA(this.candleData, period);
        
        this.chart.data.datasets.push({
            label: `SMA ${period}`,
            data: smaData,
            type: 'line',
            borderColor: '#fbbf24',
            borderWidth: 2,
            pointRadius: 0,
            fill: false
        });
        
        this.chart.update();
    }

    calculateSMA(data, period) {
        const sma = [];
        for (let i = period - 1; i < data.length; i++) {
            let sum = 0;
            for (let j = 0; j < period; j++) {
                sum += data[i - j].c;
            }
            sma.push({
                x: data[i].x,
                y: sum / period
            });
        }
        return sma;
    }

    // Exponential Moving Average
    addEMA(period) {
        const emaData = this.calculateEMA(this.candleData, period);
        
        this.chart.data.datasets.push({
            label: `EMA ${period}`,
            data: emaData,
            type: 'line',
            borderColor: '#a855f7',
            borderWidth: 2,
            pointRadius: 0,
            fill: false
        });
        
        this.chart.update();
    }

    calculateEMA(data, period) {
        const multiplier = 2 / (period + 1);
        const ema = [];
        
        // Start with SMA for the first value
        let sum = 0;
        for (let i = 0; i < period; i++) {
            sum += data[i].c;
        }
        let previousEMA = sum / period;
        
        for (let i = period; i < data.length; i++) {
            const currentEMA = (data[i].c - previousEMA) * multiplier + previousEMA;
            ema.push({
                x: data[i].x,
                y: currentEMA
            });
            previousEMA = currentEMA;
        }
        
        return ema;
    }

    // Bollinger Bands
    addBollingerBands(period, stdDev) {
        const { upper, middle, lower } = this.calculateBollingerBands(this.candleData, period, stdDev);
        
        // Add middle band (SMA)
        this.chart.data.datasets.push({
            label: `BB Middle`,
            data: middle,
            type: 'line',
            borderColor: '#6b7280',
            borderWidth: 1,
            pointRadius: 0,
            fill: false
        });
        
        // Add upper band
        this.chart.data.datasets.push({
            label: `BB Upper`,
            data: upper,
            type: 'line',
            borderColor: '#ef4444',
            borderWidth: 1,
            pointRadius: 0,
            fill: false
        });
        
        // Add lower band
        this.chart.data.datasets.push({
            label: `BB Lower`,
            data: lower,
            type: 'line',
            borderColor: '#10b981',
            borderWidth: 1,
            pointRadius: 0,
            fill: false
        });
        
        this.chart.update();
    }

    calculateBollingerBands(data, period, stdDev) {
        const middle = this.calculateSMA(data, period);
        const upper = [];
        const lower = [];
        
        for (let i = period - 1; i < data.length; i++) {
            let sumSquares = 0;
            const avg = middle[i - period + 1].y;
            
            for (let j = 0; j < period; j++) {
                const diff = data[i - j].c - avg;
                sumSquares += diff * diff;
            }
            
            const std = Math.sqrt(sumSquares / period);
            
            upper.push({
                x: data[i].x,
                y: avg + (std * stdDev)
            });
            
            lower.push({
                x: data[i].x,
                y: avg - (std * stdDev)
            });
        }
        
        return { upper, middle, lower };
    }

    // Clear all indicators
    clearIndicators() {
        if (!this.chart) return;
        
        // Keep only the main price dataset
        this.chart.data.datasets = [this.chart.data.datasets[0]];
        this.chart.update();
    }

    // Destroy the chart
    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}

// Initialize chart manager globally
window.chartManager = new ChartManager();
