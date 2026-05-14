import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Agenda");
    const results = await db
      .collection("FlaggedResults")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Error fetching flagged results:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch flagged results",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}