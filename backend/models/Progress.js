const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  weight: { type: Number, min: 0, default: null },
  measurements: {
    waist: { type: Number, min: 0, default: null },
    chest: { type: Number, min: 0, default: null },
    hips: { type: Number, min: 0, default: null },
    arms: { type: Number, min: 0, default: null }
  },
  runTimeSeconds: { type: Number, min: 0, default: null },
  liftWeight: { type: Number, min: 0, default: null },
  notes: { type: String, maxlength: 1000, default: '' },
  recordedAt: { type: Date, default: Date.now }
}, { timestamps: true });

progressSchema.index({ user: 1, recordedAt: -1 });
module.exports = mongoose.model('Progress', progressSchema);
