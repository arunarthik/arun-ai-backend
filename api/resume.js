import fs from "fs";
import path from "path";
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const GIST_ID = process.env.GIST_ID;
  const TOKEN = process.env.GITHUB_TOKEN;

  if (!GIST_ID || !TOKEN) {
    return res.status(500).json({ error: "Missing GIST_ID or GITHUB_TOKEN" });
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `token ${TOKEN}`
  };

  try {
    // ----- READ RESUME -----
    if (req.method === "GET") {
      const r = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        headers
      });
      const data = await r.json();
      const file = data.files["resume.json"];
      return res.status(200).json(JSON.parse(file.content));
    }

    // ----- WRITE RESUME -----
    if (req.method === "POST") {
      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;

      const payload = {
        files: {
          "resume.json": {
            content: JSON.stringify(body, null, 2)
          }
        }
      };

      const r = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload)
      });

      if (!r.ok) {
        const err = await r.text();
        throw new Error(err);
      }

      return res.status(200).json({ status: "Resume updated" });
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    console.error("RESUME API ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
