// Vercel serverless function: /api/check_bbb_profile
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const provided = req.headers['x-api-key'];

  // ✅ TEMP fallback so your endpoint works even without env var
  const fallback = '3bdf96e7a3a8b4c2f0c9914d9b17a0c5e57e4231bbf9e8f24a7a5cd36b22d04f';
  const expected = process.env.API_KEY || fallback;

  if (provided !== expected) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  try {
    const { bbb_profile_url, since } = req.body || {};
    if (!bbb_profile_url) {
      return res.status(400).json({ error: 'bbb_profile_url is required' });
    }

    const now = new Date().toISOString();

    return res.status(200).json({
      last_checked: now,
      new_reviews: [],
      alerts: []
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
