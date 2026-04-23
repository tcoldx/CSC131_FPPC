import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const client = await clientPromise;
    const db = client.db("Form700");

    const result = await db.collection("Officials").insertOne(body);

    return NextResponse.json({
      success: true,
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("POST error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to insert data" },
      { status: 500 }
    );
  }
}