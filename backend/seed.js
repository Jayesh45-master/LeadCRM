import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Lead from './models/Lead.js';
import Task from './models/Task.js';
import Event from './models/Event.js';
import Activity from './models/Activity.js';

dotenv.config();

const sampleLeads = [
  {
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '9876543210',
    company: 'ABC Pvt Ltd',
    status: 'Contacted',
    source: 'Website',
    notes: 'Inquired about product integrations. Call scheduled.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Amit Verma',
    email: 'amit@xyz.com',
    phone: '9123456780',
    company: 'XYZ Solutions',
    status: 'New',
    source: 'Referral',
    notes: 'Referral from existing client. Needs quote pricing details.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Sneha Patel',
    email: 'sneha.patel@example.com',
    phone: '9988776655',
    company: 'TechHub Inc',
    status: 'Qualified',
    source: 'Social Media',
    notes: 'Identified high value opportunity. Wants software demo.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    phone: '8877665544',
    company: 'Innovatech',
    status: 'Converted',
    source: 'Email Campaign',
    notes: 'Subscribed to Professional Plan. Fully converted.',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Neha Gupta',
    email: 'neha.gupta@example.com',
    phone: '7766554433',
    company: 'Bright Future',
    status: 'Lost',
    source: 'Others',
    notes: 'Not enough budget. Excel sufficient.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Karan Mehta',
    email: 'karan@digitalminds.com',
    phone: '9654321019',
    company: 'Digital Minds',
    status: 'Contacted',
    source: 'Website',
    notes: 'Wants integration support.',
    createdAt: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000)
  },
  {
    name: 'Pooja Iyer',
    email: 'pooja@cloudbase.co',
    phone: '9012901290',
    company: 'CloudBase',
    status: 'New',
    source: 'Referral',
    notes: 'Interested in database API sync tools.',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  }
];

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};
const todayStr = formatDate(new Date());
const customDateStr = (daysOffset) => formatDate(new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000));

const sampleTasks = [
  { title: 'Call Rahul Sharma', desc: 'Discuss about the proposal', status: 'Pending', priority: 'High', time: '10:30 AM', date: todayStr },
  { title: 'Send proposal to Amit Verma', desc: 'Share quotation and details', status: 'In Progress', priority: 'Medium', time: '12:00 PM', date: todayStr },
  { title: 'Follow up with Sneha Patel', desc: 'Check the requirements', status: 'Pending', priority: 'High', time: '03:00 PM', date: todayStr },
  { title: 'Demo meeting with ABC Pvt Ltd', desc: 'Product demo and discussion', status: 'Pending', priority: 'Medium', time: '11:00 AM', date: customDateStr(2) },
  { title: 'Follow up with Vikram Singh', desc: 'Pricing discussion', status: 'Completed', priority: 'Low', time: '03:00 PM', date: customDateStr(3) },
  { title: 'Send contract to Neha Gupta', desc: 'Share the final contract', status: 'Pending', priority: 'Medium', time: '01:00 PM', date: customDateStr(4) },
  { title: 'Overdue proposal reviews', desc: 'Review corporate contracts', status: 'Overdue', priority: 'High', time: '09:00 AM', date: customDateStr(-3) }
];

const currentMonth = new Date().getMonth() + 1; // 1-indexed
const currentYear = new Date().getFullYear();

const sampleEvents = [
  { day: 2, month: currentMonth, year: currentYear, title: 'Call Rahul', type: 'purple' },
  { day: 3, month: currentMonth, year: currentYear, title: 'Demo with ABC', type: 'blue' },
  { day: 5, month: currentMonth, year: currentYear, title: 'Follow up Amit', type: 'pink' },
  { day: 10, month: currentMonth, year: currentYear, title: 'Meeting Techhub', type: 'purple' },
  { day: 11, month: currentMonth, year: currentYear, title: 'Proposal Review', type: 'blue' },
  { day: 12, month: currentMonth, year: currentYear, title: 'Call Neha', type: 'pink' },
  { day: 16, month: currentMonth, year: currentYear, title: 'Strategy Call', type: 'purple' },
  { day: 18, month: currentMonth, year: currentYear, title: 'Client Meeting', type: 'blue' },
  { day: 19, month: currentMonth, year: currentYear, title: 'Follow up Vikram', type: 'pink' },
  { day: 25, month: currentMonth, year: currentYear, title: 'Product Demo', type: 'blue' },
  { day: 26, month: currentMonth, year: currentYear, title: 'Contract Discussion', type: 'pink' }
];

const sampleActivities = [
  { desc: 'Rahul Sharma status changed to Contacted', color: 'purple' },
  { desc: 'Amit Verma added a new lead', color: 'pink' },
  { desc: 'Sneha Patel marked as Qualified', color: 'warning' },
  { desc: 'Vikram Singh status changed to Converted', color: 'success' }
];

const seedDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/leadpro';
    await mongoose.connect(uri);
    console.log('MongoDB connection active for seeding...');

    // Clear collections
    await Lead.deleteMany({});
    await Task.deleteMany({});
    await Event.deleteMany({});
    await Activity.deleteMany({});
    console.log('Cleared existing data.');

    // Seed data
    await Lead.insertMany(sampleLeads);
    await Task.insertMany(sampleTasks);
    await Event.insertMany(sampleEvents);
    await Activity.insertMany(sampleActivities);
    console.log('Successfully seeded database with Leads, Tasks, Events, and Activities!');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
