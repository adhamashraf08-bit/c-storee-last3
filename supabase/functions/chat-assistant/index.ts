// @ts-expect-error Deno resolves this URL at runtime (Supabase Edge Functions)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

declare const Deno: { env: { get(key: string): string | undefined } };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GROQ_MODEL = "llama-3.3-70b-versatile";
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

function buildSystemPrompt(context: { summary?: unknown }): string {
  return `You are C Store Assistant, a bilingual AI assistant for the C Store Online Sales Dashboard. You help analyze sales data and answer questions in Arabic, English, and Franco-Arabic (3arabeezy/Franco).

CRITICAL LANGUAGE RULES:
- If user writes in Arabic, respond in Arabic
- If user writes in English, respond in English
- If user writes in Franco (like "ezayak", "mabee3at", etc.), respond in Franco-Arabic
- Be natural and conversational in the chosen language

BUSINESS CONTEXT:
- C Store is an online retail business with 4 branches: Dark Store, Maadi, Masr El Gededa, Tagamo3
- Each branch has 4 sales channels: Talabat, Instashop, Call Center, Website & App
- KPIs tracked: Total Sales (EGP), Number of Orders, Target Value, Achievement %

CURRENT DATA SUMMARY:
${context?.summary ? JSON.stringify(context.summary, null, 2) : 'No data available yet. Please ask the user to upload an Excel file.'}

RESPONSE GUIDELINES:
1. Always provide specific numbers when available
2. Format currency as EGP with proper thousands separators
3. Compare actual vs target when relevant
4. Highlight best/worst performers when asked
5. Be concise but informative
6. Use emojis sparingly for clarity (📈 for growth, 📉 for decline, ✅ for target met, etc.)

If no data is available, politely explain that data needs to be uploaded first.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, conversationHistory } = await req.json();
    const systemPrompt = buildSystemPrompt(context || {});

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({
          response:
            "مفيش Groq API key. أضف GROQ_API_KEY في إعدادات الدالة (Edge Function secrets). مجاني من console.groq.com 🙏",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...(conversationHistory || []).map((m: { role: string; content: string }) => ({
        role: (m.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    const url = "https://api.groq.com/openai/v1/chat/completions";
    const body = JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    let response: Response | null = null;
    let lastText = "";
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
      response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body,
      });
      lastText = await response.text();
      if (response!.status !== 429) break;
    }

    if (!response!.ok) {
      if (response!.status === 429) {
        return new Response(
          JSON.stringify({
            response:
              "الطلب كتير النهاردة، جرب تاني بعد دقيقة. (Rate limit – try again in a minute.) 🙏",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("Groq API error:", response!.status, lastText);
      return new Response(
        JSON.stringify({
          response: "عذراً، حصل مشكلة. جرب تاني أو تأكد من Groq API key. 🙏",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = JSON.parse(lastText || "{}");
    const assistantResponse =
      data.choices?.[0]?.message?.content?.trim() || "عذراً، لم أفهم السؤال. ممكن تسأل تاني؟";

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat assistant error:", error);
    return new Response(
      JSON.stringify({
        response: "عذراً، حصل مشكلة تقنية. جرب تاني بعد شوية. 🙏",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
