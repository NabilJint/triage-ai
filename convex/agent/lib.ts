const GEMA_MODEL = process.env.FIREWORKS_MODEL ?? "accounts/fireworks/models/llama-v3p3-70b-instruct";
const GEMINI_MODEL = "gemini-3.5-flash";

type LLMProvider = "fireworks" | "gemini" | "gemma";

function getProvider(): LLMProvider {
  const p = (process.env.LLM_PROVIDER ?? "gemma").toLowerCase();
  if (p === "gemini") return "gemini";
  if (p === "fireworks") return "fireworks";
  return "gemma";
}

async function callGemma(
  system: string,
  user: string,
): Promise<{ text: string; modelUsed: string }> {
  const apiKey = process.env.FIREWORKS_API_KEY;
  if (!apiKey) {
    throw new Error("Gemma 4 not configured: FIREWORKS_API_KEY is missing");
  }

  const res = await fetch(
    "https://api.fireworks.ai/inference/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GEMA_MODEL,
        temperature: 0.3,
        max_tokens: 1024,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemma 4 API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content ?? "",
    modelUsed: GEMA_MODEL,
  };
}

async function callFireworks(
  system: string,
  user: string,
): Promise<{ text: string; modelUsed: string }> {
  const apiKey = process.env.FIREWORKS_API_KEY;
  if (!apiKey) {
    throw new Error("LLM not configured: FIREWORKS_API_KEY is missing");
  }

  const res = await fetch(
    "https://api.fireworks.ai/inference/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GEMA_MODEL,
        temperature: 0.3,
        max_tokens: 1024,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Fireworks API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content ?? "",
    modelUsed: GEMA_MODEL,
  };
}

async function callGemini(
  system: string,
  user: string,
): Promise<{ text: string; modelUsed: string }> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("LLM not configured: GOOGLE_API_KEY is missing");
  }

  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ parts: [{ text: user }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
        }),
      },
    );

    if (res.ok) {
      const data = await res.json();
      return {
        text: data.candidates?.[0]?.content?.parts?.[0]?.text ?? "",
        modelUsed: GEMINI_MODEL,
      };
    }

    if (res.status === 503 || res.status === 429) {
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      throw new Error(`Gemini API unavailable (${res.status}): too many requests or service overloaded`);
    }

    const body = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${body}`);
  }

  throw new Error("Gemini API: all retries exhausted");
}

export async function callLLM(
  system: string,
  user: string,
): Promise<{ text: string; modelUsed: string }> {
  const provider = getProvider();
  if (provider === "gemini") return callGemini(system, user);
  if (provider === "gemma") return callGemma(system, user);
  return callFireworks(system, user);
}
