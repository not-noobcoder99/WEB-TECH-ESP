// Patient Model
// Stores patient demographics and clinical baseline features

const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      unique: true,
      // Format: CS-XXXX (e.g., CS-0001)
    },
    name: {
      type: String,
      required: true
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 150
    },
    sex: {
      type: Number,
      enum: [0, 1], // 0: Female, 1: Male
      required: true
    },
    email: String,
    phone: String,
    medicalHistory: String,
    
    // Clinical baseline features (for AI model input)
    cp: {
      type: Number,
      description: 'Chest pain type (0-3)'
    },
    trestbps: {
      type: Number,
      description: 'Resting blood pressure'
    },
    chol: {
      type: Number,
      description: 'Cholesterol level'
    },
    fbs: {
      type: Number,
      description: 'Fasting blood sugar'
    },
    restecg: {
      type: Number,
      description: 'Resting ECG'
    },
    thalach: {
      type: Number,
      description: 'Maximum heart rate achieved'
    },
    exang: {
      type: Number,
      description: 'Exercise induced angina'
    },
    oldpeak: {
      type: Number,
      description: 'ST depression'
    },
    slope: {
      type: Number,
      description: 'Slope of ST segment'
    },
    ca: {
      type: Number,
      description: 'Number of major vessels'
    },
    thal: {
      type: Number,
      description: 'Thalassemia type'
    },
    
    // AI Risk Assessment
    riskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high'],
      default: 'moderate'
    },
    lastRiskScore: {
      type: Number,
      min: 0,
      max: 1
    },
    
    // Enrollment Information
    assignedClinician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'discharged'],
      default: 'active'
    },
    lastUpdated: Date,

    notes: [{
      content: { type: String, required: true },
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

// Indexes for faster queries
patientSchema.index({ patientId: 1 });
patientSchema.index({ name: 'text' });
patientSchema.index({ status: 1 });
patientSchema.index({ riskLevel: 1 });

module.exports = mongoose.model('Patient', patientSchema);
