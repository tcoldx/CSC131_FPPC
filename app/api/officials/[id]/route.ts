import { NextResponse } from "next/server";
import { getMongoClient } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";


export async function GET(req: Request, { params }: any) {
  try {
    const client = await getMongoClient();
    const db = client.db("Form700");
    const {id} = await params;
    const official = await db.collection("Officials").findOne({_id: new ObjectId(id)});
    
    return NextResponse.json(official, { status: 200 });
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