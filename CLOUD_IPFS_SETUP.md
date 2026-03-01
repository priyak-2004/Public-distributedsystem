# Cloud IPFS Setup Guide - No Installation Required

Your system now supports **cloud-based IPFS services** without needing to install or run a local IPFS daemon!

## ✅ Supported Cloud Providers

### 1. **Web3.Storage** (⭐ RECOMMENDED - Free & Easy)
- **Storage:** 1 TB (FREE - no credit card needed)
- **Setup Time:** 1 minute
- **Installation:** None needed

**Steps:**
1. Go to https://web3.storage
2. Click "Sign up"
3. Use GitHub or email to register
4. Create new API token in settings
5. Copy the token
6. Update `.env`:
```env
IPFS_PROVIDER=web3storage
WEB3_STORAGE_TOKEN=paste_your_token_here
```

---

### 2. **Pinata** (Popular for Production)
- **Storage:** 1 GB free (then paid)
- **Setup Time:** 2 minutes
- **Installation:** None needed

**Steps:**
1. Go to https://app.pinata.cloud
2. Click "Sign up"
3. Complete email verification
4. Go to API Keys
5. Create new key pair
6. Copy API Key and Secret
7. Update `.env`:
```env
IPFS_PROVIDER=pinata
PINATA_API_KEY=your_api_key
PINATA_API_SECRET=your_secret_key
```

---

### 3. **Infura IPFS** (Fast & Reliable)
- **Setup Time:** 2 minutes
- **Installation:** None
- **Free Tier:** Limited but works

**Steps:**
1. Go to https://infura.io
2. Sign up with email
3. Create new project (select IPFS)
4. No additional config needed
7. Update `.env`:
```env
IPFS_PROVIDER=infura
```

---

### 4. **Local IPFS Daemon** (Run locally)
- **Storage:** Unlimited (your disk space)
- **Setup Time:** 5 minutes

**Steps:**
1. Download from https://dist.ipfs.tech/go-ipfs
2. Extract and add to PATH
3. Run: `ipfs init`
4. Run: `ipfs daemon`
5. Update `.env`:
```env
IPFS_PROVIDER=local
IPFS_API_URL=http://127.0.0.1:5001/api/v0
```

---

## 📋 Configuration Guide

### Current `.env` Template

```env
# IPFS Configuration - Choose your provider
# Options: 'local' (daemon on port 5001), 'web3storage', 'pinata', 'infura'
IPFS_PROVIDER=web3storage

# Web3.Storage (FREE - 1TB storage, no installation needed)
# Get token: https://web3.storage
WEB3_STORAGE_TOKEN=your_web3_storage_token_here

# Pinata (Optional alternative)
# Get keys: https://app.pinata.cloud
# PINATA_API_KEY=your_api_key_here
# PINATA_API_SECRET=your_secret_key_here

# Local/Infura IPFS settings
IPFS_API_URL=http://127.0.0.1:5001/api/v0
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs

# AI Fraud Detection Service
AI_SERVICE_URL=http://127.0.0.1:5000
```

---

## 🚀 Quick Start - Web3.Storage (Recommended)

### 1. Generate Token
```bash
Go to https://web3.storage → Sign up → Create API token
```

### 2. Add to `.env`
```env
IPFS_PROVIDER=web3storage
WEB3_STORAGE_TOKEN=eyJhbxxxxx...
```

### 3. Restart Backend
```bash
cd backend-node
npm start
```

### 4. Test Upload
```bash
curl -X POST http://localhost:4000/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "transaction",
    "metadata": {
      "beneficiaryId": "BEN123",
      "shopId": "SHOP01",
      "quantity": 5
    }
  }'
```

---

## 📊 Provider Comparison

| Feature | Web3.Storage | Pinata | Infura | Local |
|---------|-------------|--------|--------|-------|
| **Storage** | 1TB FREE | 1GB FREE | Limited | Unlimited |
| **Installation** | ❌ None | ❌ None | ❌ None | ✅ Required |
| **Speed** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Reliability** | 99.9% | 99.99% | 99.9% | Your infra |
| **Cost (Free)** | 1TB | 1GB | Limited | Free |
| **Status** | Active | Active | Active | Manual |

---

## 🔄 Fallback Mechanism

Your system automatically falls back to **mock IPFS** if:
1. Cloud provider is down
2. Invalid token/credentials
3. Network error

This ensures your app **never crashes** due to IPFS issues.

---

## ✅ How It Works

### Upload Flow:
```
1. POST /events (frontend sends data)
   ↓
2. Backend receives request
   ↓
3. Tries to upload to configured provider (web3storage, pinata, etc.)
   ↓
4. If failure → Falls back to mock IPFS
   ↓
5. Returns IPFS hash (real or mock)
   ↓
6. Hash stored on blockchain
```

### Retrieval Flow:
```
1. GET /events (request with IPFS hash)
   ↓
2. Check mock storage first
   ↓
3. Try cloud provider gateway
   ↓
4. Returns data
```

---

## 🐛 Troubleshooting

### "Invalid token" error
- Check token is copied correctly
- Ensure no extra spaces
- Verify provider name matches (case-sensitive)

### "Connection timeout"
- Check internet connection
- Provider might be down (check status page)
- Fallback to mock mode is automatic

### "No IPFS provider found"
- Ensure `IPFS_PROVIDER` is set in `.env`
- Default is mock fallback (no config needed)

---

## 💡 Recommended Setup

For **development**: Web3.Storage (free, no installation)
For **production**: Pinata (best reliability) + Local backup

---

## 🎯 Next Steps

1. **Choose a provider** (Web3.Storage recommended)
2. **Get API token** (takes 1 minute)
3. **Update `.env`** with your token
4. **Restart backend:** `npm start`
5. **Done!** Your app now uses cloud IPFS

---

Need help? Check provider docs:
- Web3.Storage: https://web3.storage/docs/
- Pinata: https://docs.pinata.cloud/
- Infura: https://docs.infura.io/infura/networks/ipfs
