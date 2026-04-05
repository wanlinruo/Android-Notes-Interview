import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-utils";

export async function GET() {
  await requireAdmin();

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return NextResponse.json(
      { error: "UNSPLASH_ACCESS_KEY not configured" },
      { status: 500 }
    );
  }

  const res = await fetch(
    "https://api.unsplash.com/photos/random?query=technology&orientation=landscape",
    {
      headers: { Authorization: `Client-ID ${accessKey}` },
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch from Unsplash" },
      { status: res.status }
    );
  }

  const data = await res.json();

  return NextResponse.json({
    url: data.urls.regular,
    photographer: data.user.name,
    photographerUrl: data.user.links.html,
  });
}
