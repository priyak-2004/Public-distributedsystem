from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from model import FraudDetector
import uvicorn
import os
from contextlib import asynccontextmanager

detector = FraudDetector()

# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load model
    detector.load()
    yield
    # Shutdown: Cleanup if needed

# Create app with lifespan
app = FastAPI(title="PDS AI Fraud Detection Service", lifespan=lifespan)

class TransactionRequest(BaseModel):
    beneficiary_id: str
    shop_id: str
    quantity: float
    time_gap_hours: float
    monthly_total: float
    shop_frequency: int
    region_risk: float # 0.0 to 1.0

class FraudResponse(BaseModel):
    fraud_score: float
    risk_level: str
    reasons: list[str]
    status: str

@app.get("/")
def read_root():
    return {"status": "AI Service Running", "model_trained": detector.is_trained}

@app.post("/predict-fraud", response_model=FraudResponse)
def predict_fraud(transaction: TransactionRequest):
    try:
        data = transaction.model_dump()
        score, risk, reasons = detector.predict(data)
        
        return {
            "fraud_score": score,
            "risk_level": risk,
            "reasons": reasons,
            "status": "PROCESSED"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/batch-analyze")
def batch_analyze(transactions: list[TransactionRequest]):
    results = []
    for tx in transactions:
        data = tx.model_dump()
        score, risk, reasons = detector.predict(data)
        results.append({"fraud_score": score, "risk_level": risk, "reasons": reasons})
    return {"results": results}

@app.get("/model-health")
def model_health():
    return {
        "status": "healthy",
        "model_type": "IsolationForest",
        "trained": detector.is_trained
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
