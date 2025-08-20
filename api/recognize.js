import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }

  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  try {
    const clarifaiRes = await fetch(
      'https://api.clarifai.com/v2/models/general-image-recognition/outputs',
      {
        method: 'POST',
        headers: {
          'Authorization': `Key ${process.env.CLARIFAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: [{ data: { image: { url: imageUrl } } }]
        })
      }
    );

    const data = await clarifaiRes.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
}
