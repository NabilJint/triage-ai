"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { callLLM } from "./lib";

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

export const regenerateDraft = action({
  args: {
    decisionId: v.id("triageDecisions"),
  },
  handler: async (ctx, args) => {
    const decision = await ctx.runQuery(
      api.triage.getDecisionById,
      { decisionId: args.decisionId },
    );

    if (!decision) throw new Error("Decision not found");
    if (!decision.email) throw new Error("Email data not found");

    const userProfile = await ctx.runQuery(
      api.userProfiles.getByAuthUser,
      { authUserId: decision.userId },
    );

    const tone = userProfile?.reply_tone ?? "professional";
    const companyName = userProfile?.business_name ?? "Support Team";

    const systemPrompt = DRAFT_PROMPT;

    const userContent = `TONE: ${tone.toUpperCase()}
COMPANY NAME: ${companyName}

From: ${decision.email.fromEmail}
Subject: ${decision.email.subject}
Body:
${decision.email.body}

Write a reply in the ${tone} tone.
End the email with a professional sign-off followed by "${companyName} Team".`;

    const { text, modelUsed } = await callLLM(systemPrompt, userContent);

    const draftText = text.trim();
    if (!draftText) {
      throw new Error("LLM returned empty response");
    }

    await ctx.runMutation(api.decisions.updateDraft, {
      decisionId: args.decisionId,
      draftText,
    });

    return { success: true, modelUsed };
  },
});
