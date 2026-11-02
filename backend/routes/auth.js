const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  profilePicture: user.profilePicture,
  gender: user.gender,
  heightCm: user.heightCm,
  currentWeight: user.currentWeight,
  goalWeight: user.goalWeight,
  units: user.units,
  theme: user.theme,
  notificationsEnabled: user.notificationsEnabled,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt
});

function makeToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password });
    res.status(201).json({ token: makeToken(user), user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Could not create your account.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Email or password is incorrect.' });
    if (!user.isActive) return res.status(403).json({ message: 'This account has been disabled. Contact support.' });
    res.json({ token: makeToken(user), user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Could not sign you in.' });
  }
});

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));

router.put('/me', protect, async (req, res) => {
  try {
    const allowed = ['name', 'profilePicture', 'gender', 'heightCm', 'currentWeight', 'goalWeight', 'units', 'theme', 'notificationsEnabled'];
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) req.user[key] = req.body[key];
    }
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  } catch (error) {
    res.status(400).json({ message: 'Profile could not be updated.', detail: error.message });
  }
});

router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) return res.status(400).json({ message: 'Provide your current password and a new password of at least 8 characters.' });
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) return res.status(400).json({ message: 'Current password is incorrect.' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    res.status(400).json({ message: 'Password could not be updated.' });
  }
});

module.exports = router;
module.exports.publicUser = publicUser;
