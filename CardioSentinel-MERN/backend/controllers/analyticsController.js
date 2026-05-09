const Patient = require('../models/Patient');
const Telemetry = require('../models/Telemetry');
const Alert = require('../models/Alert');
const User = require('../models/User');

// GET /api/analytics/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalPatients,
      activePatients,
      highRiskPatients,
      pendingAlerts,
      totalAlerts,
      totalUsers,
      recentAlerts
    ] = await Promise.all([
      Patient.countDocuments(),
      Patient.countDocuments({ status: 'active' }),
      Patient.countDocuments({ riskLevel: 'high' }),
      Alert.countDocuments({ status: 'pending' }),
      Alert.countDocuments(),
      User.countDocuments({ isActive: true }),
      Alert.find({ status: 'pending' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('patientId', 'name patientId')
    ]);

    res.json({
      totalPatients,
      activePatients,
      highRiskPatients,
      pendingAlerts,
      totalAlerts,
      totalUsers,
      recentAlerts
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/risk-distribution
const getRiskDistribution = async (req, res, next) => {
  try {
    const distribution = await Patient.aggregate([
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
      { $project: { riskLevel: '$_id', count: 1, _id: 0 } }
    ]);

    // Ensure all three levels are present
    const result = { low: 0, moderate: 0, high: 0 };
    distribution.forEach(d => { if (d.riskLevel) result[d.riskLevel] = d.count; });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/alert-trends  (last 7 days by default)
const getAlertTrends = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const trends = await Alert.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            alertType: '$alertType'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json(trends);
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/telemetry-averages/:patientId
const getTelemetryAverages = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const averages = await Telemetry.aggregate([
      { $match: { patientId: new (require('mongoose').Types.ObjectId)(patientId), readingTimestamp: { $gte: since } } },
      {
        $group: {
          _id: null,
          avgHeartRate: { $avg: '$heartRate' },
          avgSystolicBP: { $avg: '$systolicBP' },
          avgDiastolicBP: { $avg: '$diastolicBP' },
          avgOxygenSaturation: { $avg: '$oxygenSaturation' },
          avgRespirationRate: { $avg: '$respirationRate' },
          avgRiskScore: { $avg: '$aiPrediction.riskScore' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(averages[0] || { count: 0 });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/recent-telemetry/:patientId
const getRecentTelemetryTrend = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const records = await Telemetry.find({ patientId: req.params.patientId })
      .sort({ readingTimestamp: -1 })
      .limit(limit)
      .select('heartRate systolicBP diastolicBP oxygenSaturation aiPrediction readingTimestamp');

    res.json(records.reverse()); // chronological for charting
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats, getRiskDistribution, getAlertTrends, getTelemetryAverages, getRecentTelemetryTrend };
