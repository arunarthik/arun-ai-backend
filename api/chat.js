export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // EXIT IMMEDIATELY FOR PREFLIGHT
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { message } = body || {};
    if (!message) throw new Error("No message provided");

    const API_KEY = process.env.GEMINI_KEY;
    if (!API_KEY) throw new Error("Missing GEMINI_KEY");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: `You are Arun's AI portfolio assistant. Answer briefly.\n\nUser: ${message}` }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Gemini API failed");
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({ reply: "Server error: " + err.message });
  }
}
