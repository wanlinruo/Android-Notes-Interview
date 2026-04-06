import { NextRequest, NextResponse } from "next/server";
import { quickImportArticle } from "@/lib/quick-import";

export async function POST(request: NextRequest) {
  // API Key auth
  const authHeader = request.headers.get("authorization");
  const expectedKey = process.env.QUICK_IMPORT_API_KEY;

  if (!expectedKey) {
    return NextResponse.json(
      { success: false, error: "QUICK_IMPORT_API_KEY not configured" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { url } = body;

  if (!url) {
    return NextResponse.json(
      { success: false, error: "URL is required" },
      { status: 400 }
    );
  }

  const result = await quickImportArticle(url);

  return NextResponse.json(result, {
    status: result.success ? 201 : 400,
  });
}
