const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  profilePicture: { type: String, default: '' },
  gender: { type: String, enum: ['Prefer not to say', 'Male', 'Female', 'Other'], default: 'Prefer not to say' },
  heightCm: { type: Number, min: 0, default: null },
  currentWeight: { type: Number, min: 0, default: null },
  goalWeight: { type: Number, min: 0, default: null },
  units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
  theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
  notificationsEnabled: { type: Boolean, default: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
