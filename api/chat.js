export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);

    const { message } = body;
    const API_KEY = process.env.GEMINI_KEY;

    // Use v1beta and the specific gemini-1.5-flash model name
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are an AI assistant for Terugu Arun's portfolio. Answer briefly: ${message}` }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) throw new Error(data.error.message);
    
    const botReply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: botReply });

  } catch (error) {
    res.status(200).json({ reply: `Error: ${error.message}` });
  }
}
