import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";
import axios from "axios";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (key && !process.env[key]) process.env[key] = value;
    }
}

const [citySlug, legistarSlug] = process.argv.slice(2);
if (!citySlug || !legistarSlug) {
    console.error("Usage: npx tsx scripts/registerJurisdiction.ts <citySlug> <legistarSlug>");
    console.error("Example: npx tsx scripts/registerJurisdiction.ts napa-county Napa");
    process.exit(1);
}

const BASE_URL = `https://webapi.legistar.com/v1/${legistarSlug}`;
const API_DELAY_MS = 150;
const SEED_COUNT = 1;

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function register() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("Missing MONGODB_URI");
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("Agenda");
    const eventsCol = db.collection("Events");
    const stateCol = db.collection("IngestState");

    // Auto-detect Board of Supervisors body
    const bodiesRes = await axios.get(`${BASE_URL}/Bodies`);
    const allBodies = bodiesRes.data as any[];

    const councils = allBodies.filter(
        b => b.BodyName.toLowerCase().includes("board of supervisors") &&
             b.BodyActiveFlag === 1
    );

    if (councils.length === 0) {
        const available = allBodies
            .filter(b => b.BodyActiveFlag === 1)
            .map(b => `  "${b.BodyName}" (type: "${b.BodyTypeName}")`)
            .join("\n");
        console.error(`No active "Board of Supervisors" body found for "${legistarSlug}".`);
        console.error(`Active bodies available:\n${available}`);
        await client.close();
        process.exit(1);
    }

    const board = councils[0];
    const bodyNameContains = board.BodyName;
    const bodyType = board.BodyTypeName;
    console.log(`Found: "${bodyNameContains}" (type: "${bodyType}")`);

    // Fetch most recent meeting to seed the DB and verify the full chain works
    const bodyFilter = councils.map((b: any) => `EventBodyId eq ${b.BodyId}`).join(" or ");
    const eventsRes = await axios.get(
        `${BASE_URL}/Events?$filter=(${bodyFilter})&$orderby=EventDate desc&$top=${SEED_COUNT}`
    );
    const events: any[] = eventsRes.data || [];

    if (events.length === 0) {
        console.warn("No events found — registering with today as cursor.");
    } else {
        console.log(`Seeding most recent meeting: ${events[0].EventDate.slice(0, 10)}\n`);
    }

    let latestDate = new Date(0);

    for (let i = 0; i < events.length; i++) {
        const event = events[i];
        console.log(`[${i + 1}/${events.length}] ${event.EventDate.slice(0, 10)} — EventId ${event.EventId}`);

        const itemsRes = await axios.get(`${BASE_URL}/Events/${event.EventId}/EventItems`);
        const rawItems: any[] = itemsRes.data || [];
        const items = [];

        for (const item of rawItems) {
            if (!item.EventItemMatterId) continue;

            await sleep(API_DELAY_MS);
            const attachRes = await axios.get(`${BASE_URL}/Matters/${item.EventItemMatterId}/Attachments`);
            const attachments = (attachRes.data || []).map((a: any) => ({
                label: a.MatterAttachmentName,
                url: a.MatterAttachmentHyperlink,
                attachmentId: a.MatterAttachmentId
            }));

            let matterText: string | null = null;
            try {
                await sleep(API_DELAY_MS);
                const versionsRes = await axios.get(`${BASE_URL}/Matters/${item.EventItemMatterId}/Versions`);
                const versions: any[] = versionsRes.data || [];
                if (versions.length > 0) {
                    const key = versions[versions.length - 1].Key;
                    await sleep(API_DELAY_MS);
                    const textRes = await axios.get(`${BASE_URL}/Matters/${item.EventItemMatterId}/Texts/${key}`);
                    matterText = textRes.data?.MatterTextPlain ?? null;
                }
            } catch {
                // Texts endpoint not available
            }

            items.push({
                eventItemId: item.EventItemId,
                matterId: item.EventItemMatterId,
                matterTitle: item.EventItemTitle ?? "",
                matterType: item.EventItemMatterType ?? "",
                matterFile: item.EventItemMatterFile ?? "",
                matterStatus: item.EventItemMatterStatus ?? "",
                matterText,
                attachments,
                actionTaken: item.EventItemActionName ?? null
            });
        }

        const eventDoc = {
            eventId: event.EventId,
            citySlug,
            bodyId: event.EventBodyId,
            bodyName: event.EventBodyName ?? "",
            eventDate: new Date(event.EventDate),
            eventLocation: event.EventLocation ?? "",
            phase: "seed",
            items,
            lastUpdated: new Date()
        };

        await eventsCol.updateOne(
            { citySlug, eventId: event.EventId },
            { $set: eventDoc, $setOnInsert: { ingestedAt: new Date() } },
            { upsert: true }
        );

        const eDate = new Date(event.EventDate);
        if (eDate > latestDate) latestDate = eDate;
        console.log(`  → ${items.length} items saved`);
    }

    await stateCol.updateOne(
        { citySlug },
        {
            $set: {
                citySlug,
                legistarSlug,
                bodyNameContains,
                bodyType,
                historicalComplete: true,
                latestEventDate: latestDate > new Date(0) ? latestDate : new Date(),
                lastRunAt: new Date()
            }
        },
        { upsert: true }
    );

    const cursorDate = (latestDate > new Date(0) ? latestDate : new Date()).toISOString().slice(0, 10);
    console.log(`\nDone. ${citySlug} registered. Cursor set to ${cursorDate}.`);
    await client.close();
}

register().catch(err => { console.error(err); process.exit(1); });
