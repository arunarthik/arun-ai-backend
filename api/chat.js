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
return res.status(500).json({ reply: "Missing GEMINI_KEY env var" });
}
// Load resume dynamically
const resumePath = path.join(process.cwd(), "data", "resume.json");
const resumeData = JSON.parse(fs.readFileSync(resumePath, "utf8"));
const resumeContext = `
Name: ${resumeData.name}
Title: ${resumeData.title}
Experience:
${resumeData.experience.map(e => `- ${e}`).join("\n")}
Skills:
${resumeData.skills.join(", ")}
Career:
${resumeData.career}

`;
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
text: `You are an AI assistant for Terugu Arun's 
professional portfolio.
Here is Arun's resume data:
${resumeContext}
Rules:- Always answer based on Arun's skills and experience- If asked about resume, projects, or skills, use the data above- Keep answers professional and concise
User question:
${body.message}`
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
