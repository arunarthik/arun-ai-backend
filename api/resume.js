import fs from "fs";
import path from "path";
export default function handler(req, res) {
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");
if (req.method === "OPTIONS") {
return res.status(200).end();
}
const resumePath = path.join(process.cwd(), "data", "resume.json");
try {
if (req.method === "GET") {
const data = fs.readFileSync(resumePath, "utf8");
return res.status(200).json(JSON.parse(data));
}
if (req.method === "POST") {
const body =
typeof req.body === "string" ? JSON.parse(req.body) : req.body;
fs.writeFileSync(resumePath, JSON.stringify(body, null, 2));
return res.status(200).json({ status: "Resume updated" });
}
return res.status(405).json({ error: "Method not allowed" });
} catch (err) {
return res.status(500).json({ error: err.message });
}
}
