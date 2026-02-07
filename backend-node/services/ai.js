const axios = require('axios');

class AIService {
    constructor() {
        this.baseUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:5000';
    }

    async predictFraud(transactionData) {
        try {
            // Transform data if necessary to match python model expectation
            // python expects: quantity, time_gap_hours, monthly_total, shop_frequency, region_risk

            const payload = {
                quantity: parseFloat(transactionData.quantity),
                time_gap_hours: parseFloat(transactionData.timeGap || 720), // Default 1 month
                monthly_total: parseFloat(transactionData.monthlyTotal || 0),
                shop_frequency: parseInt(transactionData.shopFrequency || 1),
                region_risk: parseInt(transactionData.regionRisk || 0),
                // Add history count (mock or from input)
                history_count: parseInt(transactionData.historyCount || Math.floor(Math.random() * 5))
            };

            const response = await axios.post(`${this.baseUrl}/predict-fraud`, payload);
            return response.data; // { fraud_score, risk_level, status }
        } catch (error) {
            console.error("AI Service Error:", error.message);
            // Fallback if AI is down?
            // Requirement says "Try/Catch for every external call"
            // We can return a safe default (Score 0) or block.
            // Requirement: "Works fully offline". If AI service is local and down, we should probably fail safe or block.
            // Let's return a High Risk error to be safe, or 0.5 (Medium/Unknown).
            return {
                fraud_score: 0.5,
                risk_level: "UNKNOWN",
                status: "ERROR"
            };
        }
    }
}

module.exports = new AIService();
