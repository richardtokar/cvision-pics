// /api/recognize.js
export default async function handler(req, res) {
  // 1. Check if the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Check for the Clarifai API Key in environment variables
  const apiKey = process.env.CLARifai_API_KEY;
  if (!apiKey) {
    console.error('Server Error: Clarifai API key is not set.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    // 3. Get the incoming data from the frontend
    const { imageUrl, imageBytes } = req.body;

    // 4. Determine the input type (URL or uploaded bytes) and build the correct data object
    let inputData;
    if (imageUrl) {
      // If imageUrl is provided, use the URL format
      console.log('DEBUG — Processing by URL:', imageUrl);
      inputData = { image: { url: imageUrl } };
    } else if (imageBytes) {
      // If imageBytes are provided, use the Base64 format
      console.log('DEBUG — Processing by uploaded bytes.');
      inputData = { image: { base64: imageBytes } };
    } else {
      // If neither is provided, it's a bad request
      return res.status(400).json({ error: 'Missing imageUrl or imageBytes in request body' });
    }

    // 5. Construct the final payload for the Clarifai API
    const clarifaiBody = {
      user_app_id: {
        user_id: 'clarifai',      // Default public user
        app_id: 'main'            // Default public app
      },
      inputs: [
        {
          data: inputData // Use the dynamically created inputData object here
        }
      ]
    };

    // 6. Make the API call to Clarifai
    const response = await fetch(
      'https://api.clarifai.com/v2/models/general-image-recognition/versions/aa7f35c01e0642fda5cf400f543e7c40/outputs',
      {
        method: 'POST',
        headers: {
          'Authorization': `Key ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clarifaiBody)
      }
    );

    const data = await response.json();
    console.log('DEBUG — Clarifai response status:', response.status);

    // 7. Handle the response from Clarifai
    if (!response.ok) {
      // If the response is not OK, forward the error from Clarifai
      return res.status(response.status).json({ error: data });
    }

    // 8. If successful, send the Clarifai data back to the frontend
    return res.status(200).json(data);

  } catch (err) {
    // Handle any unexpected server errors
    console.error('DEBUG — Unexpected server error:', err);
    return res.status(500).json({ error: err.message || 'Unknown server error' });
  }
}
