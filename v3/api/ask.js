/* POST /api/ask  { question }  ->  { answer, sources: [{ title, url }], online }
   Answers a prospective student's question from a live Google Search first (Gemini with search grounding),
   then from NVIDIA's model without search if Gemini is unavailable.
   Keys come from Vercel environment variables and never reach the browser:
     GEMINI_API_KEY   (optional GEMINI_MODEL to pin one model)
     NVIDIA_API_KEY   (optional NVIDIA_MODEL to pin one model)
   The site falls back to its own quoted passages when this returns an error. */
"use strict";

const SYSTEM =
  "You answer questions from prospective students and parents about SRM Institute of Science and Technology (SRMIST), Kattankulathur, Chennai, India. " +
  "Search the web and prefer the official site srmist.edu.in and other official sources. " +
  "Only state a fee, date, cut-off, ranking or other figure if a source you found states it, and say which year it applies to. " +
  "If you cannot find a reliable answer, say so in one sentence and suggest srmist.edu.in or the admissions office. " +
  "Write at most 120 words of plain text, no markdown, no bullet symbols.";

const SYSTEM_OFFLINE = SYSTEM.replace("Search the web and prefer", "You cannot search the web. Point to").replace(
  "Only state a fee, date, cut-off, ranking or other figure if a source you found states it, and say which year it applies to.",
  "Never state fees, dates, cut-offs, rankings or other figures; send the reader to srmist.edu.in for them.");

const hits = new Map(); // best-effort per-instance rate limit: 12 questions a minute per visitor
function limited(ip) {
  const now = Date.now(), recent = (hits.get(ip) || []).filter(t => now - t < 60000);
  recent.push(now); hits.set(ip, recent);
  if (hits.size > 500) for (const [k, v] of hits) if (!v.some(t => now - t < 60000)) hits.delete(k);
  return recent.length > 12;
}

const wait = ms => new Promise(r => setTimeout(r, ms));
const clean = t => t.replace(/<think>[\s\S]*?<\/think>/g, "").replace(/\*\*|__|^#+\s*/gm, "").replace(/\[\d+(,\s*\d+)*\]/g, "").trim();

const GEMINI_MODELS = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-2.5-flash-lite"];
const NVIDIA_MODELS = ["nvidia/nemotron-nano-3-30b-a3b", "nvidia/nemotron-3-super-120b-a12b"];

async function gemini(question) {
  const key = process.env.GEMINI_API_KEY; if (!key) return null;
  const errors = [];
  for (const model of process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : GEMINI_MODELS) {
    const call = () => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: "user", parts: [{ text: "Question about SRMIST: " + question }] }],
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 2048 }
      })
    });
    let r = await call();
    if (r.status === 503 || r.status === 429) { await wait(600); r = await call(); }
    if (!r.ok) { errors.push(model + " " + r.status); continue; }
    const d = await r.json(), c = d.candidates?.[0];
    const text = clean((c?.content?.parts || []).filter(p => !p.thought).map(p => p.text || "").join(""));
    if (!text) { errors.push(model + " empty"); continue; }
    const seen = new Set();
    const sources = (c.groundingMetadata?.groundingChunks || []).map(g => g.web).filter(w => w && /^https:\/\//.test(w.uri))
      .filter(w => !seen.has(w.title) && seen.add(w.title)).slice(0, 4).map(w => ({ title: String(w.title || "Source").slice(0, 120), url: w.uri }));
    return { answer: text, sources, online: true };
  }
  throw new Error("gemini: " + errors.join(", "));
}

async function nvidia(question) {
  const key = process.env.NVIDIA_API_KEY; if (!key) return null;
  const errors = [];
  for (const model of process.env.NVIDIA_MODEL ? [process.env.NVIDIA_MODEL] : NVIDIA_MODELS) {
    const r = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify({ model, temperature: 0.2, max_tokens: 1200, messages: [{ role: "system", content: SYSTEM_OFFLINE }, { role: "user", content: question }] })
    });
    if (!r.ok) { errors.push(model + " " + r.status); continue; }
    const d = await r.json();
    const text = clean(d.choices?.[0]?.message?.content || "");
    if (text) return { answer: text, sources: [{ title: "srmist.edu.in", url: "https://www.srmist.edu.in/" }], online: false };
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
  if (!question) return res.status(400).json({ error: "A question is required." });
  if (!process.env.GEMINI_API_KEY && !process.env.NVIDIA_API_KEY) return res.status(503).json({ error: "The assistant is not configured." });

  for (const provider of [gemini, nvidia]) {
    try { const out = await provider(question); if (out) return res.status(200).json(out); }
    catch (e) { console.error(provider.name + " failed:", e.message); }
  }
  return res.status(502).json({ error: "The assistant could not answer just now." });
};
