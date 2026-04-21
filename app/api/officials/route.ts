import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Form700");

    const officials = await db.collection("Officials").find({}).toArray();

    return NextResponse.json(officials);
  } catch (error: any) {
    console.error("Error fetching officials:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch officials",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    ); 
   
  
  }  
}




