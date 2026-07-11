const GEMINI_EMBEDDING_MODEL = "gemini-embedding-001";

type EmbeddingProvider = "amd" | "gemini";

function getEmbeddingProvider(): EmbeddingProvider {
  const p = (process.env.LLM_PROVIDER ?? "gemma").toLowerCase();
  return p === "gemini" ? "gemini" : "amd";
}

async function callAMDEmbedding(text: string): Promise<number[]> {
  const endpoint = process.env.AMD_CLOUD_ENDPOINT;
  if (!endpoint) {
    throw new Error("AMD Cloud not configured: AMD_CLOUD_ENDPOINT is missing");
  }

  const apiKey = process.env.AMD_CLOUD_API_KEY;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "intfloat/e5-large-v2",
      input: text,
      instruction: "Represent the customer support email for retrieval: ",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`AMD Cloud error ${response.status}: ${body}`);
  }

  const data = await response.json();
  return data.embedding;
}

async function callGeminiEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini not configured: GOOGLE_API_KEY is missing");
  }

  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBEDDING_MODEL}:embedContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: `models/${GEMINI_EMBEDDING_MODEL}`,
          content: { parts: [{ text }] },
        }),
      },
    );

    if (res.ok) {
      const data = await res.json();
      return data.embedding.values;
    }

    if (res.status === 503 || res.status === 429) {
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      throw new Error(`Gemini embedding API unavailable (${res.status})`);
    }

    const body = await res.text();
    throw new Error(`Gemini embedding API error ${res.status}: ${body}`);
  }

  throw new Error("Gemini embedding: all retries exhausted");
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const provider = getEmbeddingProvider();

  if (provider === "gemini") {
    return callGeminiEmbedding(text);
  }

  // AMD provider: try AMD first, fallback to Gemini
  try {
    return await callAMDEmbedding(text);
  } catch (amdError) {
    console.warn("[amd-cloud] AMD endpoint failed, falling back to Gemini:", amdError);
    return callGeminiEmbedding(text);
  }
}
