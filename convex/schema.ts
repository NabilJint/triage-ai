import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  userProfiles: defineTable({
    authUserId: v.id("users"),
    email: v.string(),
    business_name: v.string(),
    plan: v.string(),
    business_context: v.optional(v.string()),
    created_at: v.string(),
    updated_at: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_auth_user", ["authUserId"]),

  inboxConnections: defineTable({
    user_id: v.id("users"),
    provider: v.string(),
    credentials: v.optional(v.object({})),
    connected_at: v.string(),
    is_active: v.boolean(),
  }).index("by_user", ["user_id"]),

  emails: defineTable({
    user_id: v.id("users"),
    inbox_connection_id: v.id("inboxConnections"),
    from_email: v.string(),
    from_name: v.optional(v.string()),
    subject: v.string(),
    body: v.string(),
    body_html: v.optional(v.string()),
    received_at: v.string(),
    status: v.string(),
    gmail_message_id: v.optional(v.string()),
    thread_id: v.optional(v.string()),
  })
    .index("by_user_and_received", ["user_id", "received_at"])
    .index("by_inbox_connection", ["inbox_connection_id"]),

  triageDecisions: defineTable({
    user_id: v.id("users"),
    email_id: v.id("emails"),
    classification: v.string(),
    confidence: v.float64(),
    action: v.string(),
    draft_text: v.optional(v.string()),
    reasoning: v.string(),
    model_used: v.string(),
    created_at: v.string(),
    processed_at: v.optional(v.string()),
  })
    .index("by_user", ["user_id"])
    .index("by_user_and_action", ["user_id", "action"])
    .index("by_email", ["email_id"]),

  escalations: defineTable({
    user_id: v.id("users"),
    decision_id: v.id("triageDecisions"),
    priority: v.string(),
    status: v.string(),
    assigned_to: v.optional(v.id("users")),
    resolved_by: v.optional(v.id("users")),
    resolved_at: v.optional(v.string()),
    resolution_note: v.optional(v.string()),
    created_at: v.string(),
  })
    .index("by_user_and_status", ["user_id", "status"])
    .index("by_decision", ["decision_id"]),

  customerEmbeddings: defineTable({
    email_address: v.string(),
    embedding: v.array(v.float64()),
    updated_at: v.string(),
    used_in_query: v.boolean(),
  }).index("by_email", ["email_address"]),
});
