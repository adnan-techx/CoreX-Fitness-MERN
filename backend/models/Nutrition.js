const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  foodItem: { type: String, required: true, trim: true, maxlength: 100 },
  mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], default: 'Snack' },
  quantity: { type: String, required: true, trim: true, maxlength: 50 },
  calories: { type: Number, required: true, min: 0, default: 0 },
  protein: { type: Number, min: 0, default: 0 },
  carbs: { type: Number, min: 0, default: 0 },
  fats: { type: Number, min: 0, default: 0 },
  loggedAt: { type: Date, default: Date.now }
}, { timestamps: true });

nutritionSchema.index({ user: 1, loggedAt: -1 });
module.exports = mongoose.model('Nutrition', nutritionSchema);
