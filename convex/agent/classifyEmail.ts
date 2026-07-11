import { callLLM } from "./lib";
import type { TriageState } from "./triageWorkflow";

const CLASSIFICATION_PROMPT = `You are a customer support email classifier. Classify the incoming email and output a JSON object with three fields: classification, confidence, and reasoning.

Classification must be one of:
- "routine" — order status, shipping, hours, FAQs, general questions
- "technical" — bugs, API issues, integration problems, error messages
- "urgent" — refund requests, complaints, defects, account issues, time-sensitive
- "sales" — pricing, bulk orders, partnership inquiries, demos
- "other" — anything that doesn't fit above

Confidence must be a number between 0.0 and 1.0 indicating how certain you are.

Reasoning must be a brief explanation (1-2 sentences) of why you classified it this way.

Output ONLY valid JSON with no other text:
{"classification": "...", "confidence": 0.0, "reasoning": "..."}`;

const BUSINESS_CONTEXT_PREFIX =
  "The following is the business context for the company handling this email:\n\n";

export async function classifyEmailNode(
  state: TriageState,
): Promise<Partial<TriageState>> {
  const email = state.email;
  if (!email) throw new Error("Email data not found in state");

  let systemPrompt = CLASSIFICATION_PROMPT;
  if (state.businessContext) {
    systemPrompt =
      BUSINESS_CONTEXT_PREFIX +
      state.businessContext +
      "\n\n---\n\n" +
      CLASSIFICATION_PROMPT;
  }

  const userContent = `From: ${email.from_email}
Subject: ${email.subject}
Body:
${email.body}`;

  const { text, modelUsed } = await callLLM(systemPrompt, userContent);

  let parsed: Record<string, unknown>;
  try {
    const jsonStr = text.trim();
    const firstBrace = jsonStr.indexOf("{");
    const lastBrace = jsonStr.lastIndexOf("}");
    parsed = JSON.parse(jsonStr.slice(firstBrace, lastBrace + 1));
  } catch {
    throw new Error(`Failed to parse classification response: ${text}`);
  }

  const classification =
    typeof parsed.classification === "string"
      ? parsed.classification
      : "other";
  const confidence =
    typeof parsed.confidence === "number" ? parsed.confidence : 0;
  const reasoning =
    typeof parsed.reasoning === "string" ? parsed.reasoning : "";

  let shouldEscalate = false;
  const rules = state.escalationRules ?? [];
  for (const rule of rules) {
    if (!rule.enabled) continue;
    if (
      rule.condition === "confidence_below" &&
      confidence < (rule.value as number)
    ) {
      shouldEscalate = true;
    } else if (
      rule.condition === "contains" &&
      typeof rule.value === "string"
    ) {
      const keyword = rule.value.toLowerCase();
      const inBody = email.body.toLowerCase().includes(keyword);
      const inSubject = email.subject.toLowerCase().includes(keyword);
      if (inBody || inSubject) shouldEscalate = true;
    }
  }

  return {
    classification,
    confidence,
    reasoning,
    modelUsed,
    shouldEscalate,
  };
}
