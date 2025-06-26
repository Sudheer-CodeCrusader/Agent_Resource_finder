import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { processXml } from '../services/xmlProcessor.js';
import store from '../store/memoryStore.js';
import fetch from 'node-fetch';

const router = express.Router();

router.post('/kickoff', async (req, res) => {
  const { image_url, xml_url } = req.body;
  if (!image_url || !xml_url) {
    return res.status(400).json({ error: 'image_url and xml_url are required' });
  }

  let xml_data;
  try {
    const response = await fetch(xml_url);
    if (!response.ok) throw new Error('Failed to fetch XML from url');
    xml_data = await response.text();
  } catch (e) {
    return res.status(400).json({ error: 'Could not fetch XML: ' + e.message });
  }

  let summary;
  try {
    summary = await processXml(xml_data);
    // TODO: Call LLM here if needed
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  const kickoff_id = uuidv4();
  store.set(kickoff_id, { image_url, xml_url, summary });

  res.json({ kickoff_id });
});

export default router; 