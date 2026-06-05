import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an event title'],
    trim: true
  },
  day: {
    type: Number,
    required: [true, 'Please specify day of month'],
    min: 1,
    max: 31
  },
  month: {
    type: Number,
    required: [true, 'Please specify month'],
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: [true, 'Please specify year']
  },
  type: {
    type: String,
    enum: ['purple', 'blue', 'pink', 'warning', 'success'],
    default: 'purple'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

export default Event;
