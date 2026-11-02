const express = require('express');
const Workout = require('../models/Workout');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  const { search, category, from, to } = req.query;
  const query = { user: req.user._id };
  if (category && category !== 'All') query.category = category;
  if (search) query.exercise = { $regex: search, $options: 'i' };
  if (from || to) query.performedAt = { ...(from ? { $gte: new Date(from) } : {}), ...(to ? { $lte: new Date(`${to}T23:59:59.999`) } : {}) };
  const workouts = await Workout.find(query).sort({ performedAt: -1 });
  res.json(workouts);
});

router.post('/', async (req, res) => {
  try {
    const workout = await Workout.create({ ...req.body, user: req.user._id });
    await Notification.create({ user: req.user._id, title: 'Workout logged', message: `${workout.exercise} was added to your workout history.`, type: 'Workout' });
    res.status(201).json(workout);
  } catch (error) { res.status(400).json({ message: 'Workout could not be saved.', detail: error.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const allowed = ['exercise', 'category', 'sets', 'reps', 'weight', 'durationMinutes', 'notes', 'performedAt'];
    const update = {};
    for (const key of allowed) if (req.body[key] !== undefined) update[key] = req.body[key];
    const workout = await Workout.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, update, { new: true, runValidators: true });
    if (!workout) return res.status(404).json({ message: 'Workout not found.' });
    res.json(workout);
  } catch (error) { res.status(400).json({ message: 'Workout could not be updated.', detail: error.message }); }
});

router.delete('/:id', async (req, res) => {
  const workout = await Workout.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!workout) return res.status(404).json({ message: 'Workout not found.' });
  res.json({ message: 'Workout deleted.' });
});
module.exports = router;
