const Telemetry = require('../models/Telemetry');
const Patient = require('../models/Patient');
const Alert = require('../models/Alert');
const { predictCardiacRisk } = require('../utils/aiServiceClient');

// Build AI feature object from patient baseline + current vitals
const buildFeatures = (patient, vitals) => ({
  age: patient.age,
  sex: patient.sex,
  cp: patient.cp,
  trestbps: vitals.systolicBP ?? patient.trestbps,
  chol: patient.chol,
  fbs: patient.fbs,
  restecg: patient.restecg,
  thalach: vitals.heartRate ?? patient.thalach,
  exang: patient.exang,
  oldpeak: patient.oldpeak,
  slope: patient.slope,
  ca: patient.ca,
  thal: patient.thal
});

// POST /api/telemetry
const createTelemetry = async (req, res, next) => {
  try {
    const {
      patientId, heartRate, systolicBP, diastolicBP,
      respirationRate, oxygenSaturation, temperature,
      signalQuality, deviceType, readingTimestamp
    } = req.body;

    if (!patientId || heartRate === undefined || systolicBP === undefined || diastolicBP === undefined) {
      return res.status(400).json({ message: 'patientId, heartRate, systolicBP, and diastolicBP are required' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    // Create the telemetry record first
    const telemetry = await Telemetry.create({
      patientId, heartRate, systolicBP, diastolicBP,
      respirationRate, oxygenSaturation, temperature,
      signalQuality, deviceType,
      readingTimestamp: readingTimestamp ? new Date(readingTimestamp) : new Date()
    });

    // Run AI prediction if patient has enough baseline features
    const features = buildFeatures(patient, { systolicBP, heartRate });
    const hasAllFeatures = Object.values(features).every(v => v !== undefined && v !== null);

    let aiPrediction = null;
    let alertCreated = false;

    if (hasAllFeatures) {
      const prediction = await predictCardiacRisk(features);

      aiPrediction = {
        riskScore: prediction.riskScore,
        riskLevel: prediction.riskLevel,
        prediction: prediction.prediction,
        confidence: prediction.confidence,
        triggeredAlert: false
      };

      // Auto-alert on high risk
      if (prediction.riskLevel === 'high' && !prediction.error) {
        const newAlert = await Alert.create({
          patientId,
          telemetryId: telemetry._id,
          alertType: 'urgent',
          riskScore: prediction.riskScore,
          confidence: prediction.confidence,
          riskFactors: ['High cardiac risk score from AI model'],
          recommendation: 'Immediate clinical review required. Risk score >= 0.7.'
        });
        aiPrediction.triggeredAlert = true;
        alertCreated = true;

        // Push real-time alert to all connected clients
        const io = req.app.get('io');
        if (io) {
          io.emit('new-alert', {
            _id: newAlert._id,
            patientId: { _id: patientId, name: patient.name, patientId: patient.patientId },
            alertType: 'urgent',
            riskScore: prediction.riskScore,
            createdAt: newAlert.createdAt,
          });
        }
      }

      await Telemetry.findByIdAndUpdate(telemetry._id, { aiPrediction });

      // Only update patient risk when the AI service returned a real prediction
      if (!prediction.error) {
        await Patient.findByIdAndUpdate(patientId, {
          riskLevel: prediction.riskLevel,
          lastRiskScore: prediction.riskScore,
          lastUpdated: new Date()
        });
      }

      // Include featureContributions in response (not stored in DB)
      aiPrediction.featureContributions = prediction.featureContributions || [];
    }

    // Return complete record — expose aiPrediction at top level so frontend can access featureContributions
    const saved = await Telemetry.findById(telemetry._id);
    res.status(201).json({ telemetry: saved, aiPrediction, alertCreated });
  } catch (err) {
    next(err);
  }
};

// GET /api/patients/:patientId/telemetry
const getPatientTelemetry = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, from, to } = req.query;
    const filter = { patientId: req.params.patientId };
    if (from || to) {
      filter.readingTimestamp = {};
      if (from) filter.readingTimestamp.$gte = new Date(from);
      if (to) filter.readingTimestamp.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [records, total] = await Promise.all([
      Telemetry.find(filter).sort({ readingTimestamp: -1 }).skip(skip).limit(parseInt(limit)),
      Telemetry.countDocuments(filter)
    ]);

    res.json({ records, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
};

// GET /api/patients/:patientId/telemetry/latest
const getLatestTelemetry = async (req, res, next) => {
  try {
    const record = await Telemetry.findOne({ patientId: req.params.patientId }).sort({ readingTimestamp: -1 });
    if (!record) return res.status(404).json({ message: 'No telemetry records found' });
    res.json(record);
  } catch (err) {
    next(err);
  }
};

// GET /api/telemetry/:id
const getTelemetryById = async (req, res, next) => {
  try {
    const record = await Telemetry.findById(req.params.id).populate('patientId', 'name patientId age sex');
    if (!record) return res.status(404).json({ message: 'Telemetry record not found' });
    res.json(record);
  } catch (err) {
    next(err);
  }
};

module.exports = { createTelemetry, getPatientTelemetry, getLatestTelemetry, getTelemetryById };
