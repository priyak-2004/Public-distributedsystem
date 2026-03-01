const axios = require('axios');
const FormData = require('form-data');
const crypto = require('crypto');

// Simple in-memory storage for Mock IPFS (clears on restart, but sufficient for local demo)
const mockIpfsStorage = new Map();

class IpfsService {
    constructor() {
        this.ipfsUrl = process.env.IPFS_API_URL || 'http://127.0.0.1:5001/api/v0';
        this.provider = process.env.IPFS_PROVIDER || 'local'; // local, web3storage, pinata, infura
        this.web3StorageToken = process.env.WEB3_STORAGE_TOKEN;
        this.pinataApiKey = process.env.PINATA_API_KEY;
        this.pinataApiSecret = process.env.PINATA_API_SECRET;
    }

    async uploadJSON(data) {
        try {
            // Route to appropriate provider
            if (this.provider === 'web3storage' && this.web3StorageToken) {
                return await this.uploadToWeb3Storage(data);
            } else if (this.provider === 'pinata' && this.pinataApiKey) {
                return await this.uploadToPinata(data);
            } else if (this.provider === 'infura') {
                return await this.uploadToInfura(data);
            } else {
                // Default to local/fallback
                return await this.uploadToLocal(data);
            }
        } catch (error) {
            console.warn(`[${this.provider.toUpperCase()}] Upload Failed:`, error.message);
            console.warn("Falling back to Mock IPFS...");
            return this.uploadToMock(data);
        }
    }

    // Web3.Storage Upload
    async uploadToWeb3Storage(data) {
        const jsonString = JSON.stringify(data);
        const blob = Buffer.from(jsonString);

        const formData = new FormData();
        formData.append('file', blob, 'data.json');

        const response = await axios.post('https://api.web3.storage/upload', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${this.web3StorageToken}`
            }
        });

        if (response.data && response.data.cid) {
            console.log(`[WEB3.STORAGE] Upload Success: ${response.data.cid}`);
            return response.data.cid;
        }
        throw new Error('Invalid Web3.Storage response');
    }

    // Pinata Upload
    async uploadToPinata(data) {
        const jsonString = JSON.stringify(data);
        const formData = new FormData();
        formData.append('file', Buffer.from(jsonString), 'data.json');

        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataApiSecret
                }
            }
        );

        if (response.data && response.data.IpfsHash) {
            console.log(`[PINATA] Upload Success: ${response.data.IpfsHash}`);
            return response.data.IpfsHash;
        }
        throw new Error('Invalid Pinata response');
    }

    // Infura Upload
    async uploadToInfura(data) {
        const jsonString = JSON.stringify(data);
        const formData = new FormData();
        formData.append('file', Buffer.from(jsonString), 'data.json');

        const response = await axios.post(`${this.ipfsUrl}/add`, formData, {
            headers: { ...formData.getHeaders() },
            params: { pin: true }
        });

        if (response.data && response.data.Hash) {
            console.log(`[INFURA] Upload Success: ${response.data.Hash}`);
            return response.data.Hash;
        }
        throw new Error('Invalid Infura response');
    }

    // Local IPFS Daemon Upload
    async uploadToLocal(data) {
        const jsonString = JSON.stringify(data);
        const formData = new FormData();
        formData.append('file', Buffer.from(jsonString), 'data.json');

        const response = await axios.post(`${this.ipfsUrl}/add`, formData, {
            headers: { ...formData.getHeaders() },
            params: { pin: true }
        });

        if (response.data && response.data.Hash) {
            console.log(`[LOCAL IPFS] Upload Success: ${response.data.Hash}`);
            return response.data.Hash;
        }
        throw new Error('Invalid IPFS response');
    }

    // Mock IPFS Upload (fallback)
    uploadToMock(data) {
        const jsonString = JSON.stringify(data);
        const hash = crypto.createHash('sha256').update(jsonString).digest('hex');
        const mockCid = `Qm${hash.substring(0, 44)}`;
        mockIpfsStorage.set(mockCid, data);
        console.log(`[MOCK] Stored data with hash: ${mockCid}`);
        return mockCid;
    }

    async getJSON(hash) {
        try {
            // Check mock first
            if (mockIpfsStorage.has(hash)) {
                console.log(`[MOCK] Retrieved data for hash: ${hash}`);
                return mockIpfsStorage.get(hash);
            }

            // Try Web3.Storage gateway
            if (this.provider === 'web3storage') {
                const response = await axios.get(`https://${hash}.ipfs.w3s.link`);
                return response.data;
            }

            // Try Infura gateway
            if (this.provider === 'infura') {
                const response = await axios.get(`https://infura-ipfs.io/ipfs/${hash}`);
                return response.data;
            }

            // Use configured gateway or public gateway
            const gatewayUrl = process.env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';
            const response = await axios.get(`${gatewayUrl}/${hash}`);
            return response.data;
        } catch (error) {
            console.error(`IPFS Fetch Failed for ${hash}:`, error.message);
            if (mockIpfsStorage.has(hash)) {
                return mockIpfsStorage.get(hash);
            }
            return null;
        }
    }
}

module.exports = new IpfsService();
