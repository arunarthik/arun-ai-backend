export default async function handler(req, res) {
  // ----- CORS -----
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // ----- Parse body -----
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!body || !body.message) {
      return res.status(400).json({ reply: "Missing message" });
    }

    const API_KEY = process.env.GEMINI_KEY;
    if (!API_KEY) {
      return res.status(500).json({ reply: "Missing GEMINI_KEY env var" });
    }

    // ----- Call Gemini -----
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are Arun's AI portfolio assistant. Answer briefly.\n\nUser: ${body.message}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        reply: data.error?.message || "Gemini API error"
      });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ reply: err.message });
  }
}
