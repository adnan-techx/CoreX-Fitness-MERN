const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  exercise: { type: String, required: true, trim: true, maxlength: 100 },
  category: { type: String, enum: ['Strength', 'Cardio', 'HIIT', 'Mobility', 'Other'], default: 'Strength' },
  sets: { type: Number, min: 0, default: 1 },
  reps: { type: Number, min: 0, default: 1 },
  weight: { type: Number, min: 0, default: 0 },
  durationMinutes: { type: Number, min: 0, default: 0 },
  notes: { type: String, maxlength: 1000, default: '' },
  performedAt: { type: Date, default: Date.now }
}, { timestamps: true });

workoutSchema.index({ user: 1, performedAt: -1 });
module.exports = mongoose.model('Workout', workoutSchema);
