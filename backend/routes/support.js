const express = require('express');
const SupportMessage = require('../models/SupportMessage');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  res.json(await SupportMessage.find({ user: req.user._id }).sort({ createdAt: -1 }));
});
router.post('/', async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject?.trim() || !message?.trim()) return res.status(400).json({ message: 'Subject and message are required.' });
    const supportMessage = await SupportMessage.create({ user: req.user._id, subject, message });
    res.status(201).json(supportMessage);
  } catch (error) { res.status(400).json({ message: 'Support message could not be sent.', detail: error.message }); }
});
module.exports = router;
