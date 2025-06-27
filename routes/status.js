import express from 'express';
import store from '../store/memoryStore.js';
 
const router = express.Router();
 
router.get('/status/:kickoff_id', (req, res) => {
  const { kickoff_id } = req.params;
  const data = store.get(kickoff_id);
  if (!data) {
    return res.status(404).json({ error: 'kickoff_id not found' });
  }
  res.json({
    kickoff_id,
    data: data.summary,
    state:"SUCCESS"
  });
});
 
export default router;
 