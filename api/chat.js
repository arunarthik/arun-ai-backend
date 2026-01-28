// api/chat.js
export default async function handler(req, res) {
  // 1. Set Headers to allow your GitHub site to talk to this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message } = req.body;
  const API_KEY = process.env.GEMINI_KEY; // We will set this in Vercel settings

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are an assistant for Arun. Arun's skills: C++, Python, React. Answer this: ${message}` }] }]
      })
    });

    const data = await response.json();
    const botReply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: botReply });
  } catch (error) {
    res.status(500).json({ error: "Failed to connect to AI" });
  }
}
