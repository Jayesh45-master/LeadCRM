import Lead from '../models/Lead.js';
import Activity from '../models/Activity.js';

// Helper mapping status to colors for activity log
const statusColors = {
  New: 'pink',
  Contacted: 'purple',
  Qualified: 'warning',
  Converted: 'success',
  Lost: 'danger'
};

// @desc    Create new lead
// @route   POST /api/leads
// @access  Public
export const createLead = async (req, res) => {
  try {
    const { name, email, phone, company, status, source, notes } = req.body;

    const emailExists = await Lead.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'A lead with this email already exists' });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      status: status || 'New',
      source: source || 'Website',
      notes
    });

    // Create log activity
    await Activity.create({
      desc: `${lead.name} added as a new lead`,
      color: 'pink'
    });

    res.status(201).json(lead);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all leads with search, filter, sort, and pagination
// @route   GET /api/leads
// @access  Public
export const getLeads = async (req, res) => {
  try {
    const { search, status, sortBy = 'createdAt', order = 'desc', page = 1, limit = 8 } = req.query;

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOption = { [sortBy]: sortOrder };

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      leads,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get lead by ID
// @route   GET /api/leads/:id
// @access  Public
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.status(200).json(lead);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid lead ID' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Public
export const updateLead = async (req, res) => {
  try {
    const { name, email, phone, company, status, source, notes } = req.body;

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const oldStatus = lead.status;

    if (email && email !== lead.email) {
      const emailExists = await Lead.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'A lead with this email already exists' });
      }
    }

    lead.name = name !== undefined ? name : lead.name;
    lead.email = email !== undefined ? email : lead.email;
    lead.phone = phone !== undefined ? phone : lead.phone;
    lead.company = company !== undefined ? company : lead.company;
    lead.status = status !== undefined ? status : lead.status;
    lead.source = source !== undefined ? source : lead.source;
    lead.notes = notes !== undefined ? notes : lead.notes;

    const updatedLead = await lead.save();

    // Log status transitions or generic changes
    if (status && status !== oldStatus) {
      await Activity.create({
        desc: `${lead.name} status changed to ${status}`,
        color: statusColors[status] || 'purple'
      });
    } else {
      await Activity.create({
        desc: `${lead.name} details were updated`,
        color: 'purple'
      });
    }

    res.status(200).json(updatedLead);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Public
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    await Lead.findByIdAndDelete(req.params.id);

    // Log deletion
    await Activity.create({
      desc: `${lead.name} was removed from CRM`,
      color: 'danger'
    });

    res.status(200).json({ message: 'Lead removed successfully' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid lead ID' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get lead dashboard statistics
// @route   GET /api/leads/stats/summary
// @access  Public
export const getLeadStats = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    
    // Status aggregates
    const statusCounts = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = { New: 0, Contacted: 0, Qualified: 0, Converted: 0, Lost: 0 };
    statusCounts.forEach(item => {
      if (stats[item._id] !== undefined) {
        stats[item._id] = item.count;
      }
    });

    // Conversion rate calculation
    const conversionRate = totalLeads > 0 
      ? Math.round((stats.Converted / totalLeads) * 100) 
      : 0;

    // Lead source aggregates
    const sourceCounts = await Lead.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    const sources = { Website: 0, Referral: 0, 'Social Media': 0, 'Email Campaign': 0, Others: 0 };
    sourceCounts.forEach(item => {
      if (sources[item._id] !== undefined) {
        sources[item._id] = item.count;
      }
    });

    // Leads by creation day for graph (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const history = await Lead.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Query recent activity logs
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      total: totalLeads,
      byStatus: stats,
      bySource: sources,
      conversionRate,
      history,
      activities
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
