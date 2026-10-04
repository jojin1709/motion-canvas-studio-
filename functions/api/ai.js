// Cloudflare Pages Function: /api/ai
// Runs @cf/meta/llama-3.3-70b-instruct on Cloudflare Workers AI Edge
// Zero-data-retention & 100% ephemeral in-memory execution

export async function onRequestPost({ request, env }) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Check if Cloudflare AI binding exists
    if (!env.AI) {
      return new Response(JSON.stringify({ error: "Cloudflare AI binding not found" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const systemPrompt = `You are an expert motion graphics designer. Given the user prompt, return ONLY a strict JSON object with NO markdown formatting, NO backticks, and NO extra commentary.
Required JSON schema:
{
  "badge": "string (1-3 words uppercase category badge, e.g. FEATURE LAUNCH, VERSION 2.0, KEYNOTE, SYNTHWAVE)",
  "title": "string (2-4 words uppercase headline)",
  "subtitle": "string (5-12 words supporting tagline)",
  "style": "silk" | "solar" | "aurora" | "cyber" | "chrome" | "obsidian" | "prism" | "warp",
  "accent": "hex_color_code (e.g. #6366f1, #06b6d4, #f59e0b, #ec4899, #10b981)",
  "font": "Plus Jakarta Sans" | "Space Grotesk" | "Outfit" | "Syne" | "Cinzel" | "JetBrains Mono",
  "motion": "fade-rise" | "scale-pop" | "kinetic-drift" | "glitch-flash"
}`;

    const response = await env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate video scene design for: ${prompt}` }
      ],
      temperature: 0.5,
      max_tokens: 250
    });

    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
