# Quick Start Guide

## Prerequisites Checklist

- [ ] Java 17+ installed (`java -version`)
- [ ] Maven 3.6+ installed (`mvn -version`)
- [ ] IPFS node running (`ipfs daemon`)
- [ ] Wallet with funds for gas fees
- [ ] Smart contract deployed

## 5-Minute Setup

### Step 1: Start IPFS (Terminal 1)
```bash
ipfs daemon
```
Keep this running. You should see: `API server listening on /ip4/127.0.0.1/tcp/5001`

### Step 2: Deploy Contract
1. Go to https://remix.ethereum.org
2. Paste contract code from `contracts/EventChain.sol`
3. Compile with Solidity 0.8.19
4. Deploy to Polygon Mumbai (testnet)
5. Copy contract address

### Step 3: Configure Application
Edit `src/main/resources/application.properties`:
```properties
blockchain.contract.address=0xYourContractAddressHere
blockchain.private.key=0xYourPrivateKeyHere
```

### Step 4: Run Application
```bash
mvn spring-boot:run
```

### Step 5: Test API
```bash
curl -X POST http://localhost:8080/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "test",
    "metadata": "{\"message\":\"Hello EventChain!\"}"
  }'
```

## Troubleshooting

**IPFS not connecting?**
- Check if daemon is running: `ipfs id`
- Verify port 5001 is not in use

**Contract calls failing?**
- Verify contract address is correct
- Check wallet has MATIC for gas (testnet: https://faucet.polygon.technology/)
- Ensure you're using the correct network RPC

**Transaction pending?**
- Polygon testnet can be slow, wait 10-30 seconds
- Check transaction on PolygonScan: https://mumbai.polygonscan.com

## Next Steps

- Review `README.md` for detailed documentation
- Check `DEPLOYMENT.md` for production deployment
- Try examples in `examples/api-requests.http`

