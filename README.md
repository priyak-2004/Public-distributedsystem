# EventChain – AI-Enabled Intelligent PDS Monitoring Platform

## 📋 Project Overview

**EventChain** is a cutting-edge **Public Distribution System (PDS) Monitoring Platform** that combines three powerful technologies:
- **🔗 Blockchain (Ethereum)**: For immutable, transparent record-keeping
- **📦 IPFS**: For decentralized storage of transaction details
- **🤖 AI/ML**: For real-time fraud detection and risk assessment

### What Problem Does It Solve?
Traditional PDS systems suffer from:
- **Lack of Transparency**: No verifiable records of ration distribution
- **Fraud & Mismanagement**: Difficult to detect abnormal distribution patterns
- **Centralized Control**: Single point of failure; prone to manipulation

**EventChain** solves these by creating a **tamper-proof, transparent, and intelligent system** where:
- Every distribution is recorded on an immutable blockchain ledger
- Citizens can verify any transaction independently via QR codes
- AI continuously monitors for fraudulent patterns in real-time
- Authorities have real-time visibility into system health and anomalies

### Who Can Use It?
- **PDS Authorities**: Distribute rations and monitor distribution patterns
- **Citizens/Beneficiaries**: Verify their transactions and claims
- **Auditors**: Audit distribution records with full transparency

## 🎯 Key Features

### 1. 🔐 Immutable Event Ledger
Every ration distribution is treated as a verifiable "event" recorded permanently:
- **Blockchain Storage**: Ethereum smart contracts (`EventChain.sol`, `RationDistribution.sol`) store metadata and cryptographic proofs
- **Decentralized Storage**: Full transaction details stored on IPFS, ensuring no central authority can alter records
- **Proof of Existence**: QR codes link to IPFS content; blockchain proves the hash hasn't been tampered with

### 2. 🤖 Real-Time AI Fraud Detection
Advanced machine learning continuously analyzes distribution patterns:
- **Fraud Scoring (0-1 scale)**: Calculates risk based on:
  - Region-specific distribution patterns
  - Historical transaction frequency
  - Time gaps between distributions
  - Quantity anomalies
- **Pre-validation Checks**: Flags suspicious transactions *before* blockchain recording
- **Explainable Alerts**: Provides clear reasons why a transaction was flagged (e.g., "Unusually high frequency", "Abnormal quantity for region")

### 3. 📊 Real-Time Authority Dashboard
Complete visibility into PDS ecosystem for administrators:
- **Live Transaction Feed**: Monitor all verified distributions as they happen
- **System Health Monitoring**: Check connectivity status of IPFS and blockchain nodes
- **Fraud Alerts Panel**: Immediate notification of high-risk transactions
- **Statistics & Analytics**: Distribution trends, system usage metrics

### 4. ✅ Public Verification System
Empowers citizens and auditors with full transparency:
- **QR Code Verification**: Every distribution generates a unique QR code
- **Independent Verification**: Users can verify transaction authenticity without trusting any central authority
- **Cryptographic Proof**: Confirms that blockchain hash matches IPFS data

