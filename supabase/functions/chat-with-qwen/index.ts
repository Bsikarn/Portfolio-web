/**
 * --------------------------------------------------------------------------
 * Supabase Edge Function: chat-with-qwen
 * --------------------------------------------------------------------------
 * RAG pipeline using Google Gemini only:
 * 1. Generate query embedding via gemini-embedding-001 (768 dim)
 * 2. Search relevant portfolio context via pgvector RPC
 * 3. Generate response via Gemini 2.0 Flash
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { message } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "No message provided." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const openRouterKey = Deno.env.get("OPENROUTER_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!geminiKey) throw new Error("Missing GEMINI_API_KEY in environment.");
    if (!openRouterKey) throw new Error("Missing OPENROUTER_API_KEY in environment.");

    // ── Step 1: Generate embedding (768 dim) ──────────────────────────────
    const embedRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/gemini-embedding-001",
          content: { parts: [{ text: message }] },
          outputDimensionality: 768, // Must match documents table vector(768)
        }),
      }
    );

    if (!embedRes.ok) {
      const err = await embedRes.text();
      throw new Error(`Gemini embedding failed (${embedRes.status}): ${err}`);
    }

    const embedData = await embedRes.json();
    const embedding = embedData?.embedding?.values;
    if (!embedding) throw new Error("No embedding values returned from Gemini.");

    // ── Step 2: Search portfolio context via pgvector ─────────────────────
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: documents, error: dbError } = await supabase.rpc("match_documents", {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 5,
    });

    if (dbError) {
      console.error("Supabase RPC Error:", dbError);
      throw new Error(`Failed to retrieve documents: ${dbError.message}`);
    }

    // ── Step 3: Build context from retrieved documents ────────────────────
    const contextText = documents?.length > 0
      ? documents.map((doc: any) => doc.content).join("\n\n")
      : "No specific context found within the portfolio.";

    // ── Step 4: Generate response with fallback across free models ────────
    // Free models on OpenRouter can be temporarily rate-limited (429).
    // We try each model in order until one succeeds.
    const FREE_MODELS = [
      "google/gemma-4-26b-a4b-it:free",
      "nvidia/nemotron-3-super-120b-a12b:free",
      "minimax/minimax-m2.5:free",
    ];

    const systemPrompt = `You are an AI assistant acting as the personal representative of a Computer Engineering student at KMUTNB.

IDENTITY:
- Full name (Thai): ศิริ์กาญจน์ ภัทรสิริมงคล
- Full name (English): Sikarn Pattarasirimongkol
- Nickname (Thai): บิ๊วท์
- Nickname (English): Beaut

LANGUAGE RULES:
- Default to English. Reply in English unless the user writes in Thai.
- When responding in ENGLISH: use "I", refer to yourself as "Beaut" if name is asked, and use the full name "Sikarn Pattarasirimongkol".
- When responding in THAI: use "หนู", feminine particles (ค่ะ/คะ), and use the full name "ศิริ์กาญจน์ ภัทรสิริมงคล" and nickname "บิ๊วท์". Project names and tool names can remain in English.

PERSONALITY RULES:
- You represent this person directly — say "I built..." / "My project..." not "Beaut's project..."
- Answer ONLY from the CONTEXT below. If info is not in context, say "ขออภัยค่ะ ตอนนี้หนูยังมีข้อมูลไม่เพียงพอที่จะตอบคำถามนี้" (when responding in Thai) or "I'm sorry, but I don't have enough information to answer this question right now." (when responding in English).
- Be concise and friendly. Do not fabricate or guess facts.
- CRITICAL: DO NOT output your internal thought process, reasoning, or analysis.
- DO NOT start your response with "Okay", "Let me check", or "The user is asking". Provide ONLY the direct final conversational response as the persona.

CONTEXT (from the portfolio database):
${contextText}`;

    let reply: string | null = null;

    for (const model of FREE_MODELS) {
      const chatRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://sikarn-portfolio.vercel.app",
          "X-Title": "Sikarn Portfolio AI Assistant",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          max_tokens: 512,
          temperature: 0.7,
        }),
      });

      if (!chatRes.ok) {
        const errBody = await chatRes.json().catch(() => ({}));
        const isRateLimit = chatRes.status === 429;
        console.warn(`Model ${model} failed (${chatRes.status}). Rate-limited: ${isRateLimit}`);
        if (isRateLimit) continue; // Try next model
        throw new Error(`OpenRouter chat failed (${chatRes.status}): ${JSON.stringify(errBody)}`);
      }

      const chatData = await chatRes.json();
      reply = chatData.choices?.[0]?.message?.content ?? null;
      if (reply) break; // Success — stop trying
    }

    if (!reply) throw new Error("All free models are currently unavailable. Please try again later.");

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Edge Function error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
