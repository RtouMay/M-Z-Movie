export default async function handler(req, res) {
  try {
    const q = (req.query.q || "").toString();
    if (!q) return res.status(400).json({ error: "Missing q" });

    const key = process.env.YOUTUBE_API_KEY;
    if (!key) return res.status(500).json({ error: "Missing YOUTUBE_API_KEY" });

    const url =
      "https://www.googleapis.com/youtube/v3/search" +
      `?part=snippet&type=video&maxResults=12&q=${encodeURIComponent(q)}&key=${encodeURIComponent(key)}`;

    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok) {
      return res.status(502).json({ error: "YouTube request failed", detail: data });
    }
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
}
