// Alert Model
// Stores alerts generated from telemetry and AI predictions

const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    telemetryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Telemetry'
    },
    
    // Alert Information
    alertType: {
      type: String,
      enum: ['stable', 'watchlist', 'urgent'],
      required: true
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 1
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    riskFactors: [String],
    recommendation: String,
    
    // Status Management
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewNotes: String,
    reviewedAt: Date,
    
    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Indexes for queries
alertSchema.index({ patientId: 1, status: 1 });
alertSchema.index({ alertType: 1 });
alertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
