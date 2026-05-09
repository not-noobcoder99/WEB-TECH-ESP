const Patient = require('../models/Patient');
const SelfReport = require('../models/SelfReport');
const Alert = require('../models/Alert');
const { predictCardiacRisk } = require('../utils/aiServiceClient');

const REQUIRED_FEATURES = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'];

// GET /api/patient-portal/me
const getMyProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) return res.status(404).json({ message: 'Patient record not found. Contact your clinic.' });

    const latestReport = await SelfReport.findOne({ patientId: patient._id }).sort({ createdAt: -1 });
    res.json({ patient, latestReport });
  } catch (err) { next(err); }
};

// POST /api/patient-portal/reading
const submitReading = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) return res.status(404).json({ message: 'Patient record not found' });

    const missing = REQUIRED_FEATURES.filter(f => req.body[f] === undefined || req.body[f] === '');
    if (missing.length) return res.status(400).json({ message: `Missing fields: ${missing.join(', ')}` });

    const features = Object.fromEntries(REQUIRED_FEATURES.map(f => [f, Number(req.body[f])]));

    const prediction = await predictCardiacRisk(features);

    let triggeredAlert = false;
    if (prediction.riskLevel === 'high' && !prediction.error) {
      await Alert.create({
        patientId: patient._id,
        alertType: 'urgent',
        riskScore: prediction.riskScore,
        confidence: prediction.confidence,
        riskFactors: ['High cardiac risk from patient self-report'],
        recommendation: 'Patient self-reported high-risk values. Immediate clinical review recommended.',
      });
      triggeredAlert = true;
    }

    const aiPrediction = {
      riskScore: prediction.riskScore,
      riskLevel: prediction.riskLevel,
      prediction: prediction.prediction,
      confidence: prediction.confidence,
      featureContributions: prediction.featureContributions || [],
      triggeredAlert,
    };

    const report = await SelfReport.create({ patientId: patient._id, userId: req.user.id, features, aiPrediction });

    // Update patient baseline and last risk
    if (!prediction.error) {
      await Patient.findByIdAndUpdate(patient._id, {
        ...features,
        riskLevel: prediction.riskLevel,
        lastRiskScore: prediction.riskScore,
        lastUpdated: new Date(),
      });
    }

    res.status(201).json({ report, prediction: aiPrediction });
  } catch (err) { next(err); }
};

// GET /api/patient-portal/history
const getMyHistory = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) return res.status(404).json({ message: 'Patient record not found' });

    const reports = await SelfReport.find({ patientId: patient._id }).sort({ createdAt: -1 }).limit(20);
    res.json(reports);
  } catch (err) { next(err); }
};

// GET /api/patient-portal/alerts
const getMyAlerts = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) return res.status(404).json({ message: 'Patient record not found' });

    const alerts = await Alert.find({ patientId: patient._id }).sort({ createdAt: -1 }).limit(10);
    res.json(alerts);
  } catch (err) { next(err); }
};

module.exports = { getMyProfile, submitReading, getMyHistory, getMyAlerts };
