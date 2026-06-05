import express from 'express';
import { 
  scoreLead, 
  summarizeLead, 
  smartNotes, 
  nextBestAction, 
  chatAssistant 
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/score', scoreLead);
router.post('/summarize', summarizeLead);
router.post('/notes', smartNotes);
router.post('/next-action', nextBestAction);
router.post('/chat', chatAssistant);

export default router;
