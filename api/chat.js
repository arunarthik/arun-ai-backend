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

    // UPDATED URL: Using v1 instead of v1beta and the standard model name
    // UPDATED URL: Using v1 with the specific flash-latest model name
const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        contents: [{ parts: [{ text: `You are an AI assistant for Terugu Arun. Answer briefly: ${message}` }] }]
    })
    });

    const data = await response.json();
    
    // Safety check for the specific structure of the Gemini response
    if (data.error) throw new Error(data.error.message);
    if (!data.candidates || !data.candidates[0]) throw new Error("AI returned an empty response.");

    const botReply = data.candidates[0].content.parts[0].text;
    res.status(200).json({ reply: botReply });

  } catch (error) {
    res.status(200).json({ reply: `Backend Error: ${error.message}` });
  }
}