## 🏗️ System Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERACTION LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Authority   │  │   Citizens   │  │  Auditors/Public     │  │
│  │  Dashboard   │  │  Verification│  │  Verification UI     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└────────────────────────────┬──────────────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────────────┐
│                    FRONTEND LAYER (React)                         │
│  • Web portal for PDS distribution entry                         │
│  • Real-time dashboard & transaction verification               │
│  • QR code generation and verification                          │
└────────────────────────────┬──────────────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────────────┐
│                    BACKEND API LAYER (Node.js)                    │
│  • REST API for distribution management                          │
│  • Transaction coordination & routing                            │
│  • Database management (SQLite cache)                            │
└────────────────────────────┬──────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼──────┐  ┌──────────▼─────┐  ┌──────────▼──────┐
│  AI SERVICE  │  │ IPFS SERVICE   │  │  BLOCKCHAIN     │
│  (Python)    │  │  (Node.js)     │  │  (Ethereum)     │
│              │  │                │  │                 │
│ • Trains on  │  │ • Stores full  │  │ • Records hashes│
│   patterns   │  │   transaction  │  │ • Immutable log │
│ • Scores     │  │   data (JSON)  │  │ • Smart         │
│   fraud risk │  │ • Returns IPFS │  │   contracts     │
│ • Validates  │  │   hash         │  │                 │
│   txns       │  │                │  │                 │
└──────────────┘  └────────────────┘  └─────────────────┘
```

### Data Flow for a Distribution Event
1. **Input**: Authority enters beneficiary ID & quantity via frontend
2. **Validation**: Backend validates input and sends to AI Service
3. **Fraud Check**: AI Service analyzes transaction against historical patterns, returns fraud score
4. **Storage**: Validated transaction + AI score is uploaded to IPFS
5. **Recording**: IPFS hash is recorded on Ethereum blockchain via smart contract
6. **Notification**: Frontend shows QR code linking to IPFS data
7. **Verification**: Anyone can scan QR code and verify blockchain integrity

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React, Tailwind CSS, ethers.js | User interface, blockchain interaction |
| **Backend API** | Node.js, Express.js | REST API, transaction orchestration |
| **AI/ML Service** | Python, FastAPI, Scikit-learn | Fraud detection, pattern analysis |
| **Blockchain** | Solidity, Hardhat, Ethereum | Immutable ledger, smart contracts |
| **Decentralized Storage** | IPFS (InterPlanetary File System) | Distributed transaction data storage |
| **Local Database** | SQLite | Caching and temporary data |
| **Containerization** | Docker, Docker Compose | Multi-service orchestration |

## 📁 Project Structure

```
PDS/
├── frontend/                 # React web application
│   ├── src/
│   │   ├── components/      # Reusable UI components (Dashboard, Forms, etc.)
│   │   ├── pages/           # Page components (Home, Dashboard, Timeline, Verify)
│   │   ├── services/        # API and blockchain service calls
│   │   ├── context/         # React context for state management
│   │   ├── index.js
│   │   └── App.js
│   └── package.json
│
├── backend-node/            # Node.js REST API & orchestration
│   ├── index.js            # Main server entry point
│   ├── services/           # Business logic
│   │   ├── blockchain.js   # Smart contract interactions
│   │   ├── ipfs.js        # IPFS upload/retrieval
│   │   ├── ai.js          # AI service communication
│   │   └── db.js          # Database operations
│   ├── routes/            # API endpoint definitions
│   └── package.json
│
├── ai-service/             # Python ML/AI fraud detection service
│   ├── main.py            # FastAPI server
│   ├── model.py           # Fraud model training & scoring
│   ├── requirements.txt    # Python package dependencies
│   └── fraud_model.pkl    # Pre-trained fraud detection model
│
├── contracts/              # Solidity smart contracts
│   ├── EventChain.sol      # Main event ledger contract
│   ├── RationDistribution.sol  # PDS-specific contract logic
│   ├── 1_Storage.sol       # Sample storage contract
│   ├── 2_Owner.sol         # Ownership management
│   └── 3_Ballot.sol        # Voting mechanism
│
├── scripts/                # Deployment & testing scripts
│   ├── deploy.js           # Main deployment script
│   ├── deploy-eventchain.js
│   ├── deploy-ration.js
│   └── deploy_with_ethers.ts
│
├── hardhat.config.js       # Hardhat blockchain development config
├── docker-compose.yml      # Multi-service Docker orchestration
├── pom.xml                 # Maven build configuration
├── README.md              # This documentation
└── QUICKSTART.md          # Quick start guide
```

## 🚀 Getting Started

### Prerequisites
Before running the project, ensure you have:
- **Node.js** v16+ ([Download](https://nodejs.org/))
- **Python** v3.8+ ([Download](https://www.python.org/))
- **Docker & Docker Compose** (Optional, for containerized setup)
- **MetaMask** Browser Extension (for blockchain interaction)
- **Git** for version control

### Quick Setup (Local Development)

#### Step 1: Start the AI Service (Fraud Detection)
```bash
cd ai-service
pip install -r requirements.txt
python main.py
# Service will run on http://localhost:8000
```

#### Step 2: Start the Backend API
```bash
cd backend-node
npm install
node index.js
# API will run on http://localhost:4000
```

#### Step 3: Deploy Smart Contracts
Open a new terminal:
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
# Note the deployed contract address
```

