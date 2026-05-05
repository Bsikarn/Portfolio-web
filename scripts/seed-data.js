import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
  console.error("Missing required environment variables. Please check .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

async function main() {
  try {
    const dataPath = path.resolve(__dirname, '../portfolio-data.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    for (const item of data) {
      console.log(`Processing: ${item.title}`);
      const textToEmbed = `Title: ${item.title}\nContent: ${item.content}`;
      
      const result = await model.embedContent(textToEmbed);
      const embedding = result.embedding.values;
      
      const { error } = await supabase.from('documents').insert({
        content: textToEmbed,
        metadata: { title: item.title, url: item.url },
        embedding: embedding
      });
      
      if (error) {
        console.error(`Error inserting ${item.title}:`, error.message);
      } else {
        console.log(`Successfully inserted ${item.title}`);
      }
    }
    
    console.log("Data ingestion completed.");
  } catch (error) {
    console.error("Error during ingestion:", error);
  }
}

main();
