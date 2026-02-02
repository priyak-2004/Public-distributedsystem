const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, '../../pds.db');

class DatabaseService {
    constructor() {
        this.db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error("Database connection error:", err.message);
            } else {
                console.log("Connected to SQLite database.");
                this.initSchema();
            }
        });
    }

    initSchema() {
        const sql = `
            CREATE TABLE IF NOT EXISTS local_transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                beneficiary_id TEXT,
                shop_id TEXT,
                quantity REAL,
                fraud_score REAL,
                risk_level TEXT,
                tx_hash TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                synced BOOLEAN DEFAULT 0
            )
        `;
        this.db.run(sql);
    }

    saveTransaction(data) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO local_transactions (beneficiary_id, shop_id, quantity, fraud_score, risk_level, tx_hash, synced) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const params = [
                data.beneficiaryId,
                data.shopId,
                data.quantity,
                data.fraudScore,
                data.riskLevel,
                data.txHash || null,
                data.synced ? 1 : 0
            ];
            this.db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    getAllTransactions() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM local_transactions ORDER BY timestamp DESC", [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = new DatabaseService();
