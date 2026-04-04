import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  const versions = await prisma.articleVersion.findMany({
    where: { articleId: id },
    orderBy: { version: "desc" },
    select: {
      id: true,
      version: true,
      title: true,
      createdAt: true,
    },
  });

  return NextResponse.json(versions);
}
