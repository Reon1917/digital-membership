import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { reward } from "@/db/schema";
import { nanoid } from "nanoid";

const defaultRewards = [
  {
    name: "Free Coffee",
    description: "Complimentary coffee or tea of your choice",
    pointsCost: 100,
    category: "Beverages",
  },
  {
    name: "Free Appetizer",
    description: "Any appetizer from our menu",
    pointsCost: 250,
    category: "Food",
  },
  {
    name: "10% Discount",
    description: "10% off your total bill",
    pointsCost: 300,
    category: "Discount",
  },
  {
    name: "Free Dessert",
    description: "Any dessert from our menu",
    pointsCost: 200,
    category: "Food",
  },
  {
    name: "Free Main Course",
    description: "Any main course from our menu (up to 500 THB)",
    pointsCost: 500,
    category: "Food",
  },
  {
    name: "20% Discount",
    description: "20% off your total bill",
    pointsCost: 600,
    category: "Discount",
  },
  {
    name: "Free Set Menu",
    description: "Complimentary set menu for 2 people",
    pointsCost: 1000,
    category: "Food",
  },
];

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

    // Check if rewards already exist
    const existingRewards = await db.select().from(reward).limit(1);
    
    if (existingRewards.length > 0) {
      return NextResponse.json(
        { message: "Rewards already seeded" },
        { status: 200 }
      );
    }

    // Insert default rewards
    const rewardsToInsert = defaultRewards.map((r) => ({
      id: nanoid(),
      name: r.name,
      description: r.description,
      pointsCost: r.pointsCost,
      category: r.category,
      isActive: true,
    }));

    await db.insert(reward).values(rewardsToInsert);

    return NextResponse.json({
      success: true,
      message: "Rewards seeded successfully",
      count: rewardsToInsert.length,
    });
  } catch (error: any) {
    console.error("Rewards seed error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}