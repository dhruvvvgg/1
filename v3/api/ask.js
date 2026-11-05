/* POST /api/ask  { question, pages: [{ title, href }] }  ->  { answer, links }
   Answers a prospective student's question using only the page list the site sends.
   Keys come from Vercel environment variables and never reach the browser:
     GEMINI_API_KEY   (optional GEMINI_MODEL, default gemini-3.8-flash)
     NVIDIA_API_KEY   (optional NVIDIA_MODEL, default nvidia/llama-3.1-nemotron-70b-instruct)
   Gemini is tried first, then NVIDIA, so either key alone is enough. */
"use strict";

const SYSTEM =
  "You answer questions from prospective students on a concept website for SRM Institute of Science and Technology (SRMIST), Kattankulathur, Chennai. " +
  "Use ONLY the pages listed in the message. Never state fees, dates, cut-offs, rankings, package figures or any other number. " +
  "If the list does not cover the question, say so in one sentence and point to https://www.srmist.edu.in/. " +
  "Write at most 60 words of warm plain text, no markdown. Then, on a final line, write LINKS: followed by up to three of the listed URLs, separated by ' | ', that best help.";

const hits = new Map(); // best-effort per-instance rate limit: 12 questions a minute per visitor
function limited(ip) {
  const now = Date.now(), recent = (hits.get(ip) || []).filter(t => now - t < 60000);
  recent.push(now); hits.set(ip, recent);
  if (hits.size > 500) for (const [k, v] of hits) if (!v.some(t => now - t < 60000)) hits.delete(k);
  return recent.length > 12;
}

const okHref = h => typeof h === "string" && h.length < 300 && (/^[a-z0-9][a-z0-9\-./?#=_%&]*$/i.test(h) || /^https:\/\/([a-z0-9-]+\.)*srmist\.edu\.in(\/|$)/i.test(h));

async function gemini(prompt) {
  const key = process.env.GEMINI_API_KEY; if (!key) return null;
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM }] }, contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 800, thinkingConfig: { thinkingBudget: 0 } } })
  });
  if (!r.ok) throw new Error("gemini " + r.status + " " + (await r.text()).slice(0, 300));
  const d = await r.json();
  return (d.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("").trim() || null;
}

async function nvidia(prompt) {
  const key = process.env.NVIDIA_API_KEY; if (!key) return null;
  const r = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
    body: JSON.stringify({ model: process.env.NVIDIA_MODEL || "nvidia/llama-3.1-nemotron-70b-instruct", temperature: 0.3, max_tokens: 400, messages: [{ role: "system", content: SYSTEM }, { role: "user", content: prompt }] })
  });
  if (!r.ok) throw new Error("nvidia " + r.status + " " + (await r.text()).slice(0, 300));
  const d = await r.json();
  return (d.choices?.[0]?.message?.content || "").trim() || null;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "POST only" }); }
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (limited(ip)) return res.status(429).json({ error: "Too many questions. Try again in a minute." });

  let body = req.body; if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = null; } }
  const question = body && typeof body.question === "string" ? body.question.trim().slice(0, 300) : "";
  const pages = Array.isArray(body && body.pages) ? body.pages.filter(p => p && typeof p.title === "string" && okHref(p.href)).slice(0, 80).map(p => ({ title: p.title.slice(0, 120), href: p.href })) : [];
  if (!question || !pages.length) return res.status(400).json({ error: "A question and the page list are required." });
  if (!process.env.GEMINI_API_KEY && !process.env.NVIDIA_API_KEY) return res.status(503).json({ error: "The assistant is not configured." });

  const prompt = "Pages:\n" + pages.map(p => `- ${p.title}: ${p.href}`).join("\n") + "\n\nQuestion: " + question;
  let text = null; const why = [];
  for (const provider of [gemini, nvidia]) {
    try { text = await provider(prompt); if (text === null) { console.error(provider.name + ": no key or empty reply"); why.push(provider.name + ": no key or empty reply"); } } catch (e) { console.error(provider.name + " failed:", e.message); why.push(e.message); text = null; }
    if (text) break;
  }
  if (!text) return res.status(502).json({ error: "The assistant could not answer just now.", detail: why }) /* TEMP debug */;

  const [answer, tail] = text.split(/\n?\s*LINKS:/i);
  const known = new Set(pages.map(p => p.href));
  const links = (tail || "").split("|").map(s => s.trim()).filter(h => known.has(h)).slice(0, 3);
  return res.status(200).json({ answer: answer.trim(), links });
};
