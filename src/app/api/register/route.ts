import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { email, password, nickname } = await request.json();

  // Validation
  const errors: string[] = [];
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Invalid email");
  }
  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }
  if (!nickname || nickname.trim().length === 0) {
    errors.push("Nickname is required");
  }

  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  // Check existing user
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { errors: ["Email already registered"] },
      { status: 409 }
    );
  }

  // Create user
  const hashedPassword = await hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      nickname: nickname.trim(),
    },
  });

  return NextResponse.json(
    { id: user.id, email: user.email, nickname: user.nickname },
    { status: 201 }
  );
}
