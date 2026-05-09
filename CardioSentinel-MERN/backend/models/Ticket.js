// Ticket Model
// Support tickets for clinical questions, issues, and feedback

const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      match: /.+\@.+\..+/
    },
    ticketType: {
      type: String,
      enum: ['clinical-followup', 'telemetry-issue', 'model-question', 'research', 'general'],
      required: true
    },
    subject: String,
    message: {
      type: String,
      required: true,
      minlength: 10
    },
    
    // Status Management
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Response
    response: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
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

// Indexes
ticketSchema.index({ email: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Ticket', ticketSchema);
