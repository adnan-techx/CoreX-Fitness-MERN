const express = require('express');
const Nutrition = require('../models/Nutrition');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  const { search, mealType, from, to } = req.query;
  const query = { user: req.user._id };
  if (mealType && mealType !== 'All') query.mealType = mealType;
  if (search) query.foodItem = { $regex: search, $options: 'i' };
  if (from || to) query.loggedAt = { ...(from ? { $gte: new Date(from) } : {}), ...(to ? { $lte: new Date(`${to}T23:59:59.999`) } : {}) };
  res.json(await Nutrition.find(query).sort({ loggedAt: -1 }));
});

router.post('/', async (req, res) => {
  try {
    const item = await Nutrition.create({ ...req.body, user: req.user._id });
    await Notification.create({ user: req.user._id, title: 'Nutrition logged', message: `${item.foodItem} was added to your food diary.`, type: 'Nutrition' });
    res.status(201).json(item);
  } catch (error) { res.status(400).json({ message: 'Nutrition entry could not be saved.', detail: error.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const allowed = ['foodItem', 'mealType', 'quantity', 'calories', 'protein', 'carbs', 'fats', 'loggedAt'];
    const update = {};
    for (const key of allowed) if (req.body[key] !== undefined) update[key] = req.body[key];
    const item = await Nutrition.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, update, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Nutrition entry not found.' });
    res.json(item);
  } catch (error) { res.status(400).json({ message: 'Nutrition entry could not be updated.', detail: error.message }); }
});

router.delete('/:id', async (req, res) => {
  const item = await Nutrition.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!item) return res.status(404).json({ message: 'Nutrition entry not found.' });
  res.json({ message: 'Nutrition entry deleted.' });
});
module.exports = router;
