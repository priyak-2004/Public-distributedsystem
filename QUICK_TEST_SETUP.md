# Quick Test Setup - No Real Crypto Needed! 🎓

Follow these simple steps to get EventChain working with a local test blockchain.

## 🚀 5-Minute Setup

### Step 1: Install Ganache (2 minutes)

1. Download: https://trufflesuite.com/ganache/
2. Install and open Ganache
3. Click **"Quickstart"** button
4. Ganache is now running! ✅

**You now have:**
- 10 test accounts with 100 fake ETH each
- Local blockchain at `http://127.0.0.1:7545`
- No real money involved!

### Step 2: Deploy Contract (3 minutes)

**Option A: Using Hardhat (Recommended - No Browser Needed!)**

```bash
# 1. Install dependencies
npm install

# 2. Edit hardhat.config.js - add your Ganache private key to accounts array

# 3. Deploy
npm run deploy:hardhat
```

**Option B: Using Remix IDE (Browser-based)**

1. Go to https://remix.ethereum.org
2. Create file: `contracts/EventChain.sol`
3. Copy content from `contracts/EventChain.sol` in this project
4. **Compile** (Solidity 0.8.19)
5. Go to **"Deploy & Run Transactions"**
6. Select **"Web3 Provider"**
7. Enter: `http://127.0.0.1:7545`
8. Click **"Deploy"**
9. **Copy the contract address** (starts with 0x...)

**See `DEPLOY_WITHOUT_REMIX.md` for more deployment options!**

### Step 3: Configure Application (1 minute)

1. Open `src/main/resources/application.properties`
2. Update these lines:

```properties
blockchain.network.url=http://127.0.0.1:7545
blockchain.contract.address=PASTE_CONTRACT_ADDRESS_HERE
blockchain.private.key=PASTE_PRIVATE_KEY_FROM_GANACHE
```

**To get private key from Ganache:**
- Click the key icon 🔑 next to any account
- Copy the private key (without 0x)

### Step 4: Connect MetaMask to Ganache

1. Open MetaMask
2. Click network dropdown → **"Add Network"**
3. Enter:
   - **Network Name:** Ganache Local
   - **RPC URL:** http://127.0.0.1:7545
   - **Chain ID:** 1337
   - **Currency Symbol:** ETH
4. Click **"Save"**
5. Import a Ganache account:
   - Click account icon → **"Import Account"**
   - Paste a private key from Ganache
   - You now have 100 fake ETH! 🎉

### Step 5: Run the Application

```bash
# Terminal 1: Start backend
mvn spring-boot:run

# Terminal 2: Start frontend
cd frontend
npm start
```

## ✅ You're Done!

Now you can:
- ✅ Create events (uses fake ETH)
- ✅ View timeline
- ✅ Verify events
- ✅ Everything works, no real money!

## 🎯 Test Accounts

Ganache provides 10 accounts. Use:
- **1 account** for backend (in application.properties)
- **1 account** for frontend (import to MetaMask)
- Both have 100 fake ETH - perfect for testing!

## 🔧 Troubleshooting

**"Connection refused" error:**
- Make sure Ganache is running
- Check RPC URL is `http://127.0.0.1:7545`

**"Contract not found" error:**
- Verify contract address is correct
- Make sure you deployed to Ganache network

**MetaMask not connecting:**
- Ensure you're on "Ganache Local" network
- Check Chain ID is 1337

## 📚 What You Get

- **Local blockchain** - runs on your computer
- **Fake ETH** - unlimited test tokens
- **Instant transactions** - no waiting
- **Safe testing** - no real money at risk
- **Full functionality** - all features work!

Perfect for learning and development! 🚀
