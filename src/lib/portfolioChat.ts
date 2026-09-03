import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const getEnv = (key: string, fallback: string = ""): string => {
  try {
    if (typeof import.meta !== "undefined" && (import.meta as any).env) {
      if ((import.meta as any).env[`VITE_${key}`]) return (import.meta as any).env[`VITE_${key}`];
      if ((import.meta as any).env[key]) return (import.meta as any).env[key];
    }
  } catch (e) {}

  try {
    if (typeof process !== "undefined" && process.env) {
      if (process.env[`VITE_${key}`]) return process.env[`VITE_${key}`];
      if (process.env[key]) return process.env[key];
    }
  } catch (e) {}

  return fallback;
};

const SUPABASE_URL = getEnv("SUPABASE_URL");
const SUPABASE_ANON_KEY = getEnv("SUPABASE_ANON_KEY");
const SUPABASE_SERVICE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_ANON_KEY);
const GEMINI_KEY = getEnv("GEMINI_API_KEY");
const OPENROUTER_KEY = getEnv("OPENROUTER_API_KEY");

const OWNER_NAME = getEnv("PORTFOLIO_OWNER_NAME", "Sikarn Pattarasirimongkol");
const OWNER_EMAIL = getEnv("PORTFOLIO_OWNER_EMAIL", "sikarn.pat@gmail.com");
export const FALLBACK_MESSAGE = `ขออภัยด้วยนะคะ ในส่วนนี้หนูยังไม่มีข้อมูลเชิงลึก สามารถติดต่อสอบถามคุณ ${OWNER_NAME} โดยตรงได้ที่ ${OWNER_EMAIL} ได้เลยค่ะ`;

export function sanitizeQuery(input: string): string {
  if (!input || typeof input !== "string") return "";
  let sanitized = input.trim().slice(0, 500);
  sanitized = sanitized.replace(/<\|.*?\|>/g, "");
  sanitized = sanitized.replace(/(system:|user:|assistant:)/gi, "");
  return sanitized;
}

async function getQueryEmbedding(query: string, apiKey: string): Promise<number[]> {
  const modelNames = ["models/gemini-embedding-001", "models/gemini-embedding-2"];

  for (const modelName of modelNames) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:embedContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { parts: [{ text: query }] },
          outputDimensionality: 768,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.embedding?.values) {
          return data.embedding.values;
        }
      }
    } catch {
      // Continue trying next embedding model
    }
  }

  throw new Error("Gemini Embedding API unavailable or rate-limited.");
}

async function generateWithOpenRouter(systemPrompt: string, userQuery: string, apiKey: string): Promise<string> {
  const freeModels = [
    "openrouter/free",
    "google/gemma-4-31b-it:free",
    "google/gemma-4-26b-a4b-it:free",
    "inclusionai/ling-3.0-flash-fin:free",
    "z-ai/glm-5.2:free",
    "minimax/minimax-m3:free"
  ];

  for (const modelName of freeModels) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://portfolio-web.dev",
          "X-Title": "Portfolio RAG Assistant",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userQuery }
          ],
          temperature: 0.3,
          max_tokens: 800
        })
      });

      if (!res.ok) continue;

      const data = await res.json();
      const choice = data?.choices?.[0]?.message?.content;
      if (choice && choice.trim()) {
        return choice.trim();
      }
    } catch {
      // Try next free model
    }
  }

  throw new Error("All OpenRouter free models exhausted");
}

