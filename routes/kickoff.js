import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { processXml } from '../services/xmlProcessor.js';
import store from '../store/memoryStore.js';
import fetch from 'node-fetch';
import axios from 'axios';
const router = express.Router();

router.post('/kickoff', async (req, res) => {
  let { image_url, xml_url } = req.body;
  try {
    if (req.body.inputs) {
      image_url = req.body.inputs.image_url
      xml_url = req.body.inputs.xml_url
    }
  } catch (e) { }

  if (!image_url || !xml_url) {
    return res.status(200).json({ error: 'image_url and xml_url are required' });
  }

  // Validate base64 image format
  let imageBuffer;
  let base64Data;
  if (image_url && image_url.includes('/screenshot')) {
    try {
      let _imageresp = await axios.get(image_url, { responseType: 'json' });
      base64Data = _imageresp.data?.value;

      if (!base64Data || typeof base64Data !== 'string') {
        return res.status(200).json({ error: 'Invalid base64 image data' });
      }
      imageBuffer = Buffer.from(base64Data, 'base64');
      const header = imageBuffer.toString('hex', 0, 8).toUpperCase();
      const validImageHeaders = ['FFD8FF', '89504E47', '47494638', '52494646'];
      const isValidImage = validImageHeaders.some(h => header.startsWith(h));

      if (!isValidImage) {
        return res.status(200).json({ error: 'Invalid image format. Please provide a valid base64 encoded image (JPEG, PNG, GIF, etc.)' });
      }

    } catch (e) {
      console.error('Error fetching or validating image:', e.message);
      return res.status(200).json({ error: 'Could not fetch XML: ' + e.message });
    }
  }
  else {
    try {
      // Fetch binary image data
      let _imageresp = await axios.get(image_url, { responseType: 'arraybuffer' });

      // Convert to Buffer
      imageBuffer = Buffer.from(_imageresp.data, 'binary');

      // Optionally convert to base64 if needed
      base64Data = imageBuffer.toString('base64');

      // Validate image by checking magic number
      const header = imageBuffer.toString('hex', 0, 8).toUpperCase();
      const validImageHeaders = ['FFD8FF', '89504E47', '47494638', '52494646'];
      const isValidImage = validImageHeaders.some(h => header.startsWith(h));

      if (!isValidImage) {
        return res.status(400).json({ error: 'Invalid image format. Please provide a valid base64 encoded image (JPEG, PNG, GIF, etc.)' });
      }

    } catch (e) {
      return res.status(400).json({ error: 'Invalid image fetch or decode: ' + e.message });
    }
  }


  let xml_data;
  if (xml_url && xml_url.includes('/source')) {
    try {
      let _xmlresp = await axios.get(xml_url);
      xml_data = _xmlresp.data.value
    } catch (e) {
      return res.status(200).json({ error: 'Could not fetch XML: ' + e.message });
    }
  } else {
    try {
      const response = await fetch(xml_url);
      if (!response.ok) throw new Error('Failed to fetch XML from url');
      xml_data = await response.text();
    } catch (e) {
      return res.status(200).json({ error: 'Could not fetch XML: ' + e.message });
    }
  }



  let summary;
  try {
    summary = await processXml(xml_data);
    // TODO: Call LLM here if needed
  } catch (e) {
    return res.status(200).json({ error: e.message });
  }

  const kickoff_id = uuidv4();
  store.set(kickoff_id, { image_url, xml_url, summary, imageBuffer });

  res.json({ kickoff_id });
});

export default router; 