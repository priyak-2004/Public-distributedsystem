const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load ABI
// We try resolving from ../artifacts (Docker/Local with copy) or ../../artifacts (Local dev)
// Load ABI
// We try resolving from ../artifacts (Docker/Local with copy) or ../../artifacts (Local dev)
const ARTIFACT_PATH_DOCKER = path.resolve(__dirname, '../artifacts/contracts/EventChain.sol/EventChain.json');
const ARTIFACT_PATH_LOCAL = path.resolve(__dirname, '../../artifacts/contracts/EventChain.sol/EventChain.json');

let EventChainArtifact;

try {
    if (fs.existsSync(ARTIFACT_PATH_DOCKER)) {
        EventChainArtifact = require(ARTIFACT_PATH_DOCKER);
    } else {
        EventChainArtifact = require(ARTIFACT_PATH_LOCAL);
    }
} catch (e) {
    console.error("Could not load EventChain artifact. Ensure contracts are compiled.");
    EventChainArtifact = { abi: [] };
}

class BlockchainService {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.contract = null;
        this.connected = false;
    }

    async init() {
        try {
            const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
            const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
            const contractAddress = process.env.CONTRACT_ADDRESS;

            if (!privateKey || !contractAddress) {
                console.warn("Blockchain config missing (Private Key or Contract Address). Blockchain features will fail.");
                return;
            }

            this.provider = new ethers.JsonRpcProvider(rpcUrl);
            this.wallet = new ethers.Wallet(privateKey, this.provider);
            this.contract = new ethers.Contract(contractAddress, EventChainArtifact.abi, this.wallet);

            this.connected = true;
            console.log(`Blockchain Connected (EventChain): ${contractAddress}`);
        } catch (error) {
            console.error("Blockchain Connection Failed:", error.message);
        }
    }

    async addEvent(eventType, ipfsHash) {
        if (!this.connected) throw new Error("Blockchain not connected");

        try {
            const tx = await this.contract.addEvent(
                eventType,
                ipfsHash
            );
            console.log(`Transaction sent: ${tx.hash}`);
            const receipt = await tx.wait();
            return {
                success: true,
                txHash: tx.hash,
                block: receipt.blockNumber
            };
        } catch (error) {
            console.error("Smart Contract Error:", error);
            throw error;
        }
    }

    async getEvents() {
        if (!this.connected) return [];

        try {
            const filter = this.contract.filters.EventAdded();
            const events = await this.contract.queryFilter(filter, 0, "latest");

            return events.map(e => ({
                index: Number(e.args[0]),
                actor: e.args[1],
                eventType: e.args[2],
                ipfsHash: e.args[3],
                timestamp: Number(e.args[4]),
                eventHash: e.args[5],
                txHash: e.transactionHash
            }));
        } catch (error) {
            console.error("Error fetching events:", error);
            return [];
        }
    }
}

module.exports = new BlockchainService();
