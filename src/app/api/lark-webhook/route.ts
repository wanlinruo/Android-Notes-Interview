import { NextRequest, NextResponse } from "next/server";
import { replyLarkMessage } from "@/lib/lark";
import { quickImportArticle } from "@/lib/quick-import";

// Event deduplication: track processed event IDs to prevent duplicate handling on Lark retries
const processedEvents = new Set<string>();
const MAX_EVENTS = 1000;

function markEventProcessed(eventId: string): boolean {
  if (processedEvents.has(eventId)) return false;
  if (processedEvents.size >= MAX_EVENTS) {
    const first = processedEvents.values().next().value;
    if (first) processedEvents.delete(first);
  }
  processedEvents.add(eventId);
  return true;
}

// Extract URLs from text
function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
  return text.match(urlRegex) || [];
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Handle Lark URL Verification challenge
  if (body.type === "url_verification") {
    return NextResponse.json({ challenge: body.challenge });
  }

  // Verify token
  const token = body.header?.token;
  const expectedToken = process.env.LARK_VERIFICATION_TOKEN;

  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Deduplicate events (Lark retries if response takes > 3s)
  const eventId = body.header?.event_id;
  if (eventId && !markEventProcessed(eventId)) {
    return NextResponse.json({ ok: true });
  }

  // Only handle message events
  const eventType = body.header?.event_type;
  if (eventType !== "im.message.receive_v1") {
    return NextResponse.json({ ok: true });
  }

  const message = body.event?.message;
  const senderId = body.event?.sender?.sender_id?.open_id;

  // Check allowed users
  const allowedUsers = (process.env.LARK_ALLOWED_USER_IDS || "").split(",").filter(Boolean);
  if (allowedUsers.length > 0 && !allowedUsers.includes(senderId)) {
    return NextResponse.json({ ok: true });
  }

  // Only handle text messages
  if (message?.message_type !== "text") {
    return NextResponse.json({ ok: true });
  }

  const messageId = message.message_id;
  const content = JSON.parse(message.content || "{}");
  const text: string = content.text || "";

  const urls = extractUrls(text);

  if (urls.length === 0) {
    await replyLarkMessage(messageId, "No URLs found in message. Send me an article URL to import.");
    return NextResponse.json({ ok: true });
  }

  // Process import asynchronously — return 200 immediately to avoid Lark timeout retry
  processImport(messageId, urls).catch((err) =>
    console.error("Import processing error:", err)
  );

  return NextResponse.json({ ok: true });
}

async function processImport(messageId: string, urls: string[]) {
  const results: string[] = [];
  for (const url of urls) {
    const result = await quickImportArticle(url);
    if (result.success) {
      results.push(`✅ ${result.article.title}\n   Edit: ${result.article.editUrl}`);
    } else {
      results.push(`❌ ${url}\n   ${result.error}`);
    }
  }
  await replyLarkMessage(messageId, results.join("\n\n"));
}
