import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { reward } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const rewards = await db
      .select()
      .from(reward)
      .where(eq(reward.isActive, true))
      .orderBy(reward.pointsCost);

    return NextResponse.json({
      rewards,
    });
  } catch (error: any) {
    console.error("Rewards fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}