const mongoose = require('mongoose');

const selfReportSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },

    features: {
      age: Number, sex: Number, cp: Number, trestbps: Number,
      chol: Number, fbs: Number, restecg: Number, thalach: Number,
      exang: Number, oldpeak: Number, slope: Number, ca: Number, thal: Number,
    },

    aiPrediction: {
      riskScore:            { type: Number, min: 0, max: 1 },
      riskLevel:            { type: String, enum: ['low', 'moderate', 'high'] },
      prediction:           { type: Number, enum: [0, 1] },
      confidence:           { type: Number, min: 0, max: 1 },
      featureContributions: { type: Array, default: [] },
      triggeredAlert:       { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

selfReportSchema.index({ patientId: 1, createdAt: -1 });
selfReportSchema.index({ userId: 1,    createdAt: -1 });

module.exports = mongoose.model('SelfReport', selfReportSchema);
