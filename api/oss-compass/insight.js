export default async function handler(request, response) {
  const { id } = request.query;

  if (!id) {
    response.status(400).json({ error: 'Missing insight ID' });
    return;
  }

  try {
    const targetUrl = `https://oss-compass.org/api/analyze/insight/${id}`;
    const ossResponse = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!ossResponse.ok) {
      throw new Error(`OSS Compass API returned ${ossResponse.status}`);
    }

    const data = await ossResponse.json();
    response.status(200).json(data);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}