Update the contract address in `backend-node/.env`:
```
EVENTCHAIN_CONTRACT_ADDRESS=<address_from_deployment>
```

#### Step 4: Start the Frontend
```bash
cd frontend
npm install
npm start
# Frontend will run on http://localhost:3000
```

### Using Docker (Recommended for Full Stack)
```bash
docker-compose up
# All services will start automatically
```

## 📖 Understanding the Project

### For Authority Users
1. **Login**: Access the authority dashboard
2. **Add Distribution**: Click "Add Event" to record a ration distribution
3. **Fill Details**: 
   - Beneficiary ID
   - Quantity
   - Location/Region
4. **Review Fraud Score**: AI analyzes the transaction
5. **Confirm**: Approved transactions are recorded on blockchain

### For Citizens/Auditors
1. **Get QR Code**: From any distribution receipt or transaction details
2. **Scan QR**: Opens the transaction details
3. **Verify**: Check that the blockchain hash matches IPFS data
4. **Share**: Proof of transaction can be shared with authorities

### For Developers
- **Smart Contracts**: Located in `/contracts/` - written in Solidity
- **Frontend Code**: Located in `/frontend/src/` - React components
- **Backend Services**: Located in `/backend-node/services/` - Node.js modules
- **AI Model**: Located in `/ai-service/` - Python/Scikit-learn

## 🔍 Key Components Explained

### Smart Contracts (Solidity)
- **EventChain.sol**: Core ledger that records all distribution events
- **RationDistribution.sol**: Manages PDS-specific business logic
- Deployed on Ethereum (local/testnet)

### Backend API (Node.js)
- RESTful endpoints for creating, updating, and querying events
- Orchestrates communication between frontend, AI service, IPFS, and blockchain
- Manages database caching for performance

### AI Service (Python)
- Trained model for fraud detection
- Analyzes distribution patterns in real-time
- Returns fraud scores for risk assessment

### Frontend (React)
- Interactive dashboard for authorities
- Public verification interface
- QR code generation and scanning

## 🔐 Security & Privacy Considerations

- **Immutability**: Once recorded on blockchain, data cannot be altered
- **Decentralization**: IPFS ensures no single point of failure
- **Transparency**: All transactions are publicly verifiable
- **Privacy**: Full transaction details stored on IPFS with blockchain hash proof
- **Authentication**: MetaMask integration for user verification

## License
MIT

##  Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port already in use** | Change port in relevant .env file or kill existing process |
| **MetaMask connection fails** | Ensure MetaMask is installed and localhost:8545 is added as custom network |
| **IPFS connection error** | Check if IPFS daemon is running (ipfs daemon in terminal) |
| **Smart contract deployment fails** | Verify Ganache/Hardhat is running on port 8545 |
| **AI service errors** | Check Python version (3.8+) and reinstall requirements |

##  Additional Resources

- **Hardhat Documentation**: https://hardhat.org/docs
- **IPFS Documentation**: https://docs.ipfs.io/
- **Ethereum Development**: https://ethereum.org/developers
- **React Documentation**: https://react.dev/
- **Scikit-learn ML**: https://scikit-learn.org/

##  Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request with clear description

##  FAQ

**Q: Can I use this on mainnet?**
A: This is a demonstration project. For mainnet deployment, additional security audits are required.

**Q: How accurate is the fraud detection?**
A: Current model achieves ~95% accuracy on training data. Accuracy improves with more historical data.

**Q: Is the system scalable?**
A: Yes, the microservices architecture allows independent scaling of components.

**Q: What happens if IPFS goes down?**
A: Blockchain records are immutable. Data can be retrieved from local cache or alternate IPFS nodes.

---

**Questions or Issues?** Open an issue on GitHub or contact the development team.

**Last Updated**: January 2026
