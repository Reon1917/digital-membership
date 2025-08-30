import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { membership, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
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

    // For MVP, we'll allow any authenticated user to access admin
    // In production, you'd want to add role-based access control

    const members = await db
      .select({
        id: membership.id,
        userId: membership.userId,
        cardNumber: membership.cardNumber,
        phoneNumber: membership.phoneNumber,
        points: membership.points,
        tier: membership.tier,
        status: membership.status,
        createdAt: membership.createdAt,
        user: {
          name: user.name,
          email: user.email,
        },
      })
      .from(membership)
      .innerJoin(user, eq(membership.userId, user.id))
      .orderBy(membership.createdAt);

    return NextResponse.json({
      members,
    });
  } catch (error: any) {
    console.error("Admin members fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}