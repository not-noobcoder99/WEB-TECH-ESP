# Integration Guide - PFA ESE (AI) Models into CardioSentinel-MERN

This guide explains how to integrate the trained ML models from the PFA ESE assignments into the CardioSentinel-MERN project.

## Overview

The **PFA ESE** (Programming for AI - Emerging Software Engineer) assignments contain:
- Assignment 1: Data exploration and preprocessing
- Assignment 2: Model training and evaluation

These need to be integrated into the CardioSentinel AI microservice.

## Step 1: Extract Trained Models

### From Assignment 2

The assignment 2 contains the trained model(s). Extract:

1. **Trained Model File**
   - Location: `PFA ESE/assignment2/outputs/` or `src/`
   - Look for: `*.pkl`, `*.joblib`, `model.pkl`, `heart_model.pkl`
   - Copy to: `CardioSentinel-MERN/ai-service/model/cardiac_model.pkl`

2. **Feature Scaler**
   - Look for: `scaler.pkl`, `StandardScaler.pkl`, or similar
   - Copy to: `CardioSentinel-MERN/ai-service/model/scaler.pkl`

3. **Feature Columns**
   - May be defined in code (models.py, preprocessing.py)
   - Should be: `['cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']`
   - Note: Some datasets have 13 features (with age/sex), adjust as needed

### Extract from Code

If models aren't saved as files, you need to:

```python
# From assignment 2 code
import joblib
from models import train_model, load_scaler

# Recreate and save model
model = train_model()  # or load from pickle
scaler = load_scaler()

joblib.dump(model, 'model/cardiac_model.pkl')
joblib.dump(scaler, 'model/scaler.pkl')
```

## Step 2: Create Feature Configuration

Create `CardioSentinel-MERN/ai-service/model/feature_columns.json`:

```json
{
  "features": ["cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"],
  "feature_descriptions": {
    "cp": "Chest pain type (0-3)",
    "trestbps": "Resting blood pressure",
    ...
  }
}
```

## Step 3: Update Flask App

The Flask app (`ai-service/app.py`) is already configured to:

1. Load models from pickle files
2. Accept prediction requests
3. Return risk scores and confidence

### Validate Model Compatibility

Ensure your model supports:

```python
model.predict(features)           # Binary prediction [0, 1]
model.predict_proba(features)     # Probability [prob_0, prob_1]
```

If not, modify `ai-service/app.py` line ~200:

```python
# Adjust based on your model API
prediction = model.predict(scaled_features)[0]
probabilities = model.predict_proba(scaled_features)[0]
risk_score = float(probabilities[1])
```

## Step 4: Configure Environment

### In `ai-service/.env`:

```
FLASK_PORT=8000
FLASK_ENV=development
MODEL_PATH=model/cardiac_model.pkl
SCALER_PATH=model/scaler.pkl
FEATURE_CONFIG=model/feature_columns.json
```

### In `backend/.env`:

```
AI_SERVICE_URL=http://localhost:8000
```

## Step 5: Test the Integration

### 1. Start AI Service
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Should see:
```
✅ Model loaded: model/cardiac_model.pkl
✅ Scaler loaded: model/scaler.pkl
✅ Feature config loaded: model/feature_columns.json
```

### 2. Test Prediction Endpoint

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "cp": 3,
    "trestbps": 140,
    "chol": 250,
    "fbs": 1,
    "restecg": 1,
    "thalach": 150,
    "exang": 1,
    "oldpeak": 2.5,
    "slope": 2,
    "ca": 0,
    "thal": 2
  }'
```

Expected response:
```json
{
  "riskScore": 0.75,
  "riskLevel": "high",
  "prediction": 1,
  "confidence": 0.85,
  "timestamp": "2024-05-08T10:30:00Z"
}
```

### 3. Start Backend
```bash
cd backend
npm install
npm run dev
```

### 4. Test from Backend

```bash
curl -X POST http://localhost:5000/api/predictions/predict \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{...features...}'
```

## Step 6: Integrate with Telemetry

The backend is already configured to:

1. Receive telemetry data via `POST /api/telemetry`
2. Call AI service automatically
3. Store prediction in telemetry record
4. Create alert if risk is high

See `backend/controllers/telemetryController.js` (when implemented).

## Expected Feature Set

The 13 UCI Heart Disease features:

| Feature | Type | Range | Description |
|---------|------|-------|-------------|
| cp | Numeric | 0-3 | Chest pain type |
| trestbps | Numeric | 90-200 | Resting blood pressure |
| chol | Numeric | 0-600 | Serum cholesterol |
| fbs | Binary | 0-1 | Fasting blood sugar > 120 |
| restecg | Numeric | 0-2 | Resting ECG |
| thalach | Numeric | 60-220 | Max heart rate achieved |
| exang | Binary | 0-1 | Exercise induced angina |
| oldpeak | Numeric | 0-10 | ST depression |
| slope | Numeric | 0-2 | ST segment slope |
| ca | Numeric | 0-4 | Number of major vessels |
| thal | Numeric | 0-3 | Thalassemia type |

## Model Performance Expectations

Based on UCI Heart Disease dataset:

- **Accuracy**: 85-90%
- **AUC-ROC**: 0.88-0.95
- **Sensitivity**: 85%+
- **Specificity**: 80%+

## Troubleshooting

### Model Not Loading

```
❌ Error loading model: No such file or directory
```

**Solution**: Ensure model files exist at specified paths:
```bash
ls -la ai-service/model/
# Should show: cardiac_model.pkl, scaler.pkl, feature_columns.json
```

### Prediction Errors

```
Error: Missing required feature: cp
```

**Solution**: Ensure all 11-13 features are in request body.

### Wrong Risk Scores

**Solution**: Check that features are scaled correctly:
- Verify scaler matches training scaler
- Verify feature order matches training
- Check data types (all numeric)

## Integration with Frontend

The React frontend:

1. Collects telemetry data via `TelemetryForm.jsx`
2. Sends to backend `POST /api/telemetry`
3. Backend calls AI service
4. Risk score returned in response
5. Frontend displays on Patient Detail page as `RiskGauge.jsx`

## Next Steps

1. ✅ Extract trained models from PFA ESE assignments
2. ✅ Place in `ai-service/model/`
3. ✅ Test Flask endpoint
4. ✅ Test backend integration
5. ✅ Test frontend display
6. ✅ Deploy all three services

## References

- [PFA ESE Assignment 2 Code](../../PFA%20ESE/assignment2/)
- [AI Service Documentation](../ai-service/README.md)
- [Backend Prediction Controller](../backend/controllers/predictionController.js)
- [UCI Heart Disease Dataset](https://archive.ics.uci.edu/ml/datasets/Heart+Disease)

---

**Status**: Integration guide complete  
**Last Updated**: May 8, 2024
