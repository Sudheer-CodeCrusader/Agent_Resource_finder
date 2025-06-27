import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Test function to demonstrate the updated API
async function testBase64API() {
  const API_BASE_URL = 'http://localhost:3000';
  const AUTH_TOKEN = 'sudheertesttoken$%^';

  try {
    // Read a sample image and convert to base64
    const imagePath = path.join(process.cwd(), 'sample_image.jpg'); // You'll need to provide a sample image
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Prepare the request payload
    const payload = {
      base64image: base64Image,
      xml_url: 'https://example.com/sample.xml' // Replace with actual XML URL
    };

    console.log('Sending request with base64 image...');
    
    // Make the API call
    const response = await fetch(`${API_BASE_URL}/kickoff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      return;
    }

    const result = await response.json();
    console.log('Success! Kickoff ID:', result.kickoff_id);

    // Test the status endpoint
    console.log('Checking status...');
    const statusResponse = await fetch(`${API_BASE_URL}/status/${result.kickoff_id}`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });

    if (statusResponse.ok) {
      const statusResult = await statusResponse.json();
      console.log('Status result:', statusResult);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Example of how to create a base64 image from a file
function createBase64FromFile(filePath) {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.error('Error reading file:', error.message);
    return null;
  }
}

// Example of how to create a base64 image with data URL format
function createBase64WithDataURL(filePath, mimeType = 'image/jpeg') {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    const base64 = imageBuffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error reading file:', error.message);
    return null;
  }
}

console.log('Base64 API Test Examples:');
console.log('1. To test the API, run: node test_base64_api.js');
console.log('2. Make sure you have a sample image file and update the imagePath variable');
console.log('3. Update the xml_url to point to a valid XML file');

// Export functions for use in other files
export { testBase64API, createBase64FromFile, createBase64WithDataURL }; 