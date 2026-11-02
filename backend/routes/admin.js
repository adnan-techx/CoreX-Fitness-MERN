const express = require('express');
const User = require('../models/User');
const Workout = require('../models/Workout');
const Nutrition = require('../models/Nutrition');
const Progress = require('../models/Progress');
const SupportMessage = require('../models/SupportMessage');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();
router.use(protect, adminOnly);

router.get('/dashboard', async (_req, res) => {
  const [users, activeUsers, workouts, nutritionEntries, progressEntries, openMessages, recentUsers] = await Promise.all([
    User.countDocuments({ role: 'user' }), User.countDocuments({ role: 'user', isActive: true }), Workout.countDocuments(),
    Nutrition.countDocuments(), Progress.countDocuments(), SupportMessage.countDocuments({ status: { $ne: 'Resolved' } }),
    User.find({ role: 'user' }).select('name email isActive createdAt').sort({ createdAt: -1 }).limit(8)
  ]);
  res.json({ users, activeUsers, workouts, nutritionEntries, progressEntries, openMessages, recentUsers });
});

router.get('/users', async (req, res) => {
  const { search } = req.query;
  const query = { role: 'user' };
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  const users = await User.find(query).select('-password').sort({ createdAt: -1 }).limit(300);
  res.json(users);
});

router.patch('/users/:id', async (req, res) => {
  if (typeof req.body.isActive !== 'boolean') return res.status(400).json({ message: 'isActive must be true or false.' });
  const user = await User.findOneAndUpdate({ _id: req.params.id, role: 'user' }, { isActive: req.body.isActive }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json(user);
});

router.delete('/users/:id', async (req, res) => {
  const user = await User.findOneAndDelete({ _id: req.params.id, role: 'user' });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  await Promise.all([
    Workout.deleteMany({ user: user._id }), Nutrition.deleteMany({ user: user._id }), Progress.deleteMany({ user: user._id }),
    SupportMessage.deleteMany({ user: user._id }), Notification.deleteMany({ user: user._id })
  ]);
  res.json({ message: 'User and associated data deleted.' });
});

router.get('/workouts', async (req, res) => {
  const { search } = req.query;
  const query = search ? { exercise: { $regex: search, $options: 'i' } } : {};
  res.json(await Workout.find(query).populate('user', 'name email').sort({ createdAt: -1 }).limit(500));
});
router.delete('/workouts/:id', async (req, res) => {
  const item = await Workout.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Workout not found.' });
  res.json({ message: 'Workout deleted.' });
});

router.get('/nutrition', async (_req, res) => res.json(await Nutrition.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(500)));
router.delete('/nutrition/:id', async (req, res) => {
  const item = await Nutrition.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Nutrition entry not found.' });
  res.json({ message: 'Nutrition entry deleted.' });
});

router.get('/support', async (_req, res) => res.json(await SupportMessage.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(500)));
router.patch('/support/:id', async (req, res) => {
  const update = {};
  if (['Open', 'In progress', 'Resolved'].includes(req.body.status)) update.status = req.body.status;
  if (typeof req.body.adminReply === 'string') update.adminReply = req.body.adminReply;
  const message = await SupportMessage.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).populate('user', 'name email');
  if (!message) return res.status(404).json({ message: 'Support message not found.' });
  res.json(message);
});

module.exports = router;
