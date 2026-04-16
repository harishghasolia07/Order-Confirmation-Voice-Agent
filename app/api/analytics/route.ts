import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAnalytics } from "@/services/order.service";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const analytics = await getAnalytics(userId);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error("[GET /api/analytics]", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
