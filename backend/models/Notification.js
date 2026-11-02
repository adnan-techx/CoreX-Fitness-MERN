const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  message: { type: String, required: true, trim: true, maxlength: 500 },
  type: { type: String, enum: ['Reminder', 'Workout', 'Nutrition', 'Goal', 'System'], default: 'Reminder' },
  dueAt: { type: Date, default: null },
  isRead: { type: Boolean, default: false },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
