import { NextRequest } from "next/server";
import { quickImportArticle } from "@/lib/quick-import";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const key = request.nextUrl.searchParams.get("key");
  const expectedKey = process.env.QUICK_IMPORT_API_KEY;

  if (!expectedKey || key !== expectedKey) {
    return new Response(resultPage("Unauthorized", false), {
      status: 401,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (!url) {
    return new Response(resultPage("No URL provided", false), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const result = await quickImportArticle(url);

  const message = result.success
    ? `Imported: ${result.article.title}`
    : `Error: ${result.error}`;

  return new Response(resultPage(message, result.success), {
    status: result.success ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function resultPage(message: string, success: boolean): string {
  const escaped = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Quick Import</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #fafafa; }
  .card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
  .icon { font-size: 48px; margin-bottom: 16px; }
  .msg { font-size: 16px; color: #333; line-height: 1.5; }
  .hint { font-size: 13px; color: #888; margin-top: 12px; }
</style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? "✅" : "❌"}</div>
    <div class="msg">${escaped}</div>
    <div class="hint">${success ? "This window will close in 3 seconds..." : "Please try again."}</div>
  </div>
  ${success ? "<script>setTimeout(()=>window.close(),3000)</script>" : ""}
</body>
</html>`;
}
