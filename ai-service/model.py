import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
import os
from datetime import datetime
import json

MODEL_PATH = "fraud_model.pkl"

class FraudDetector:
    def __init__(self):
        self.model = None
        self.feature_columns = ['quantity', 'time_gap_hours', 'monthly_total', 'shop_frequency', 'region_risk']
        self.is_trained = False

    def generate_synthetic_data(self, n=500):
        """Generate synthetic ration usage data to train the model locally."""
        np.random.seed(42)
        
        # 25% fraud records
        n_fraud = int(n * 0.25)
        n_normal = n - n_fraud
        
        # Legit samples:
        # User defined ranges: Q(3-12), F(1-4), RR(0-1), TG_Factor(0.5-2)
        data_normal = {
            'quantity': np.random.uniform(3, 12, n_normal),
            'time_gap_hours': np.random.uniform(0.5, 2.0, n_normal) * 720, # Converted to hours
            'monthly_total': np.random.uniform(3, 12, n_normal),
            'shop_frequency': np.random.uniform(1, 4, n_normal),
            'region_risk': np.random.uniform(0, 1, n_normal)
        }
        
        # Fraud samples:
        # User defined ranges: Q(12-30), F(4-10), RR(1.2-3), TG_Factor(0.1-0.5)
        data_fraud = {
            'quantity': np.random.uniform(12, 30, n_fraud),
            'time_gap_hours': np.random.uniform(0.1, 0.5, n_fraud) * 720,
            'monthly_total': np.random.uniform(30, 100, n_fraud),
            'shop_frequency': np.random.uniform(4, 10, n_fraud),
            'region_risk': np.random.uniform(1.2, 3, n_fraud)
        }
        
        df_normal = pd.DataFrame(data_normal)
        df_fraud = pd.DataFrame(data_fraud)
        
        df = pd.concat([df_normal, df_fraud], ignore_index=True)
        
        # Store min/max for normalization later
        self.min_train_score = -0.5 # Approximate default for IF
        self.max_train_score = 0.5
        
        return df

    def train(self):
        print("GENERATING SYNTHETIC DATA...")
        df = self.generate_synthetic_data()
        
        print("TRAINING ISOLATION FOREST MODEL...")
        self.model = IsolationForest(n_estimators=100, contamination=0.25, random_state=42)
        self.model.fit(df[self.feature_columns])
        
        # Calibrate min/max scores from training data
        scores = self.model.decision_function(df[self.feature_columns])
        self.min_train_score = scores.min()
        self.max_train_score = scores.max()
        
        self.model.min_score_ = self.min_train_score
        self.model.max_score_ = self.max_train_score
        
        joblib.dump(self.model, MODEL_PATH)
        self.is_trained = True
        print(f"MODEL SAVED TO {MODEL_PATH}")

    def load(self):
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)
            self.is_trained = True
            # Load stored callibration if exists, else defaults
            self.min_train_score = getattr(self.model, 'min_score_', -0.5)
            self.max_train_score = getattr(self.model, 'max_score_', 0.5)
        else:
            self.train()

    def predict(self, data):
        """
        data: dict containing feature values
        Returns: fraud_score (0-1), risk_level
        """
        if not self.is_trained:
            self.load()

        # 1. Prepare Input
        input_df = pd.DataFrame([data])
        
        # Ensure columns match
        for col in self.feature_columns:
            if col not in input_df.columns:
                input_df[col] = 0 # Default if missing
                
        # 2. Base Model Prediction (Isolation Forest)
        # Decision function: positive for inliers (normal), negative for outliers (fraud)
        raw_score = self.model.decision_function(input_df[self.feature_columns])[0]
        
        # 3. Normalize Score to 0-1 Probability of Fraud
        # High raw_score = Normal. Low raw_score = Fraud.
        range_span = self.max_train_score - self.min_train_score
        if range_span == 0: range_span = 1
        
        # Normalize to 0-1 (0=min/fraud, 1=max/normal)
        norm_score = (raw_score - self.min_train_score) / range_span
        norm_score = np.clip(norm_score, 0, 1)
        
        # Invert: score 1 (normal) -> risk 0. score 0 (fraud) -> risk 1
        fraud_score = 1.0 - norm_score
        
        # 4. Apply Rule-Based Boosting
        # +0.08 if quantity >= 10
        if data.get('quantity', 0) >= 10:
            fraud_score += 0.08
            
        # +0.12 if frequency >= 3
        if data.get('shop_frequency', 0) >= 3:
            fraud_score += 0.12
            
        # +0.10 if region_risk >= 1
        if data.get('region_risk', 0) >= 1:
            fraud_score += 0.10
            
        # Beneficiary History Weighting: +0.03 per previous transaction (max +0.15)
        history_count = data.get('history_count', 0)
        fraud_score += min(history_count * 0.03, 0.15)
        
        # 5. Add Random Noise (±5%)
        # "Similar transactions do NOT always produce identical fraud scores"
        noise = np.random.uniform(-0.05, 0.05)
        fraud_score += noise
        
        # 6. Clip final score
        fraud_score = np.clip(fraud_score, 0, 1)

        # 7. Determine Risk Level (New Mapping)
        # < 0.4 -> LOW, 0.4–0.7 -> MEDIUM, > 0.7 -> HIGH
        if fraud_score > 0.7:
            risk_level = "HIGH"
        elif fraud_score >= 0.4:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
            
        return fraud_score, risk_level
