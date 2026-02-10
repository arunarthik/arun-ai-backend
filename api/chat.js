import fs from "fs";
import path from "path";
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!body?.message) {
      return res.status(400).json({ reply: "Missing message" });
    }

    const API_KEY = process.env.GEMINI_KEY;
    if (!API_KEY) {
      return res.status(500).json({ reply: "Missing GEMINI_KEY" });
    }

    // 🔥 Fetch latest resume from your own API
    const resumeRes = await fetch(
      "https://arun-ai-backend.vercel.app/api/resume"
    );
    const resume = await resumeRes.json();

    // 🔥 Convert structured JSON → readable context
    const resumeContext = `
Name: ${resume.name}
Title: ${resume.title}

Experience:
${resume.experience.map(e => `- ${e}`).join("\n")}

Skills:
${resume.skills.join(", ")}

Career Goal:
${resume.career}
`;

    // 🔥 Call Gemini with dynamic context
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `
You are an AI assistant for Terugu Arun's professional portfolio.

Use ONLY the resume data below to answer.

${resumeContext}

User question:
${body.message}
`
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
        reply: data.error?.message || "Gemini error"
      });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("CHAT ERROR:", err);
    return res.status(500).json({ reply: err.message });
  }
}
