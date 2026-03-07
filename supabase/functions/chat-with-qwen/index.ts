/**
 * --------------------------------------------------------------------------
 * Supabase Edge Function: chat-with-qwen
 * --------------------------------------------------------------------------
 * This Edge Function handles incoming user chat prompts, converts the 
 * message into an embedding vector using the lightweight Supabase/gte-small 
 * model via @xenova/transformers directly within Deno, searches for relevant 
 * context in the Supabase PostgreSQL database using pgvector and an RPC call, 
 * and uses OpenRouter's API (specifically a free Qwen model) to generate 
 * a context-aware response.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0";

// CORS headers to ensure the API can be called from the frontend web apps
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// We will load the model just once globally per cold start
let generateEmbedding: any = null;

// The Supabase/gte-small model is small enough to run natively in Edge!
const initModel = async () => {
    if (!generateEmbedding) {
        // We use feature-extraction to generate text embeddings
        generateEmbedding = await pipeline('feature-extraction', 'Supabase/gte-small');
    }
};

serve(async (req) => {
    // 1. Handle preflight CORS requests implicitly
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 2. Parse the request payload expecting a 'message'
        const { message } = await req.json();

        if (!message) {
            return new Response(JSON.stringify({ error: "No message provided." }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 3. Generate query embedding locally at the Edge
        await initModel();

        // Convert message to vector. We pool='mean' to get a single vector per phrase
        // and normalize=true for cosine distance calculations.
        const output = await generateEmbedding(message, {
            pooling: 'mean',
            normalize: true,
        });

        // Output comes as a Float32Array nested inside the response
        const embedding = Array.from(output.data);

        // 4. Connect to Supabase to retrieve matching portfolio documents
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Call our RPC function. Ensure match_threshold and match_count are tuned cleanly.
        const { data: documents, error: dbError } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.75, // Adjust this threshold if needed
            match_count: 5,        // Get the top 5 most relevant documents
        });

        if (dbError) {
            console.error("Supabase RPC Error:", dbError);
            throw new Error(`Failed to retrieve documents: ${dbError.message}`);
        }

        // 5. Build our context string from the retrieved documents
        let contextText = '';
        if (documents && documents.length > 0) {
            contextText = documents.map((doc: any) => doc.content).join('\n\n');
        } else {
            contextText = "No specific context found within the portfolio.";
        }

        // 6. Connect to OpenRouter API (Free Qwen Model)
        const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');
        if (!openRouterKey) {
            throw new Error("Missing OpenRouter API KEY in EnvVars.");
        }

        const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openRouterKey}`,
                "Content-Type": "application/json",
                // Optional headers for OpenRouter stats
                "HTTP-Referer": "https://sikarn-portfolio.vercel.app",
                "X-Title": "Beaut Portfolio Chatbot"
            },
            body: JSON.stringify({
                model: "qwen/qwen-2.5-72b-instruct:free",
                messages: [
                    {
                        role: "system",
                        // Pass background instructions and context to the AI
                        content: `You are an AI assistant representing Sikarn, a full-stack developer.
Respond to the user's questions about Sikarn using the following context context retrieved from the database. 
If the answer is not in the context, be polite and say you don't know, or use general programming knowledge appropriately.
Be concise, helpful, and friendly.

CONTEXT (Database retrieved details):
${contextText}
`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ]
            })
        });

        // 7. Parse AI responses
        if (!openRouterResponse.ok) {
            const errorBody = await openRouterResponse.text();
            console.error("OpenRouter API Failed:", errorBody);
            throw new Error(`OpenRouter API responded with status ${openRouterResponse.status}`);
        }

        const openRouterData = await openRouterResponse.json();
        const aiMessage = openRouterData.choices[0].message.content;

        // 8. Return the generated answer back to our Frontend
        return new Response(JSON.stringify({ reply: aiMessage }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error("Function encountered an error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
