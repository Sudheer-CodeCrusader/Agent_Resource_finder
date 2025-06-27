import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { processXml } from '../services/xmlProcessor.js';
import store from '../store/memoryStore.js';
import fetch from 'node-fetch';

const router = express.Router();

router.post('/kickoff', async (req, res) => {
  const { base64image, xml_url } = req.body;
  if (!base64image || !xml_url) {
    return res.status(400).json({ error: 'base64image and xml_url are required' });
  }

  // Validate base64 image format
  let imageBuffer;
  try {
    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Data = base64image.replace(/^data:image\/[a-z]+;base64,/, '');
    imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Basic validation - check if it's a valid image by looking at the first few bytes
    const header = imageBuffer.toString('hex', 0, 8).toUpperCase();
    const validImageHeaders = ['FFD8FF', '89504E47', '47494638', '52494646'];
    const isValidImage = validImageHeaders.some(headerStart => header.startsWith(headerStart));
    
    if (!isValidImage) {
      return res.status(400).json({ error: 'Invalid image format. Please provide a valid base64 encoded image (JPEG, PNG, GIF, etc.)' });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid base64 image data: ' + e.message });
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
  store.set(kickoff_id, { base64image, xml_url, summary, imageBuffer });

  res.json({ kickoff_id });
});

export default router; 