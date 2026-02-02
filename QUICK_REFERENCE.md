# EventChain - Quick Reference Card

## 🚀 Quick Start

```bash
# 1. Start Ganache
# Open Ganache → Quickstart

# 2. Deploy Contract
deploy-contract-auto.bat

# 3. Start Application
start.bat

# 4. Access
# Frontend: http://localhost:3000
# Backend: http://localhost:8081
```

---

## 📋 Configuration

### Backend (`application.properties`)
```properties
server.port=8081
blockchain.network.url=http://127.0.0.1:7545
blockchain.contract.address=0xYourAddress
blockchain.private.key=0xYourKey
blockchain.gas.limit=3000000
ipfs.host=127.0.0.1
ipfs.port=5001
```

### Frontend (`.env`)
```env
REACT_APP_API_URL=http://localhost:8081
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/events` | Create event |
| GET | `/events` | Get all events |
| GET | `/events/{id}` | Get event by index |
| GET | `/events/verify/{hash}` | Verify hash |

---

## 📝 API Examples

### Create Event
```bash
curl -X POST http://localhost:8081/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "certificate",
    "metadata": "{\"name\":\"John Doe\"}"
  }'
```

### Get All Events
```bash
curl http://localhost:8081/events
```

### Verify Hash
```bash
curl http://localhost:8081/events/verify/QmHash...
```

---

## 🛠️ Common Commands

```bash
# Backend
mvn spring-boot:run
mvn clean package

# Frontend
cd frontend
npm start
npm run build

# Contract
npm run deploy:hardhat
npx hardhat compile

# Docker
docker-compose up
docker build -t eventchain .
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Maven not found | Install Maven, add to PATH |
| Node not found | Install Node.js |
| Ganache connection | Check Ganache is running |
| Gas limit exceeded | Reduce `blockchain.gas.limit` |
| CORS error | Check `CorsConfig.java` |
| IPFS failed | Start `ipfs daemon` (optional) |

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `start.bat` | Start backend + frontend |
| `deploy-contract-auto.bat` | Deploy contract |
| `application.properties` | Backend config |
| `hardhat.config.js` | Contract deployment |
| `EventController.java` | REST API |
| `BlockchainService.java` | Blockchain ops |
| `IpfsService.java` | IPFS ops |

---

## 🔗 Important URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8081
- **Ganache**: http://127.0.0.1:7545
- **IPFS API**: http://127.0.0.1:5001

---

## 📚 Documentation

- `APPLICATION_DOCUMENTATION.md` - Complete guide
- `QUICK_TEST_SETUP.md` - Setup guide
- `DEPLOY_WITHOUT_REMIX.md` - Deployment
- `DOCKER.md` - Docker guide
- `PROJECT_JOURNEY.md` - Development history

---

## ⚡ Quick Tips

1. **Ganache**: Must be running before deployment
2. **Gas Limit**: 3M works for Ganache, adjust for other networks
3. **IPFS**: Optional - app works without it
4. **Blockchain**: Optional - app starts without config
5. **Ports**: Backend 8081, Frontend 3000, Ganache 7545

---

**For detailed information, see `APPLICATION_DOCUMENTATION.md`**
