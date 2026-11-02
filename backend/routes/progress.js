const express = require('express');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => res.json(await Progress.find({ user: req.user._id }).sort({ recordedAt: 1 })));
router.post('/', async (req, res) => {
  try {
    const entry = await Progress.create({ ...req.body, user: req.user._id });
    if (entry.weight != null) {
      req.user.currentWeight = entry.weight;
      await req.user.save();
    }
    await Notification.create({ user: req.user._id, title: 'Progress updated', message: 'Your latest fitness progress has been saved.', type: 'Goal' });
    res.status(201).json(entry);
  } catch (error) { res.status(400).json({ message: 'Progress entry could not be saved.', detail: error.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const allowed = ['weight', 'measurements', 'runTimeSeconds', 'liftWeight', 'notes', 'recordedAt'];
    const update = {};
    for (const key of allowed) if (req.body[key] !== undefined) update[key] = req.body[key];
    const entry = await Progress.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, update, { new: true, runValidators: true });
    if (!entry) return res.status(404).json({ message: 'Progress record not found.' });
    res.json(entry);
  } catch (error) { res.status(400).json({ message: 'Progress entry could not be updated.', detail: error.message }); }
});
router.delete('/:id', async (req, res) => {
  const entry = await Progress.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!entry) return res.status(404).json({ message: 'Progress record not found.' });
  res.json({ message: 'Progress entry deleted.' });
});
module.exports = router;
