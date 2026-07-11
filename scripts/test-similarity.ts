// Run this script to test the similarity system:
// npx tsx scripts/test-similarity.ts
//
// Prerequisites:
// 1. Convex dev server running: npx convex dev
// 2. You must be logged in via the app first (for auth)

import { ConvexHttpClient } from "convex/browser";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  console.error("NEXT_PUBLIC_CONVEX_URL not set");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const TEST_EMAILS = [
  // Batch 1: Refund requests (should be similar to each other)
  {
    from: "alice@customer.com",
    subject: "Refund for broken headphones",
    body: "Hi, I received my order of headphones today but the left earpiece doesn't work. I'd like a refund please. Order #ORD-9001. Thanks.",
  },
  {
    from: "bob@customer.com",
    subject: "Want refund for damaged item",
    body: "Hello, the headphones I ordered arrived with a cracked headband. This is unacceptable. I need a full refund immediately. Order #ORD-9002.",
  },
  {
    from: "charlie@customer.com",
    subject: "Headphones defective, need money back",
    body: "My headphones stopped working after one day. The sound cuts out constantly. I want my money back. This is the worst purchase I've made. Order #ORD-9003.",
  },

  // Batch 2: Order status (should be similar to each other, different from batch 1)
  {
    from: "dave@customer.com",
    subject: "Where is my order?",
    body: "I placed an order 5 days ago and haven't received any shipping updates. Order #ORD-9004. Can you tell me the status?",
  },
  {
    from: "eve@customer.com",
    subject: "Order status update please",
    body: "Hi, I'm checking on order #ORD-9005. It's been a week and tracking still shows processing. When will it ship?",
  },

  // Batch 3: Technical issue (different topic)
  {
    from: "frank@customer.com",
    subject: "App crashes on login",
    body: "Every time I try to log in to the mobile app, it crashes immediately. I'm on iOS 17.5. Please fix this bug. Order #ORD-9006.",
  },
];

async function sendTestEmails() {
  console.log("Sending test emails...\n");

  for (const email of TEST_EMAILS) {
    try {
      const id = await client.mutation("emails:triggerMockEmail" as any, {
        from: email.from,
        subject: email.subject,
        body: email.body,
      });
      console.log(`✓ Sent: "${email.subject}" from ${email.from} → ${id}`);
      // Small delay between sends
      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      console.error(`✗ Failed: "${email.subject}"`, err);
    }
  }

  console.log("\n--- Done! ---");
  console.log("Wait ~10 seconds for triage to process, then check:");
  console.log("1. Triage Feed: http://localhost:3000/dashboard/decisions");
  console.log("2. Click any decision → check 'Customer Context' card on the right");
  console.log("3. Similar emails should appear in the AmdContextCard");
  console.log("\nExpected similarity clusters:");
  console.log('- Refund emails (alice, bob, charlie) should be similar to each other');
  console.log('- Order status emails (dave, eve) should be similar to each other');
  console.log('- Technical issue (frank) should have low similarity to others');
}

sendTestEmails().catch(console.error);
