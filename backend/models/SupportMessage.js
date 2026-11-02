const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String, required: true, trim: true, maxlength: 120 },
  message: { type: String, required: true, trim: true, maxlength: 3000 },
  status: { type: String, enum: ['Open', 'In progress', 'Resolved'], default: 'Open' },
  adminReply: { type: String, maxlength: 3000, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('SupportMessage', supportMessageSchema);
