import { callLLM } from "./lib";
import type { TriageState } from "./triageWorkflow";

const DRAFT_PROMPT = `You are an AI customer support assistant drafting replies to customer emails.

Write a complete, professional email reply based on the incoming email below.

TONE GUIDELINES:
- Professional: Formal, polite, and respectful. Use "Dear" and "Sincerely".
- Friendly: Warm and approachable but still professional. Use "Hi" and "Best regards".
- Casual: Conversational and relaxed. Use "Hey" and "Cheers".
- Enthusiastic: Energetic and excited. Use "Thanks!" and show genuine excitement.

INSTRUCTIONS:
1. Address the customer's specific concerns/questions
2. Be helpful and solution-oriented
3. Keep the tone consistent throughout
4. ALWAYS end with a professional sign-off followed by the company name provided below
5. Do NOT use placeholders like [Customer Name] — use "you" directly
6. Output ONLY the email body text — no subject line, no JSON, no prefix text`;

function formatSimilarInteractions(
  interactions: TriageState["similarInteractions"],
): string {
  if (!interactions || interactions.length === 0) return "";

  const formatted = interactions
    .map((item, i) => {
      const statusLabel =
        item.status === "replied"
          ? "replied"
          : item.status === "resolved"
            ? "resolved"
            : item.status;
      return `${i + 1}. Subject: "${item.subject}" | Status: ${statusLabel} | Body: "${item.body}..."`;
    })
    .join("\n");

  return `
SIMILAR PAST INTERACTIONS (for context only — reference if relevant, do not copy):
${formatted}

If the current email is similar to any of these, you may reference how the issue was resolved. Do not repeat the exact text — use it as guidance for tone and approach.`;
}

export async function draftReplyNode(
  state: TriageState,
): Promise<Partial<TriageState>> {
  if (!state.email) throw new Error("Email data not found in state");

  const tone = state.replyTone || "professional";
  const companyName = state.businessName || "Support Team";

  const systemPrompt = DRAFT_PROMPT;

  let userContent = `TONE: ${tone.toUpperCase()}
COMPANY NAME: ${companyName}

From: ${state.email.from_email}
Subject: ${state.email.subject}
Body:
${state.email.body}`;

  const similarContext = formatSimilarInteractions(state.similarInteractions);
  if (similarContext) {
    userContent += similarContext;
  }

  userContent += `
Write a reply in the ${tone} tone.
End the email with a professional sign-off followed by "${companyName} Team".`;

  const { text, modelUsed } = await callLLM(systemPrompt, userContent);

  return {
    draftText: text.trim(),
    modelUsed,
  };
}
