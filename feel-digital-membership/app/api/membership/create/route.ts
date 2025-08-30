import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { membership } from "@/db/schema";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { phoneNumber } = await request.json();

    // Generate unique card number
    const cardNumber = `FEEL${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;

    // Create membership
    const [newMembership] = await db.insert(membership).values({
      id: nanoid(),
      userId: session.user.id,
      cardNumber,
      phoneNumber,
      points: 0,
      tier: "bronze",
      status: "active",
    }).returning();

    return NextResponse.json({
      success: true,
      membership: newMembership,
    });
  } catch (error: any) {
    console.error("Membership creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}