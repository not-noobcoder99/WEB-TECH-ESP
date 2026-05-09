const Telemetry = require('../models/Telemetry');
const Patient = require('../models/Patient');
const { predictCardiacRisk } = require('../utils/aiServiceClient');

// GET /api/predictions/history/:patientId
const getPredictionHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [records, total] = await Promise.all([
      Telemetry.find({
        patientId: req.params.patientId,
        'aiPrediction.riskScore': { $exists: true }
      })
        .sort({ readingTimestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('aiPrediction readingTimestamp heartRate systolicBP diastolicBP'),
      Telemetry.countDocuments({
        patientId: req.params.patientId,
        'aiPrediction.riskScore': { $exists: true }
      })
    ]);

    const history = records.map(t => ({
      telemetryId: t._id,
      timestamp: t.readingTimestamp,
      riskScore: t.aiPrediction.riskScore,
      riskLevel: t.aiPrediction.riskLevel,
      prediction: t.aiPrediction.prediction,
      confidence: t.aiPrediction.confidence,
      triggeredAlert: t.aiPrediction.triggeredAlert,
      vitals: { heartRate: t.heartRate, systolicBP: t.systolicBP, diastolicBP: t.diastolicBP }
    }));

    res.json({ history, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
};

// POST /api/predictions/manual  (on-demand prediction for a patient without creating telemetry)
const manualPredict = async (req, res, next) => {
  try {
    const { patientId } = req.body;
    if (!patientId) return res.status(400).json({ message: 'patientId is required' });

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const features = {
      age: patient.age, sex: patient.sex, cp: patient.cp,
      trestbps: patient.trestbps, chol: patient.chol, fbs: patient.fbs,
      restecg: patient.restecg, thalach: patient.thalach, exang: patient.exang,
      oldpeak: patient.oldpeak, slope: patient.slope, ca: patient.ca, thal: patient.thal
    };

    const missing = Object.entries(features).filter(([, v]) => v === undefined || v === null).map(([k]) => k);
    if (missing.length > 0) {
      return res.status(422).json({ message: `Patient is missing baseline features: ${missing.join(', ')}` });
    }

    const prediction = await predictCardiacRisk(features);
    res.json({ patientId: patient._id, patientName: patient.name, ...prediction });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPredictionHistory, manualPredict };