async function generateWithGemini(systemPrompt: string, userQuery: string, apiKey: string): Promise<string> {
  const ai = new GoogleGenerativeAI(apiKey);
  const model = ai.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent(userQuery);
  return result.response.text().trim();
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ProcessChatResponse {
  reply: string;
  sources?: { file_name: string; header_path: string; similarity: number }[];
}

export async function processPortfolioChat(userQuery: string): Promise<ProcessChatResponse> {
  const sanitized = sanitizeQuery(userQuery);
  if (!sanitized) {
    return { reply: "กรุณาระบุคำถามที่ต้องการสอบถามหนูได้เลยนะคะ" };
  }

  if (!SUPABASE_URL) {
    console.error("Missing SUPABASE_URL configuration.");
    return { reply: FALLBACK_MESSAGE };
  }

  let contextBlocks: string[] = [];

  if (GEMINI_KEY) {
    try {
      const queryVector = await getQueryEmbedding(sanitized, GEMINI_KEY);
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || SUPABASE_SERVICE_KEY);
      const { data: matchedDocs } = await supabase.rpc("match_portfolio_documents", {
        query_embedding: queryVector,
        match_threshold: 0.25,
        match_count: 3,
      });

      if (matchedDocs && matchedDocs.length > 0) {
        contextBlocks = matchedDocs.map(
          (d: { content: string; metadata?: { file_name?: string; header_path?: string } }, idx: number) =>
            `[Document Chunk ${idx + 1} - Source: ${d.metadata?.file_name || "Archive"} (${d.metadata?.header_path || "Section"})]\n${d.content}`
        );
      }
    } catch (embedErr: any) {
      console.warn("Vector embedding API unavailable. Using direct DB fallback:", embedErr.message);
    }
  }

  if (contextBlocks.length === 0) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || SUPABASE_SERVICE_KEY);
      const { data: projectsData } = await supabase
        .from("projects")
        .select("id, title, category, description, tags, tools, my_role, award")
        .limit(10);

      if (projectsData && projectsData.length > 0) {
        contextBlocks = projectsData.map(
          (p: any, idx: number) =>
            `[Project ${idx + 1}: ${p.title}]\n- Category: ${p.category || "General"}\n- Role: ${p.my_role || "Developer"}\n- Tech/Tools: ${Array.isArray(p.tags || p.tools) ? (p.tags || p.tools).join(", ") : p.tags || p.tools || "N/A"}\n- Description: ${p.description}\n- Award/Achievement: ${p.award || "N/A"}`
        );
      }
    } catch (dbErr) {
      console.error("Supabase projects table query error:", dbErr);
    }
  }

  if (contextBlocks.length === 0) {
    return { reply: FALLBACK_MESSAGE };
  }

  const contextText = contextBlocks.join("\n\n---\n\n");

  const systemPrompt = `คุณคือผู้ช่วย AI สาวสุดน่ารัก สุภาพ เป็นกันเอง ประจำ Portfolio ของคุณ ${OWNER_NAME}
จงตอบคำถามผู้ใช้โดยอ้างอิงเฉพาะจากบริบท (Context) ที่กำหนดให้ด้านล่างนี้เท่านั้น

ข้อบังคับสำคัญที่ต้องปฏิบัติตามอย่างเคร่งครัด:
1. ตอบเป็นภาษาไทยด้วยน้ำเสียงน่ารัก สุภาพ เป็นกันเอง และเป็นมืออาชีพ
2. ใช้สรรพนามแทนตัวเองว่า "หนู" เสมอ และลงท้ายประโยคด้วยคำว่า "คะ" หรือ "ค่ะ" อย่างถูกต้องตามหลักภาษาไทยเสมอ
3. ตอบเฉพาะข้อมูลที่มีระบุไว้ในบริบท (Context) เท่านั้น ห้ามเดาหรือสร้างข้อมูลที่ไม่ปรากฏในบริบทโดยเด็ดขาด
4. หากบริบทที่ให้ไว้ไม่มีข้อมูลเพียงพอที่จะตอบคำถาม ให้ตอบด้วยข้อความต่อไปนี้ทันทีโดยไม่ต้องเพิ่มคำอื่น:
"${FALLBACK_MESSAGE}"

Context:
${contextText}`;

  let responseText = "";

  if (OPENROUTER_KEY) {
    try {
      responseText = await generateWithOpenRouter(systemPrompt, sanitized, OPENROUTER_KEY);
    } catch (orErr: any) {
      console.warn("OpenRouter generation failed:", orErr.message);
    }
  }

  if (!responseText && GEMINI_KEY) {
    try {
      responseText = await generateWithGemini(systemPrompt, sanitized, GEMINI_KEY);
    } catch (gemErr: any) {
      console.error("Gemini API generation failed:", gemErr.message);
    }
  }

  return {
    reply: responseText || FALLBACK_MESSAGE,
  };
}
