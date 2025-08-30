import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transaction, membership } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

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

    // Get user's membership first
    const [userMembership] = await db
      .select()
      .from(membership)
      .where(eq(membership.userId, session.user.id))
      .limit(1);

    if (!userMembership) {
      return NextResponse.json(
        { error: "Membership not found" },
        { status: 404 }
      );
    }

    // Get transactions for this membership
    const transactions = await db
      .select()
      .from(transaction)
      .where(eq(transaction.membershipId, userMembership.id))
      .orderBy(desc(transaction.createdAt))
      .limit(50);

    return NextResponse.json({
      transactions,
    });
  } catch (error: any) {
    console.error("Transactions fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}