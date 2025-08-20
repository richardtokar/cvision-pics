// /api/recognize.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.CLARIFAI_API_KEY;
  console.log('DEBUG — Key exists:', !!apiKey);
  if (!apiKey) {
    return res.status(500).json({ error: 'Clarifai API key is not set' });
  }

  try {
    const { imageUrl } = req.body;
    console.log('DEBUG — Incoming URL:', imageUrl);
    if (!imageUrl) {
      return res.status(400).json({ error: 'Missing imageUrl in request body' });
    }

    const clarifaiBody = {
      user_app_id: {
        user_id: 'clarifai',      // default public user
        app_id: 'main'            // default public app
      },
      inputs: [
        {
          data: {
            image: { url: imageUrl }
          }
        }
      ]
    };

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
    console.log('DEBUG — Clarifai status:', response.status);

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error('DEBUG — Clarifai error:', err);
    return res.status(500).json({ error: err.message || 'Unknown server error' });
  }
}
