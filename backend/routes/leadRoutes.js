import express from 'express';
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  getLeadStats
} from '../controllers/leadController.js';

const router = express.Router();

// Put stats/summary BEFORE /:id so it doesn't try to parse 'stats' as an ObjectId
router.route('/stats/summary').get(getLeadStats);

router.route('/')
  .post(createLead)
  .get(getLeads);

router.route('/:id')
  .get(getLeadById)
  .put(updateLead)
  .delete(deleteLead);

export default router;
