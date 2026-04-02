import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const where = type ? { type: type as "DIFFICULTY" | "TOPIC" } : {};

  const tags = await prisma.tag.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(tags);
}

export async function POST(request: NextRequest) {
  await requireAdmin();

  const { name, slug, type } = await request.json();

  if (!name || !slug || !type) {
    return NextResponse.json(
      { error: "Name, slug, and type are required" },
      { status: 400 }
    );
  }

  const tag = await prisma.tag.create({
    data: { name, slug, type },
  });

  return NextResponse.json(tag, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  await requireAdmin();

  const { id } = await request.json();

  await prisma.tag.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
