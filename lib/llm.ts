const SYSTEM_PROMPT =
  "You are a business analyst. Summarize the following website content into a clear, structured business context description. Do not use markdown or any formatting symbols. Use plain text only with line breaks between sections. Use the following structure:\n\n" +
  "What the business sells: [one sentence]\n" +
  "Key products/services: [2-4 short lines, each starting with a dash]\n" +
  "Policies found: [shipping, returns, support hours — or 'None mentioned on website']\n" +
  "Customer support context: [anything about hours, contact methods, FAQ topics]\n" +
  "Other useful details: [promotions, target audience, unique value props, etc.]\n\n" +
  "If a section has no information, write 'Not mentioned on the website.' Be concise but complete. No markdown, no asterisks, no bold formatting.";

type LLMProvider = "fireworks" | "gemini";

function getProvider(): LLMProvider {
  const p = (process.env.LLM_PROVIDER ?? "fireworks").toLowerCase();
  return p === "gemini" ? "gemini" : "fireworks";
}

async function callFireworks(content: string): Promise<string> {
  const apiKey = process.env.FIREWORKS_API_KEY;
  if (!apiKey) throw new Error("FIREWORKS_API_KEY not set");

  const res = await fetch(
    "https://api.fireworks.ai/inference/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "accounts/fireworks/models/llama-v3-70b-instruct",
        temperature: 0.2,
        max_tokens: 2048,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: content.slice(0, 15000) },
        ],
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Fireworks API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callGemini(content: string): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY not set");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: SYSTEM_PROMPT }, { text: content.slice(0, 15000) }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
        },
      }),
    },
  );

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error(
        "Gemini free tier quota exceeded. Set LLM_PROVIDER=fireworks in .env.local and add your FIREWORKS_API_KEY, or wait a minute and try again.",
      );
    }
    const body = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export async function summarize(text: string): Promise<string> {
  const provider = getProvider();
  return provider === "gemini" ? callGemini(text) : callFireworks(text);
}


// https://www.allbirds.com/