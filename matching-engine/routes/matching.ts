import express, { Request, Response } from "express";
import clientPromise from "../../app/lib/mongodb";
import { runMatchingEngine } from "../matching/matchingEngine";
import { Official, Event, FlaggedResult } from "../types/index";

const router = express.Router();

router.post("/run-matching", async (req: Request, res: Response) => {
  try {
    const client = await clientPromise;

    // Events is within Agenda DB and Officials is within Form700 DB, so we need to access both
    const agendaDb = client.db("Agenda");
    const form700Db = client.db("Form700");

    // Fetch from MongoDB using native driver
    const officials = await form700Db
      .collection<Official>("Officials")
      .find({})
      .toArray(); 

    const events = await agendaDb
      .collection<Event>("Events")
      .find({})
      .toArray();

// This shows the first official in our form700 collection, for some reason the actual first point of data is empty, so that's why I have [1] instead of [0] here
// But this is just to verify that we're successfully fetching data from MongoDB and that the structure looks correct before we run the engine.
console.log("First official:", JSON.stringify(officials[1], null, 3));


    if (officials.length === 0 || events.length === 0) {
      return res.status(400).json({
        error: "No officials or events found in the database"
      });
    }

    // Run the engine
    const results = runMatchingEngine(officials, events);

    if (results.length === 0) {
      return res.status(200).json({
        message: "Matching complete — no conflicts found",
        flaggedCount: 0,
        results: []
      });
    }

    // Duplicate prevention before saving
    // For each result, only insert if an identical match doesn't already exist
    const collection = agendaDb.collection<FlaggedResult>("FlaggedResults");

    let insertedCount = 0;
    for (const result of results) {
      const existing = await collection.findOne({
        officialId:  result.officialId,   // same official
        matterTitle: result.matterTitle,  // same agenda item
        eventDate:   result.eventDate,    // same meeting date
      });

      // Only insert if this exact match doesn't already exist
      if (!existing) {
        await collection.insertOne(result);
        insertedCount++;
      }
    }

    res.status(200).json({
      message:       "Matching complete",
      flaggedCount:  results.length,       // total matches found
      insertedCount,                        // how many were new and saved
      results
    });

  } catch (error) {
    console.error("Matching engine error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;