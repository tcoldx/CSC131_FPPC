import express, { Request, Response } from "express";
import clientPromise from "../../app/lib/mongodb";
import { runMatchingEngine } from "../matching/matchingEngine";
import { Official, Event, FlaggedResult } from "../types/index";

const router = express.Router();

router.post("/run-matching", async (req: Request, res: Response) => {
  try {
    const client = await clientPromise;
    const agendaDb  = client.db("Agenda");
    const form700Db = client.db("Form700");

    const officials = await form700Db
      .collection("Officials")
      .find({})
      .toArray() as unknown as Official[];

    const events = await agendaDb
      .collection<Event>("Events")
      .find({})
      .toArray();

    if (officials.length === 0 || events.length === 0) {
      return res.status(400).json({
        error: "No officials or events found in the database"
      });
    }

    const results = runMatchingEngine(officials, events);

    if (results.length === 0) {
      return res.status(200).json({
        message: "Matching complete — no conflicts found",
        flaggedCount: 0,
        results: []
      });
    }

    const collection = agendaDb.collection<FlaggedResult>("FlaggedResults");

    let insertedCount = 0;
    for (const result of results) {
      const existing = await collection.findOne({
        officialId:  result.officialId,
        matterTitle: result.matterTitle,
        eventDate:   result.eventDate,
      });

// ADD THIS
      console.log(`Existing check for ${result.matterTitle}: ${existing ? "DUPLICATE - skipped" : "NEW - inserting"}`);


      if (!existing) {
        await collection.insertOne(result);
        insertedCount++;
// ADD THIS
        console.log(`Inserted: ${result.officialName} - ${result.matterTitle}`);
      }


    }

    res.status(200).json({
      message:      "Matching complete",
      flaggedCount:  results.length,
      insertedCount,
      results
    });

  } catch (error) {
    console.error("Matching engine error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;