require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const blockchainService = require('./services/blockchain');
const aiService = require('./services/ai');
const dbService = require('./services/db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Initialize services
blockchainService.init();

const ipfsService = require('./services/ipfs');

// Routes

// Generic Events Endpoint (for Timeline)
app.get('/events', async (req, res) => {
    try {
        const events = await blockchainService.getEvents();
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/events', async (req, res) => {
    try {
        const { eventType, metadata } = req.body;

        // 1. Upload metadata to IPFS
        // Metadata is already JSON string or object. 
        // If string, parse it first to ensure valid JSON structure for IPFS
        let payload = metadata;
        if (typeof metadata === 'string') {
            try {
                payload = JSON.parse(metadata);
            } catch (e) {
                // keep as string if not json
            }
        }

        const ipfsHash = await ipfsService.uploadJSON({
            type: eventType,
            timestamp: Date.now(),
            data: payload
        });

        // 2. Record on Blockchain
        const txResult = await blockchainService.addEvent(eventType, ipfsHash);

        res.json({
            success: true,
            metadataHash: ipfsHash,
            transactionHash: txResult.txHash,
            message: "Event recorded successfully"
        });

    } catch (error) {
        console.error("Event creation failed:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
app.post('/distribute', async (req, res) => {
    try {
        const { beneficiaryId, shopId, quantity, region, regionRisk, shopFrequency, monthlyTotal, timeGap } = req.body;

        // 1. Check Fraud with AI
        const aiResponse = await aiService.predictFraud({
            quantity,
            timeGap,
            monthlyTotal,
            shopFrequency,
            regionRisk
        });

        const fraudScore = aiResponse.fraud_score; // 0-1
        const riskLevel = aiResponse.risk_level;
        const timestamp = Date.now();

        let txHash = null;
        let ipfsHash = null;

        // 2. Construct Encrypted/Hashed Paylod
        // For hackathon, we store JSON structure. In real world, sensitive data like beneficiaryId should be hashed or encrypted.
        const pdsPayload = {
            type: "PDS_DISTRIBUTION",
            data: {
                beneficiaryId, // In prod: hash(beneficiaryId)
                shopId,
                quantity,
                region,
                timestamp
            },
            aiAnalysis: {
                fraudScore,
                riskLevel,
                status: riskLevel === 'HIGH' ? 'FLAGGED' : 'VERIFIED'
            }
        };

        // 3. Upload to IPFS
        try {
            ipfsHash = await ipfsService.uploadJSON(pdsPayload);
        } catch (ipfsError) {
            console.error("IPFS Upload Error:", ipfsError);
            // If IPFS fails, we might still want to proceed or block. Blocking for data integrity.
            throw new Error("Failed to store data on IPFS");
        }

        // 4. Record on Blockchain (EventChain)
        // If Risk is High, we might still record it as a "Rejected/Flagged" event
        try {
            const txResult = await blockchainService.addEvent("PDS_DISTRIBUTION", ipfsHash);
            txHash = txResult.txHash;
        } catch (bcError) {
            console.error("Blockchain write failed:", bcError.message);
            // Non-blocking for local demo if chain fails? Or blocking?
            // Blocking to ensure ledger property.
            throw new Error("Blockchain transaction failed");
        }

        // 5. Save to Local DB (for cache/backup)
        await dbService.saveTransaction({
            beneficiaryId,
            shopId,
            quantity,
            fraudScore,
            riskLevel,
            txHash,
            synced: true
        });

        res.json({
            success: true,
            fraudScore,
            riskLevel,
            txHash,
            ipfsHash,
            message: riskLevel === 'HIGH' ? "Transaction Flagged as Fraud" : "Distribution Successful"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/transactions', async (req, res) => {
    try {
        const txs = await dbService.getAllTransactions();
        res.json(txs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/pds-events', async (req, res) => {
    try {
        const events = await blockchainService.getEvents();
        // Filter for PDS_DISTRIBUTION
        const pdsEvents = events.filter(e => e.eventType === 'PDS_DISTRIBUTION');
        res.json(pdsEvents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/events/verify/:hash', async (req, res) => {
    try {
        const hash = req.params.hash;
        const events = await blockchainService.getEvents();
        const event = events.find(e => e.ipfsHash === hash);

        if (!event) {
            return res.status(404).json({ exists: false, message: "Event hash not found on blockchain." });
        }

        // Fetch IPFS content
        let ipfsData = null;
        try {
            ipfsData = await ipfsService.getJSON(hash);
        } catch (e) {
            console.error("IPFS Fetch Error:", e);
        }

        res.json({
            exists: true,
            event: event,
            content: ipfsData,
            message: "Event Verified Successfully"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/dashboard-metrics', async (req, res) => {
    // Return aggregated metrics
    try {
        // Source of truth: Blockchain events or Local DB?
        // Using Local DB for speed in dashboard
        const txs = await dbService.getAllTransactions();
        const total = txs.length;
        const fraud = txs.filter(t => t.fraud_score > 0.7).length;
        const pending = txs.filter(t => !t.synced).length;

        // Also fetch chain stats if needed
        // const chainEvents = await blockchainService.getEvents();

        res.json({
            totalTransactions: total,
            fraudAlerts: fraud,
            pendingSync: pending,
            systemHealth: "Good"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
