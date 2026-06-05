import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  desc: {
    type: String,
    required: true
  },
  color: {
    type: String,
    enum: ['purple', 'pink', 'warning', 'success', 'danger'],
    default: 'purple'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);

export default Activity;
