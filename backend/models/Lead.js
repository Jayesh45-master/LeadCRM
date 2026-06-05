import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true
  },
  status: {
    type: String,
    required: [true, 'Please select a status'],
    enum: ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'],
    default: 'New'
  },
  source: {
    type: String,
    enum: ['Website', 'Referral', 'Social Media', 'Email Campaign', 'Others'],
    default: 'Website'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema);

export default Lead;
