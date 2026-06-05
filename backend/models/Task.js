import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true
  },
  desc: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Overdue'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  time: {
    type: String,
    required: [true, 'Please add a task time']
  },
  date: {
    type: String,
    required: [true, 'Please add a task date']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

export default Task;
