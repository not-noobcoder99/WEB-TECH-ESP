// Telemetry Model
// Stores real-time patient vital signs readings

const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    
    // Vital Signs
    heartRate: {
      type: Number,
      required: true,
      min: 30,
      max: 250
    },
    systolicBP: {
      type: Number,
      required: true,
      min: 70,
      max: 250
    },
    diastolicBP: {
      type: Number,
      required: true,
      min: 40,
      max: 150
    },
    respirationRate: {
      type: Number,
      min: 8,
      max: 60
    },
    oxygenSaturation: {
      type: Number,
      min: 70,
      max: 100
    },
    temperature: Number,
    
    // Signal Quality
    signalQuality: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    deviceType: String,
    
    // AI Prediction Result (auto-populated)
    aiPrediction: {
      riskScore: {
        type: Number,
        min: 0,
        max: 1
      },
      riskLevel: {
        type: String,
        enum: ['low', 'moderate', 'high']
      },
      prediction: {
        type: Number,
        enum: [0, 1]
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1
      },
      triggeredAlert: Boolean
    },
    
    // Timestamps
    readingTimestamp: {
      type: Date,
      required: true
    },
    recordedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for fast queries
telemetrySchema.index({ patientId: 1, readingTimestamp: -1 });
telemetrySchema.index({ recordedAt: -1 });

module.exports = mongoose.model('Telemetry', telemetrySchema);
