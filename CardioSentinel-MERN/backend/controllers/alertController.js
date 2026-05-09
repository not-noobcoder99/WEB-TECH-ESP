const Alert = require('../models/Alert');

// GET /api/alerts
const getAlerts = async (req, res, next) => {
  try {
    const { status, alertType, patientId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (alertType) filter.alertType = alertType;
    if (patientId) filter.patientId = patientId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('patientId', 'name patientId riskLevel')
        .populate('reviewedBy', 'fullName'),
      Alert.countDocuments(filter)
    ]);

    res.json({ alerts, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
};

// GET /api/alerts/:id
const getAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('patientId', 'name patientId age sex riskLevel')
      .populate('telemetryId')
      .populate('reviewedBy', 'fullName');
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json(alert);
  } catch (err) {
    next(err);
  }
};

// GET /api/patients/:patientId/alerts
const getPatientAlerts = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { patientId: req.params.patientId };
    if (status) filter.status = status;

    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .populate('telemetryId', 'heartRate systolicBP readingTimestamp')
      .populate('reviewedBy', 'fullName');
    res.json(alerts);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/alerts/:id
const updateAlert = async (req, res, next) => {
  try {
    const { status, reviewNotes } = req.body;
    const update = { status };
    if (reviewNotes) update.reviewNotes = reviewNotes;
    if (status === 'reviewed' || status === 'resolved') {
      update.reviewedBy = req.user.id;
      update.reviewedAt = new Date();
    }

    const alert = await Alert.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json(alert);
  } catch (err) {
    next(err);
  }
};

// POST /api/alerts  (manual alert creation)
const createAlert = async (req, res, next) => {
  try {
    const { patientId, telemetryId, alertType, riskScore, confidence, riskFactors, recommendation } = req.body;
    if (!patientId || !alertType) {
      return res.status(400).json({ message: 'patientId and alertType are required' });
    }

    const alert = await Alert.create({ patientId, telemetryId, alertType, riskScore, confidence, riskFactors, recommendation });
    res.status(201).json(alert);
  } catch (err) {
    next(err);
  }
};

// GET /api/alerts/stats
const getAlertStats = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [total, pending, urgent, resolvedToday] = await Promise.all([
      Alert.countDocuments({}),
      Alert.countDocuments({ status: 'pending' }),
      Alert.countDocuments({ alertType: 'urgent', status: { $ne: 'resolved' } }),
      Alert.countDocuments({ status: 'resolved', reviewedAt: { $gte: todayStart } }),
    ]);

    res.json({ total, pending, urgent, resolvedToday });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAlerts, getAlert, getPatientAlerts, updateAlert, createAlert, getAlertStats };
