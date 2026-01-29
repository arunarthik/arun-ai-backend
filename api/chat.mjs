export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let body = req.body;
    if (typeof body === 'string') {
        body = JSON.parse(body);
    }

    const { message } = body;
    const API_KEY = process.env.GEMINI_KEY;

    if (!API_KEY) throw new Error("GEMINI_KEY is missing in Vercel settings.");
    if (!message) throw new Error("No message received from frontend.");

    // Using v1beta with the specific gemini-1.5-flash model
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are a professional AI assistant for Terugu Arun's portfolio. Arun is a Software Developer specializing in C++, Python, and React. One of his key projects is a Deep Learning-based Mask Detection System. Answer this professionally and briefly: ${message}` }] }]
      })
    });

    const data = await response.json();
    
    // Check for specific API errors
    if (data.error) throw new Error(data.error.message);
    if (!data.candidates || !data.candidates[0]) throw new Error("The AI model is temporarily unavailable.");

    const botReply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: botReply });

  } catch (error) {
    // This will send the error message directly to your chat window for easy debugging
    res.status(200).json({ reply: `Backend Error: ${error.message}` });
  }
}
