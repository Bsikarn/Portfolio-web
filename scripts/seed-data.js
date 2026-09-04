/**
 * seed-data.js
 * ---------------------------------------------------------------------------
 * Pulls real portfolio data directly from Supabase (projects + settings),
 * generates 768-dim vector embeddings via Gemini text-embedding-004 REST API,
 * then upserts them into the `documents` table for RAG-based AI assistant.
 *
 * Run: node scripts/seed-data.js
 * ---------------------------------------------------------------------------
 */

import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// ── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_KEY   = process.env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SERVICE_KEY || !GEMINI_KEY) {
  console.error("❌  Missing env vars. Check VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ── Embed via Gemini REST API (768 dimensions) ───────────────────────────────
async function embed(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/gemini-embedding-001",
      content: { parts: [{ text }] },
      outputDimensionality: 768, // Reduce from 3072 → 768 for HNSW index compatibility
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API ${res.status}: ${err}`);
  }

  const json = await res.json();
  const values = json?.embedding?.values;
  if (!values) throw new Error("No embedding values returned from Gemini.");
  return values;
}

// ── Build flat text documents from DB data ────────────────────────────────────
function buildDocuments(projects, settings) {
  const docs = [];

  // 1. About Me
  const about = settings?.about_me || {};
  if (about.name) {
    docs.push({
      title: "About Sikarn",
      content: [
        `Name: ${about.name}`,
        `Role: ${about.role || ""}`,
        `Intro: ${about.intro || ""}`,
        `Education: ${about.education || ""}`,
        `GPAX: ${about.gpax || about.gpa || ""}`,
        `Languages: ${Array.isArray(about.languages) ? about.languages.join(", ") : (about.languages || "")}`,
      ].filter((l) => !l.endsWith(": ")).join("\n"),
    });
  }

  // 2. Contact Links
  const cl = settings?.contact_links || {};
  docs.push({
    title: "Contact Information",
    content: [
      cl.email         ? `Email: ${cl.email}` : "",
      cl.github_url    ? `GitHub: ${cl.github_url} (Handle: ${cl.github_handle || ""})` : "",
      cl.linkedin_url  ? `LinkedIn: ${cl.linkedin_url} (Handle: ${cl.linkedin_handle || ""})` : "",
      cl.resume_url    ? `Resume/CV URL: ${cl.resume_url}` : "",
      cl.portfolio_url ? `Portfolio URL: ${cl.portfolio_url}` : "",
    ].filter(Boolean).join("\n"),
  });

  // 3. Each project / achievement / activity
  for (const p of projects) {
    const lines = [
      `Title: ${p.title}`,
      `Category: ${p.category}`,
      p.year            ? `Year: ${p.year}` : "",
      p.description     ? `Description: ${p.description}` : "",
      p.my_role         ? `My Role: ${p.my_role}` : "",
      p.problem         ? `Problem: ${p.problem}` : "",
      p.solution        ? `Solution: ${p.solution}` : "",
      p.results_impact  ? `Results & Impact: ${p.results_impact}` : "",
      p.key_learnings   ? `Key Learnings: ${p.key_learnings}` : "",
      p.tags?.length    ? `Technologies: ${p.tags.join(", ")}` : "",
      p.tools?.length   ? `Tools: ${p.tools.join(", ")}` : "",
      p.features?.length ? `Features: ${p.features.join(" | ")}` : "",
      p.award?.title    ? `Award: ${p.award.title}` : "",
      p.award?.competition ? `Competition: ${p.award.competition}` : "",
      p.award?.description ? `Award Description: ${p.award.description}` : "",
      p.link_url        ? `Live Link: ${p.link_url}` : "",
      p.github_url      ? `GitHub: ${p.github_url}` : "",
    ].filter(Boolean);

    docs.push({ title: p.title, content: lines.join("\n") });
  }

  return docs;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("📡  Fetching data from Supabase...");

  const [{ data: projects, error: projErr }, { data: settings, error: settErr }] = await Promise.all([
    supabase.from("projects").select("*"),
    supabase.from("portfolio_settings").select("*").eq("id", 1).single(),
  ]);

  if (projErr) { console.error("❌  Projects fetch failed:", projErr.message); process.exit(1); }
  if (settErr) console.warn("⚠️  Settings fetch failed (non-fatal):", settErr.message);

  const docs = buildDocuments(projects || [], settings);
  console.log(`✅  Built ${docs.length} documents.\n`);

  // Clear all old documents first
  console.log("🗑️   Clearing old documents table...");
  await supabase.from("documents").delete().neq("id", 0);

  // Embed and insert each one
  let success = 0, failed = 0;
  for (const doc of docs) {
    process.stdout.write(`⏳  "${doc.title}"...`);
    try {
      const text = `Title: ${doc.title}\n${doc.content}`;
      const embedding = await embed(text);

      const { error } = await supabase.from("documents").insert({
        content: text,
        metadata: { title: doc.title },
        embedding,
      });

      if (error) {
        console.log(` ❌  DB insert: ${error.message}`);
        failed++;
      } else {
        console.log(" ✅");
        success++;
      }
    } catch (err) {
      console.log(` ❌  ${err.message}`);
      failed++;
    }
  }

  console.log(`\n🎉  Done! ${success} succeeded, ${failed} failed.`);
}

main();
