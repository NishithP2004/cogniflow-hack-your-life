const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  context: String,
  actions: [String],
  productivityScore: Number,
  focusMode: { type: Boolean, default: false },
  screenshotPath: String
});

module.exports = mongoose.model('Activity', activitySchema);
