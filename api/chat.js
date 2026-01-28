export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 1. Manually check req.body. Sometimes Vercel needs help parsing JSON
    let body = req.body;
    if (typeof body === 'string') {
        body = JSON.parse(body);
    }

    const { message } = body;
    const API_KEY = process.env.GEMINI_KEY;

    if (!API_KEY) throw new Error("GEMINI_KEY is missing in Vercel settings.");
    if (!message) throw new Error("No message received from frontend.");

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are an AI assistant for Terugu Arun. Answer briefly: ${message}` }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) throw new Error(data.error.message);

    const botReply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: botReply });

  } catch (error) {
    // This sends the actual error back to your chat window so you can see it!
    res.status(200).json({ reply: `Backend Error: ${error.message}` });
  }
}
