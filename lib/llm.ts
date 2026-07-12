const FIREWORKS_MODEL = process.env.FIREWORKS_MODEL ?? "accounts/fireworks/models/gpt-oss-120b";

const SYSTEM_PROMPT =
  "You are a business analyst. Summarize the following website content into a clear, structured business context description. Do not use markdown or any formatting symbols. Use plain text only with line breaks between sections. Use the following structure:\n\n" +
  "What the business sells: [one sentence]\n" +
  "Key products/services: [2-4 short lines, each starting with a dash]\n" +
  "Policies found: [shipping, returns, support hours — or 'None mentioned on website']\n" +
  "Customer support context: [anything about hours, contact methods, FAQ topics]\n" +
  "Other useful details: [promotions, target audience, unique value props, etc.]\n\n" +
  "If a section has no information, write 'Not mentioned on the website.' Be concise but complete. No markdown, no asterisks, no bold formatting.";

type LLMProvider = "fireworks" | "gemini" | "gemma";

function getProvider(): LLMProvider {
  const p = (process.env.LLM_PROVIDER ?? "gemma").toLowerCase();
  if (p === "gemini") return "gemini";
  if (p === "fireworks") return "fireworks";
  return "gemma";
}

async function callFireworks(content: string, systemPrompt: string = SYSTEM_PROMPT): Promise<string> {
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
        model: FIREWORKS_MODEL,
        temperature: 0.2,
        max_tokens: 2048,
        messages: [
          { role: "system", content: systemPrompt },
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

async function callGemma(content: string, systemPrompt: string = SYSTEM_PROMPT): Promise<string> {
  const fwKey = process.env.FIREWORKS_API_KEY;

  // 1) Try Fireworks with FIREWORKS_MODEL first
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
            temperature: 0.2,
            max_tokens: 2048,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: content.slice(0, 15000) },
            ],
          }),
        },
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content ?? "";
        if (text) return text;
      }
    } catch {
      // Fireworks failed — try Google
    }
  }

  // 2) Fallback: Google Gemma 4
  const googleKey = process.env.GOOGLE_API_KEY;
  if (googleKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent?key=${googleKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${content.slice(0, 15000)}` }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
          }),
        },
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        if (text) return text;
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
        temperature: 0.2,
        max_tokens: 2048,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: content.slice(0, 15000) },
        ],
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemma 4 fallback API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callGemini(content: string, systemPrompt: string = SYSTEM_PROMPT): Promise<string> {
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
            parts: [{ text: systemPrompt }, { text: content.slice(0, 15000) }],
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

function dispatchCall(content: string, systemPrompt?: string): Promise<string> {
  const provider = getProvider();
  if (provider === "gemini") return callGemini(content, systemPrompt);
  if (provider === "gemma") return callGemma(content, systemPrompt);
  return callFireworks(content, systemPrompt);
}

export async function summarize(text: string): Promise<string> {
  return dispatchCall(text);
}

const PREVIEW_PROMPT =
  "You are a customer support AI that drafts realistic email replies. " +
  "Given a business context and requested tone, generate a subject line and email body reply. " +
  "Use plain text only. No markdown, no formatting symbols. " +
  "Return only the email content in this format:\n\n" +
  "SUBJECT: <subject line>\n" +
  "BODY:\n<body content>";

export async function generateReplyPreview(
  tone: string,
  businessContext: string | null,
): Promise<{ subject: string; body: string }> {
  const ctx = businessContext || "A small online business selling various products and services.";
  const userContent =
    `Business context:\n${ctx}\n\n` +
    `Generate a short customer support email reply in a "${tone}" tone. ` +
    `The email is a reply to a customer asking about their order status. ` +
    `Make it sound natural and realistic for this specific business.`;

  const raw = await dispatchCall(userContent, PREVIEW_PROMPT);

  const subjectLine = raw.match(/SUBJECT:\s*(.+)/i);
  const bodyStart = raw.indexOf("BODY:");
  return {
    subject: subjectLine?.[1]?.trim() ?? `Re: Your question about order #1234`,
    body: bodyStart >= 0 ? raw.slice(bodyStart + 5).trim() : raw.trim(),
  };
}