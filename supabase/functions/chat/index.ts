import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { GoogleGenerativeAI } from "npm:@google/generative-ai"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Missing message in request body" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') ?? ''

    if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
      throw new Error("Missing environment variables");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)
    const genAI = new GoogleGenerativeAI(geminiApiKey)

    // Generate embedding for user's message
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" })
    const embeddingResult = await embeddingModel.embedContent(message)
    const embedding = embeddingResult.embedding.values

    // Call match_documents RPC to find relevant context
    const { data: documents, error: matchError } = await supabaseClient.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.7, // Adjust threshold as needed
      match_count: 5
    })

    if (matchError) {
      throw matchError
    }

    // Construct prompt
    let contextText = ""
    if (documents && documents.length > 0) {
      contextText = documents.map((doc: any) => doc.content).join("\n\n")
    }

    const prompt = `You are Sikarn's helpful AI Assistant. You should respond in the first person, acting as Sikarn's assistant. Answer the user's question based on the following context. If the context does not contain the answer, politely say that you don't have that information. Do not invent information.

Context about Sikarn's portfolio:
${contextText}

User message: ${message}
`

    // Call Gemini chat completion
    const chatModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const chatResult = await chatModel.generateContent(prompt)
    const responseText = chatResult.response.text()

    return new Response(
      JSON.stringify({ reply: responseText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )
  } catch (error) {
    console.error("Error in chat edge function:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})
