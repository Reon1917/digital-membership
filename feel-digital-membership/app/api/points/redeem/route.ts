import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { membership, transaction } from "@/db/schema";
import { eq } from "drizzle-orm";
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

    const { membershipId, points, description, referenceId } = await request.json();

    if (!membershipId || !points || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get membership
    const [membershipRecord] = await db
      .select()
      .from(membership)
      .where(eq(membership.id, membershipId))
      .limit(1);

    if (!membershipRecord) {
      return NextResponse.json(
        { error: "Membership not found" },
        { status: 404 }
      );
    }

    // Check if user has enough points
    if (membershipRecord.points < points) {
      return NextResponse.json(
        { error: "Insufficient points" },
        { status: 400 }
      );
    }

    // Update membership points
    const newPoints = membershipRecord.points - points;
    await db
      .update(membership)
      .set({ 
        points: newPoints,
        updatedAt: new Date(),
      })
      .where(eq(membership.id, membershipId));

    // Create transaction record
    await db.insert(transaction).values({
      id: nanoid(),
      membershipId,
      type: "redeem",
      points,
      description,
      referenceId,
    });

    return NextResponse.json({
      success: true,
      newPoints,
    });
  } catch (error: any) {
    console.error("Points redemption error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}