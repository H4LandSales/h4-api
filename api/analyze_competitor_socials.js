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

  // Helper to extract <title> and meta description / og:description
  function extractMeta(html) {
    let title = "";
    let description = "";

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }

    const descMatch =
      html.match(
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i
      ) ||
      html.match(
        /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["'][^>]*>/i
      );

    if (descMatch && descMatch[1]) {
      description = descMatch[1].trim();
    }

    return { title, description };
  }

  // Very simple keyword extractor from text
  function extractThemes(text, max = 8) {
    if (!text) return [];

    const stopwords = new Set([
      "the", "and", "for", "with", "this", "that", "your",
      "from", "about", "into", "over", "land", "acre", "acres"
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w && !stopwords.has(w));

    const counts = {};
    for (const w of words) {
      counts[w] = (counts[w] || 0) + 1;
    }

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, max)
      .map(([w]) => w);

    return sorted;
  }

  const competitors = [];

  for (const url of profile_urls) {
    try {
      const response = await fetch(url, { method: "GET" });
      if (!response.ok) {
        competitors.push({
          url,
          posting_frequency: "unknown",
          themes: ["fetch_failed", `status_${response.status}`],
          top_posts: []
        });
        continue;
      }

      const html = await response.text();
      const { title, description } = extractMeta(html);
      const textForThemes = [title, description].filter(Boolean).join(" ");
      const themes = extractThemes(textForThemes);

      competitors.push({
        url,
        posting_frequency: "unknown", // Placeholder; can be upgraded later
        themes: themes.length ? themes : ["no_clear_themes_found"],
        top_posts: [] // Placeholder; can be upgraded per platform later
      });
    } catch (err) {
      competitors.push({
        url,
        posting_frequency: "unknown",
        themes: ["error_fetching_page"],
        top_posts: []
      });
    }
  }

  // Return JSON to GPT
  return res.status(200).json({
    analyzed_at: new Date().toISOString(),
    lookback_days,
    competitors
  });
}
