/* POST /api/ask  { question, pages: [{ title, href }] }  ->  { answer, links }
   Answers a prospective student's question using only the page list the site sends.
   Keys come from Vercel environment variables and never reach the browser:
     GEMINI_API_KEY   (optional GEMINI_MODEL to pin one model)
     NVIDIA_API_KEY   (optional NVIDIA_MODEL to pin one model)
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

const wait = ms => new Promise(r => setTimeout(r, ms));

// Each provider walks a short list of models: a stable alias first, then smaller or older ones, so one overloaded model never blocks an answer.
const GEMINI_MODELS = ["gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-2.5-flash-lite"];
const NVIDIA_MODELS = ["nvidia/nemotron-nano-3-30b-a3b", "nvidia/nemotron-3-super-120b-a12b"];

async function gemini(prompt) {
  const key = process.env.GEMINI_API_KEY; if (!key) return null;
  const errors = [];
  for (const model of process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : GEMINI_MODELS) {
    const call = () => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM }] }, contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 1200 } })
    });
    let r = await call();
    if (r.status === 503 || r.status === 429) { await wait(600); r = await call(); } // Google sheds load in short spikes
    if (!r.ok) { errors.push(model + " " + r.status); continue; }
    const d = await r.json();
    const text = (d.candidates?.[0]?.content?.parts || []).filter(p => !p.thought).map(p => p.text || "").join("").trim();
    if (text) return text;
    errors.push(model + " empty");
  }
  throw new Error("gemini: " + errors.join(", "));
}

async function nvidia(prompt) {
  const key = process.env.NVIDIA_API_KEY; if (!key) return null;
  const errors = [];
  for (const model of process.env.NVIDIA_MODEL ? [process.env.NVIDIA_MODEL] : NVIDIA_MODELS) {
    const r = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify({ model, temperature: 0.3, max_tokens: 1200, messages: [{ role: "system", content: SYSTEM }, { role: "user", content: prompt }] })
    });
    if (!r.ok) { errors.push(model + " " + r.status); continue; }
    const d = await r.json();
    const text = (d.choices?.[0]?.message?.content || "").replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    if (text) return text;
    errors.push(model + " empty");
  }
  throw new Error("nvidia: " + errors.join(", "));
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
