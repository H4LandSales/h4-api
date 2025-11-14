export default async function handler(req, res) { 
  // Enforce POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  // Validate API key
  const incomingKey = req.headers["x-api-key"];
  const expectedKey = process.env.API_KEY;

  if (!incomingKey || incomingKey !== expectedKey) {
    return res.status(401).json({ error: "Invalid API key." });
  }

  // Parse request body
  const { profile_urls = [], lookback_days = 60 } = req.body || {};

  // Stub (fake) response — works right away
  const competitors = profile_urls.map((url) => ({
    url,
    posting_frequency: "unknown",
    themes: ["data not yet implemented"],
    top_posts: [
      {
        date: "N/A",
        content: "Stub response — real scraper not yet implemented.",
        engagement_score: 0
      }
    ]
  }));

  // Return JSON to GPT
  return res.status(200).json({
    analyzed_at: new Date().toISOString(),
    lookback_days,
    competitors
  });
}
