from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from model import FraudDetector
import uvicorn
import os

app = FastAPI(title="PDS AI Fraud Detection Service")
detector = FraudDetector()

# Load model on startup
@app.on_event("startup")
async def startup_event():
    detector.load()

class TransactionRequest(BaseModel):
    quantity: float
    time_gap_hours: float
    monthly_total: float
    shop_frequency: int
    region_risk: int # 0=Low, 1=Med, 2=High

class FraudResponse(BaseModel):
    fraud_score: float
    risk_level: str
    status: str

@app.get("/")
def read_root():
    return {"status": "AI Service Running", "model_trained": detector.is_trained}

@app.post("/predict-fraud", response_model=FraudResponse)
def predict_fraud(transaction: TransactionRequest):
    try:
        data = transaction.dict()
        score, risk = detector.predict(data)
        
        return {
            "fraud_score": score,
            "risk_level": risk,
            "status": "PROCESSED"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/batch-analyze")
def batch_analyze(transactions: list[TransactionRequest]):
    results = []
    for tx in transactions:
        data = tx.dict()
        score, risk = detector.predict(data)
        results.append({"fraud_score": score, "risk_level": risk})
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
