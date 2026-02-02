const axios = require('axios');
const FormData = require('form-data');
const crypto = require('crypto');

// Simple in-memory storage for Mock IPFS (clears on restart, but sufficient for local demo)
// For persistence, we could use dbService, but let's keep it simple for now as per "mock" requirement in failure.
const mockIpfsStorage = new Map();

class IpfsService {
    constructor() {
        this.ipfsUrl = process.env.IPFS_API_URL || 'http://127.0.0.1:5001/api/v0';
    }

    async uploadJSON(data) {
        try {
            const jsonString = JSON.stringify(data);
            const formData = new FormData();

            // Append as a file named "data.json"
            formData.append('file', Buffer.from(jsonString), 'data.json');

            const response = await axios.post(`${this.ipfsUrl}/add`, formData, {
                headers: {
                    ...formData.getHeaders()
                },
                params: {
                    'pin': true
                }
            });

            if (response.data && response.data.Hash) {
                console.log(`IPFS Upload Success: ${response.data.Hash}`);
                return response.data.Hash;
            } else {
                throw new Error("Invalid IPFS response");
            }

        } catch (error) {
            console.warn("IPFS Connection Failed (using Mock IPFS Fallback):", error.message);
            // Fallback: Generate a deterministic hash (SHA256) of the content to simulate IPFS CID
            const jsonString = JSON.stringify(data);
            const hash = crypto.createHash('sha256').update(jsonString).digest('hex');
            const mockCid = `Qm${hash.substring(0, 44)}`; // Fake CID-like string

            mockIpfsStorage.set(mockCid, data);
            console.log(`[MOCK] Stored data with hash: ${mockCid}`);
            return mockCid;
        }
    }

    async getJSON(hash) {
        try {
            // Check mock first if it looks like our mock hash
            if (mockIpfsStorage.has(hash)) {
                console.log(`[MOCK] Retrieved data for hash: ${hash}`);
                return mockIpfsStorage.get(hash);
            }

            // Use local gateway or public gateway
            const gatewayUrl = process.env.IPFS_GATEWAY_URL || 'http://127.0.0.1:8080/ipfs';
            const response = await axios.get(`${gatewayUrl}/${hash}`);
            return response.data;
        } catch (error) {
            console.error(`IPFS Fetch Failed for ${hash}:`, error.message);
            // double check mock just in case
            if (mockIpfsStorage.has(hash)) {
                return mockIpfsStorage.get(hash);
            }
            return null;
        }
    }
}

module.exports = new IpfsService();
