const express = require('express');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  const reminders = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json(reminders);
});
router.post('/', async (req, res) => {
  try {
    const { title, message, dueAt, type } = req.body;
    const reminder = await Notification.create({ user: req.user._id, title, message, dueAt: dueAt || null, type: type || 'Reminder' });
    res.status(201).json(reminder);
  } catch (error) { res.status(400).json({ message: 'Reminder could not be created.', detail: error.message }); }
});
router.patch('/:id', async (req, res) => {
  const update = {};
  if (typeof req.body.isRead === 'boolean') update.isRead = req.body.isRead;
  if (typeof req.body.completed === 'boolean') update.completed = req.body.completed;
  const item = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, update, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Notification not found.' });
  res.json(item);
});
router.delete('/:id', async (req, res) => {
  const item = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!item) return res.status(404).json({ message: 'Notification not found.' });
  res.json({ message: 'Reminder deleted.' });
});
module.exports = router;
