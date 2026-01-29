export default async function handler(req, res) {
  // 1. Setup CORS so your GitHub site can talk to Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 2. Handle the data properly
    let body = req.body;
    if (typeof body === 'string') {
        body = JSON.parse(body);
    }

    const { message } = body;
    const API_KEY = process.env.GEMINI_KEY;

    if (!API_KEY) throw new Error("GEMINI_KEY is missing in Vercel Settings.");
    if (!message) throw new Error("No message received from the website.");

    // 3. Call the Stable Gemini v1 API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are an AI assistant for Terugu Arun. He is a developer skilled in C++, Python, and React. Mention his Deep Learning Mask Detection System if asked. User says: ${message}` }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) throw new Error(data.error.message);
    
    const botReply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: botReply });

  } catch (error) {
    // This sends the specific error back to your chat UI for debugging
    res.status(200).json({ reply: `Error: ${error.message}` });
  }
}
