import Task from '../models/Task.js';

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, desc, status, priority, time, date } = req.body;
    const task = await Task.create({
      title,
      desc,
      status: status || 'Pending',
      priority: priority || 'Medium',
      time,
      date
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { title, desc, status, priority, time, date } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.title = title !== undefined ? title : task.title;
    task.desc = desc !== undefined ? desc : task.desc;
    task.status = status !== undefined ? status : task.status;
    task.priority = priority !== undefined ? priority : task.priority;
    task.time = time !== undefined ? time : task.time;
    task.date = date !== undefined ? date : task.date;

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Task removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
