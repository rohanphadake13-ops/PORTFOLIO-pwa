// api/quote.js
const fetch = require("node-fetch");

module.exports = async (req, res) => {
  try {
    const { symbols } = req.query;
    if (!symbols) return res.status(400).json({ error: "symbols required" });

    const TD_API_KEY = process.env.TD_API_KEY;
    if (!TD_API_KEY) return res.status(500).json({ error: "API key missing on server" });

    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols)}&format=json&apikey=${TD_API_KEY}`;
    const r = await fetch(url);
    const j = await r.json();

    const out = {};
    if (Array.isArray(j)) {
      j.forEach(item => { if (item && item.symbol) out[item.symbol] = item; });
    } else {
      if (j.symbol) out[j.symbol] = j;
      else Object.assign(out, j);
    }

    res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate");
    res.status(200).json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "fetch failed" });
  }
};
