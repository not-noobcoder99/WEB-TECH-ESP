# CardioSentinel Remote - Flask AI Service
# Cardiac Risk Prediction Microservice

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import numpy as np
import joblib
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# =====================
# MODEL LOADING
# =====================

PIPELINE_PATH = os.getenv('MODEL_PATH', 'model/cardiac_pipeline.joblib')
FEATURE_CONFIG_PATH = os.getenv('FEATURE_CONFIG', 'model/feature_columns.json')

pipeline = None
feature_columns = None
required_features = None
model_loaded = False

def load_model():
    global pipeline, feature_columns, required_features, model_loaded

    try:
        if os.path.exists(PIPELINE_PATH):
            pipeline = joblib.load(PIPELINE_PATH)
            print(f"Pipeline loaded: {PIPELINE_PATH}")
        else:
            print(f"Pipeline not found: {PIPELINE_PATH}")

        if os.path.exists(FEATURE_CONFIG_PATH):
            with open(FEATURE_CONFIG_PATH, 'r') as f:
                feature_columns = json.load(f)
            required_features = feature_columns['features']
            print(f"Feature config loaded: {len(required_features)} features")
        else:
            print(f"Feature config not found: {FEATURE_CONFIG_PATH}")

        model_loaded = (pipeline is not None and required_features is not None)

        if not model_loaded:
            print("Warning: Model not fully loaded.")
            print(f"  Pipeline: {os.path.exists(PIPELINE_PATH)}")
            print(f"  Features: {os.path.exists(FEATURE_CONFIG_PATH)}")

    except Exception as e:
        print(f"Error loading model: {str(e)}")
        model_loaded = False


# =====================
# API ENDPOINTS
# =====================

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'service': 'CardioSentinel AI Service',
        'version': '2.0',
        'status': 'running',
        'model_loaded': model_loaded,
        'endpoints': {
            'GET  /health': 'Service health check',
            'POST /predict': 'Cardiac risk prediction (13 features)',
            'GET  /model-info': 'Model metadata and feature descriptions'
        }
    }), 200


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'OK',
        'service': 'CardioSentinel AI Service',
        'model_loaded': model_loaded,
        'features_count': len(required_features) if required_features else 0,
        'timestamp': datetime.utcnow().isoformat()
    }), 200


@app.route('/predict', methods=['POST'])
def predict():
    """
    Cardiac risk prediction endpoint.

    Expects JSON body with 13 features:
      age, sex, cp, trestbps, chol, fbs, restecg,
      thalach, exang, oldpeak, slope, ca, thal
    """
    try:
        if not model_loaded:
            return jsonify({'error': 'Model not loaded. Check server logs.'}), 500

        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        # Validate all required features are present
        missing = [f for f in required_features if f not in data]
        if missing:
            return jsonify({'error': f'Missing required features: {", ".join(missing)}'}), 400

        # Build ordered feature values as a DataFrame (pipeline expects DataFrame input)
        try:
            feature_values = {f: float(data[f]) for f in required_features}
        except (ValueError, TypeError) as e:
            return jsonify({'error': f'Invalid feature value: {str(e)}'}), 400

        X = pd.DataFrame([feature_values])

        # Pipeline handles preprocessing (StandardScaler) + prediction
        prediction = pipeline.predict(X)[0]
        probabilities = pipeline.predict_proba(X)[0]
        risk_score = float(probabilities[1])  # probability of heart disease

        if risk_score < 0.4:
            risk_level = 'low'
        elif risk_score < 0.7:
            risk_level = 'moderate'
        else:
            risk_level = 'high'

        confidence = float(max(risk_score, 1 - risk_score))

        # Feature contributions (explainability)
        feature_contributions = []
        FEATURE_LABELS = {
            'age': 'Age', 'sex': 'Sex', 'cp': 'Chest Pain Type',
            'trestbps': 'Resting BP', 'chol': 'Cholesterol',
            'fbs': 'Fasting Blood Sugar', 'restecg': 'Resting ECG',
            'thalach': 'Max Heart Rate', 'exang': 'Exercise Angina',
            'oldpeak': 'ST Depression', 'slope': 'ST Slope',
            'ca': 'Major Vessels', 'thal': 'Thalassemia'
        }
        try:
            scaler_step = None
            model_step = None
            for name, step in pipeline.named_steps.items():
                if hasattr(step, 'mean_') and hasattr(step, 'scale_'):
                    scaler_step = step
                elif hasattr(step, 'coef_'):
                    model_step = step
            if scaler_step and model_step and hasattr(model_step, 'coef_'):
                coefs = model_step.coef_[0]
                means = np.array(scaler_step.mean_)
                scales = np.array(scaler_step.scale_)
                contribs = []
                for i, feat in enumerate(required_features):
                    raw_val = feature_values[feat]
                    std_val = (raw_val - float(means[i])) / float(scales[i])
                    contribution = float(coefs[i]) * std_val
                    contribs.append({
                        'feature': feat,
                        'label': FEATURE_LABELS.get(feat, feat),
                        'contribution': round(contribution, 4),
                        'rawValue': raw_val
                    })
                contribs.sort(key=lambda x: abs(x['contribution']), reverse=True)
                feature_contributions = contribs[:5]
        except Exception as ex:
            print(f'Explainability error: {ex}')

        return jsonify({
            'riskScore': round(risk_score, 4),
            'riskLevel': risk_level,
            'prediction': int(prediction),
            'confidence': round(confidence, 4),
            'featureContributions': feature_contributions,
            'timestamp': datetime.utcnow().isoformat()
        }), 200

    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500


@app.route('/model-info', methods=['GET'])
def model_info():
    return jsonify({
        'model_loaded': model_loaded,
        'model_type': type(pipeline.named_steps['model']).__name__ if (model_loaded and pipeline) else None,
        'features': required_features,
        'feature_count': len(required_features) if required_features else 0,
        'feature_descriptions': feature_columns.get('feature_descriptions', {}) if feature_columns else {},
        'model_version': feature_columns.get('model_version', 'unknown') if feature_columns else 'unknown',
        'accuracy': feature_columns.get('accuracy') if feature_columns else None,
        'roc_auc': feature_columns.get('roc_auc') if feature_columns else None,
        'timestamp': datetime.utcnow().isoformat()
    }), 200


# =====================
# ERROR HANDLERS
# =====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


# =====================
# STARTUP
# =====================

if __name__ == '__main__':
    print("\nCardioSentinel AI Service Starting...\n")
    load_model()
    port = int(os.getenv('FLASK_PORT', 8000))
    env = os.getenv('FLASK_ENV', 'development')
    print(f"Running on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=(env == 'development'))
