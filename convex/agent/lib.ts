const FIREWORKS_MODEL = process.env.FIREWORKS_MODEL ?? "accounts/fireworks/models/gpt-oss-120b";
const GEMMA_GOOGLE_MODEL = process.env.GEMMA_GOOGLE_MODEL ?? "gemma-4-26b-a4b-it";
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
  const fwKey = process.env.FIREWORKS_API_KEY;

  // 1) Try Fireworks with FIREWORKS_MODEL
  //    Default: gpt-oss-120b (works now on hackathon key)
  //    Gemma 4 on Fireworks: set FIREWORKS_MODEL=accounts/fireworks/models/gemma-4-31b-it
  //    after deploying at https://fireworks.ai/models/fireworks/gemma-4-31b-it
  if (fwKey) {
    try {
      const res = await fetch(
        "https://api.fireworks.ai/inference/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${fwKey}`,
          },
          body: JSON.stringify({
            model: FIREWORKS_MODEL,
            temperature: 0.3,
            max_tokens: 1024,
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
          }),
        },
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content ?? "";
        if (text) return { text, modelUsed: `fireworks/${FIREWORKS_MODEL}` };
      }
    } catch {
      // Fireworks failed — try Google
    }
  }

  // 2) Fallback: Google Gemma 4 (free via GOOGLE_API_KEY, same model)
  const googleKey = process.env.GOOGLE_API_KEY;
  if (googleKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMMA_GOOGLE_MODEL}:generateContent?key=${googleKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${system}\n\n${user}` }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
          }),
        },
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        if (text) return { text, modelUsed: `google/${GEMMA_GOOGLE_MODEL}` };
      }
    } catch {
      // Google Gemma 4 failed — fall through to Fireworks default
    }
  }

  // 3) Last resort: Fireworks gpt-oss-120b (always available on hackathon key)
  if (!fwKey) {
    throw new Error("No LLM available: set FIREWORKS_API_KEY or GOOGLE_API_KEY");
  }

  const res = await fetch(
    "https://api.fireworks.ai/inference/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${fwKey}`,
      },
      body: JSON.stringify({
        model: "accounts/fireworks/models/gpt-oss-120b",
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
    throw new Error(`Gemma 4 fallback API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content ?? "",
    modelUsed: "fireworks/gpt-oss-120b",
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

  const models = [FIREWORKS_MODEL, "accounts/fireworks/models/gpt-oss-120b"];
  let lastError = "All models failed";

  for (const model of models) {
    const res = await fetch(
      "https://api.fireworks.ai/inference/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.3,
          max_tokens: 1024,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      },
    );

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content ?? "";
      if (text) return { text, modelUsed: model };
    }

    const body = await res.text();
    lastError = `${model}: ${res.status} ${body.slice(0, 100)}`;
  }

  throw new Error(`Fireworks API error — ${lastError}`);
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
