export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.VEDICASTRO_API_KEY;

  if (!API_KEY) {
    console.error('Missing VEDICASTRO_API_KEY');
    return res.status(500).json({ error: 'Missing API key' });
  }

  const { date, latitude, longitude, timezone = 'Asia/Kolkata' } = req.body;

  try {
    console.log('Calling VedicAstroAPI with:', { date, latitude, longitude, timezone });

    // Try different endpoint variations
    const endpoints = [
      'https://api.vedicastroapi.com/v1/panchang/',
      'https://api.vedicastroapi.com/rest/astrology/panchang/',
      'https://api.vedicastroapi.com/v2/astrology/panchang/',
      'https://api.vedicastroapi.com/astrology/panchang/'
    ];

    let response;
    let lastError;

    for (const endpoint of endpoints) {
      try {
        console.log('Trying endpoint:', endpoint);
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            date: date,
            latitude: latitude,
            longitude: longitude,
            timezone: timezone
          })
        });

        console.log('Status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Success! Data:', data);
          return res.status(200).json(data);
        }

        lastError = `Endpoint ${endpoint} returned ${response.status}`;
      } catch (e) {
        lastError = e.message;
        continue;
      }
    }

    // If all endpoints failed
    return res.status(500).json({ 
      error: 'All endpoints failed',
      details: lastError 
    });

  } catch (error) {
    console.error('Function error:', error);
    return res.status(500).json({ error: error.message });
  }
}
