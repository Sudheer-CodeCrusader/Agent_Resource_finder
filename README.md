# Resource ID Identifier Agent

This API processes XML files and base64-encoded images to identify elements with missing resource IDs.

## API Changes

The API has been updated to accept base64-encoded images instead of image URLs.

### Request Format

**Before:**
```json
{
  "image_url": "https://example.com/image.jpg",
  "xml_url": "https://example.com/data.xml"
}
```

**After:**
```json
{
  "base64image": "iVBORw0KGgoAAAANSUhEUgAA...",
  "xml_url": "https://example.com/data.xml"
}
```

## API Endpoints

### POST /kickoff

Processes a base64 image and XML file to identify elements with missing resource IDs.

**Request Body:**
```json
{
  "base64image": "base64_encoded_image_string",
  "xml_url": "https://example.com/data.xml"
}
```

**Headers:**
```
Authorization: Bearer sudheertesttoken$%^
Content-Type: application/json
```

**Response:**
```json
{
  "kickoff_id": "uuid-string"
}
```

### GET /status/:kickoff_id

Retrieves the processing status and results for a given kickoff ID.

**Headers:**
```
Authorization: Bearer sudheertesttoken$%^
```

**Response:**
```json
{
  "kickoff_id": "uuid-string",
  "summary": {
    "elements_with_resource_id": 10,
    "elements_without_resource_id": 5,
    "missing_resource_id_details": [...],
    "elements_focused": 2,
    "elements_not_focused": 13
  }
}
```

## Base64 Image Format

The API accepts base64-encoded images in the following formats:

1. **Raw base64 string:**
   ```
   iVBORw0KGgoAAAANSUhEUgAA...
   ```

2. **Data URL format:**
   ```
   data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAA...
   ```

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

## Error Handling

The API will return appropriate error messages for:

- Missing required fields (`base64image` or `xml_url`)
- Invalid base64 image data
- Unsupported image formats
- Invalid XML data
- Network errors when fetching XML

## Example Usage

### JavaScript/Node.js

```javascript
import fetch from 'node-fetch';
import fs from 'fs';

// Convert image to base64
const imageBuffer = fs.readFileSync('image.jpg');
const base64Image = imageBuffer.toString('base64');

// Make API request
const response = await fetch('http://localhost:3000/kickoff', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sudheertesttoken$%^'
  },
  body: JSON.stringify({
    base64image: base64Image,
    xml_url: 'https://example.com/data.xml'
  })
});

const result = await response.json();
console.log('Kickoff ID:', result.kickoff_id);
```

### Python

```python
import requests
import base64

# Convert image to base64
with open('image.jpg', 'rb') as image_file:
    base64_image = base64.b64encode(image_file.read()).decode('utf-8')

# Make API request
response = requests.post(
    'http://localhost:3000/kickoff',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sudheertesttoken$%^'
    },
    json={
        'base64image': base64_image,
        'xml_url': 'https://example.com/data.xml'
    }
)

result = response.json()
print('Kickoff ID:', result['kickoff_id'])
```

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. The API will be available at `http://localhost:3000`

## Testing

Use the provided `test_base64_api.js` file to test the API:

1. Place a sample image file in the project directory
2. Update the `imagePath` variable in the test file
3. Update the `xml_url` to point to a valid XML file
4. Run the test:
   ```bash
   node test_base64_api.js
   ``` 