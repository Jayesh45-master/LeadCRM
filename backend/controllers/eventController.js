import Event from '../models/Event.js';

export const getEvents = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = {};
    if (month) query.month = parseInt(month, 10);
    if (year) query.year = parseInt(year, 10);

    const events = await Event.find(query).sort({ day: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, day, month, year, type } = req.body;
    const event = await Event.create({
      title,
      day: parseInt(day, 10),
      month: parseInt(month, 10),
      year: parseInt(year, 10),
      type: type || 'purple'
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Event removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
