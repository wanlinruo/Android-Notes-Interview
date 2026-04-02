import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        orderBy: { sortOrder: "asc" },
      },
      _count: { select: { articles: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  await requireAdmin();

  const { name, slug, description, icon, sortOrder, parentId } =
    await request.json();

  if (!name || !slug) {
    return NextResponse.json(
      { error: "Name and slug are required" },
      { status: 400 }
    );
  }

  const category = await prisma.category.create({
    data: { name, slug, description, icon, sortOrder: sortOrder || 0, parentId },
  });

  return NextResponse.json(category, { status: 201 });
}

export async function PUT(request: NextRequest) {
  await requireAdmin();

  const { id, name, slug, description, icon, sortOrder, parentId } =
    await request.json();

  const category = await prisma.category.update({
    where: { id },
    data: { name, slug, description, icon, sortOrder, parentId },
  });

  return NextResponse.json(category);
}

export async function DELETE(request: NextRequest) {
  await requireAdmin();

  const { id } = await request.json();

  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
