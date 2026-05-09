# CardioSentinel Remote - Flask AI Service

Python Flask microservice for cardiac risk prediction using trained ML models.

## Overview

- **Framework**: Flask
- **ML**: scikit-learn models
- **Serialization**: Pickle (joblib)
- **Input**: Clinical features (13 features from UCI Heart Disease Dataset)
- **Output**: Risk score, prediction, risk level, confidence

## Project Structure

```
ai-service/
├── model/
│   ├── cardiac_model.pkl      # Trained model (sklearn/xgboost)
│   ├── scaler.pkl              # StandardScaler for feature normalization
│   └── feature_columns.json    # Feature order and metadata
├── app.py                      # Flask application
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Container configuration
├── .env.example               # Environment variables
└── README.md
```

## Installation

1. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Create `.env` file**:
   ```bash
   cp .env.example .env
   ```

4. **Place trained model files** in `model/` directory:
   - `cardiac_model.pkl` - Your trained model
   - `scaler.pkl` - Feature scaler
   - `feature_columns.json` - Feature metadata

## Running the Service

### Development
```bash
python app.py
```

Service runs on `http://localhost:8000`

### Production
```bash
gunicorn --bind 0.0.0.0:8000 app:app
```

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "OK",
  "service": "CardioSentinel AI Service"
}
```

### Prediction Endpoint
```
POST /predict
Content-Type: application/json
```

Request Body (all 13 features):
```json
{
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
}
```

Response:
```json
{
  "riskScore": 0.75,
  "riskLevel": "high",
  "prediction": 1,
  "confidence": 0.85,
  "timestamp": "2024-05-08T10:30:00Z"
}
```

## Input Features

All 13 features from UCI Heart Disease Dataset:

1. **cp** (Chest Pain Type): 0-3
2. **trestbps** (Resting Blood Pressure): mmHg
3. **chol** (Cholesterol): mg/dl
4. **fbs** (Fasting Blood Sugar): 0 or 1
5. **restecg** (Resting ECG): 0-2
6. **thalach** (Max Heart Rate Achieved): bpm
7. **exang** (Exercise Induced Angina): 0 or 1
8. **oldpeak** (ST Depression): value
9. **slope** (Slope of ST Segment): 0-2
10. **ca** (Number of Major Vessels): 0-4
11. **thal** (Thalassemia Type): 0-3
12. **sex** (Gender): 0=Female, 1=Male
13. **age** (Age): years

## Output

```json
{
  "riskScore": 0.0-1.0,           // Probability of heart disease
  "riskLevel": "low|moderate|high", // Categorical risk
  "prediction": 0 or 1,            // Binary classification
  "confidence": 0.0-1.0,           // Model confidence
  "timestamp": "ISO8601"           // When prediction was made
}
```

### Risk Level Mapping
- **Low**: riskScore < 0.4
- **Moderate**: 0.4 <= riskScore < 0.7
- **High**: riskScore >= 0.7

## Model Details

### Training Data
- **Dataset**: UCI Heart Disease Dataset
- **Samples**: ~300 patients
- **Features**: 13 clinical features
- **Target**: Binary (0=No disease, 1=Disease present)

### Model Performance
- Expected accuracy: 85-90%
- Expected AUC-ROC: 0.90+
- Expected sensitivity: 85%+
- Expected specificity: 80%+

### Models Supported
- scikit-learn: LogisticRegression, RandomForest, GradientBoosting, XGBoost
- Any model compatible with joblib/pickle

## Dockerfile

Included `Dockerfile` for containerized deployment:

```bash
docker build -t cardiosentinel-ai:latest .
docker run -p 8000:8000 cardiosentinel-ai:latest
```

## Integration with Backend

Backend makes requests to this service:

```javascript
// Node.js/Express example
const response = await axios.post('http://localhost:8000/predict', {
  cp: 3,
  trestbps: 140,
  chol: 250,
  // ... other features
});
```

## Error Handling

All errors return appropriate status codes:

- `200` - Success
- `400` - Bad Request (missing/invalid features)
- `422` - Unprocessable Entity (validation error)
- `500` - Server Error

Error Response:
```json
{
  "error": "Missing required feature: cp",
  "status": 400
}
```

## Environment Variables

In `.env`:
```
FLASK_PORT=8000
FLASK_ENV=development
MODEL_PATH=model/cardiac_model.pkl
SCALER_PATH=model/scaler.pkl
FEATURE_CONFIG=model/feature_columns.json
```

## Dependencies

See `requirements.txt`. Key packages:

- flask==2.3.0
- flask-cors==4.0.0
- scikit-learn==1.3.0
- pandas==2.0.0
- numpy==1.24.0
- joblib==1.3.0

## Deployment

### To Render

1. Create account at [render.com](https://render.com)
2. Connect GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `gunicorn --bind 0.0.0.0:8000 app:app`
5. Add environment variables
6. Deploy!

### To Railway

1. Create account at [railway.app](https://railway.app)
2. Connect GitHub repo
3. Railway auto-detects Flask app
4. Add environment variables
5. Deploy!

## Testing

Sample curl requests:

```bash
# Health check
curl http://localhost:8000/health

# Prediction
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

## Development Notes

- Keep model files lightweight (< 50MB)
- Use joblib for better pickle serialization
- Log all predictions for audit
- Add request validation
- Implement rate limiting in production
- Add CORS headers for frontend access

## References

- [Flask Documentation](https://flask.palletsprojects.com)
- [scikit-learn Model Persistence](https://scikit-learn.org/stable/modules/model_persistence.html)
- [UCI Heart Disease Dataset](https://archive.ics.uci.edu/ml/datasets/Heart+Disease)
