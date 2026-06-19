import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";
import axios from "axios";

// Load .env.local — tsx scripts don't get Next.js env loading automatically
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

const CITY_SLUG = "sonoma-county";              // MongoDB discriminator (lowercase)
const LEGISTAR_SLUG = "Sonoma-county";          // exact casing required by Legistar API
const BASE_URL = `https://webapi.legistar.com/v1/${LEGISTAR_SLUG}`;
const COUNCIL_BODY_TYPE = "Primary Legislative Body";
const COUNCIL_BODY_NAME_CONTAINS = "Board of Supervisors";
const HISTORICAL_START = "2019-01-01";
const HISTORICAL_END = "2019-12-31";
const API_DELAY_MS = 150;

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function ingestSonomaHistorical() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("Missing MONGODB_URI — check your .env.local file");

    const client = new MongoClient(uri);
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("Agenda");
    const eventsCol = db.collection("Events");
    const membersCol = db.collection("BodyMembers");
    const stateCol = db.collection("IngestState");

    try {
        // Find all Board of Supervisors bodies
        const bodiesRes = await axios.get(`${BASE_URL}/Bodies`);
        const councils = (bodiesRes.data as any[]).filter(
            b => b.BodyTypeName === COUNCIL_BODY_TYPE &&
                 b.BodyName.includes(COUNCIL_BODY_NAME_CONTAINS) &&
                 b.BodyActiveFlag === 1
        );
        if (councils.length === 0) throw new Error(`No bodies matching "${COUNCIL_BODY_NAME_CONTAINS}" with type "${COUNCIL_BODY_TYPE}" found in Legistar`);
        console.log(`Found ${councils.length} body/bodies: ${councils.map((b: any) => b.BodyName).join(", ")}`);

        // Attempt to fetch and store members (non-fatal if endpoint unavailable)
        for (const body of councils) {
            try {
                const membersRes = await axios.get(`${BASE_URL}/BodyMembers?$filter=BodyMemberBodyId eq ${body.BodyId}`);
                for (const m of membersRes.data as any[]) {
                    await membersCol.updateOne(
                        { citySlug: CITY_SLUG, bodyId: body.BodyId, personId: m.BodyMemberPersonId },
                        {
                            $set: {
                                citySlug: CITY_SLUG,
                                bodyId: body.BodyId,
                                bodyName: body.BodyName,
                                personId: m.BodyMemberPersonId,
                                personName: m.BodyMemberName,
                                startDate: m.BodyMemberStartDate ? new Date(m.BodyMemberStartDate) : null,
                                endDate: m.BodyMemberEndDate ? new Date(m.BodyMemberEndDate) : null,
                                lastUpdated: new Date()
                            }
                        },
                        { upsert: true }
                    );
                }
                console.log(`Stored ${membersRes.data.length} members for "${body.BodyName}"`);
            } catch {
                console.warn(`Warning: BodyMembers endpoint not available for "${body.BodyName}" — skipping member ingest.`);
            }
        }

        // Fetch all 2019 Board of Supervisors meetings
        const bodyFilter = councils.map((b: any) => `EventBodyId eq ${b.BodyId}`).join(" or ");
        const eventsRes = await axios.get(
            `${BASE_URL}/Events?$filter=(${bodyFilter}) and EventDate ge datetime'${HISTORICAL_START}' and EventDate le datetime'${HISTORICAL_END}'&$orderby=EventDate asc`
        );
        const events: any[] = eventsRes.data || [];
        console.log(`Found ${events.length} Board of Supervisors meetings in 2019\n`);

        let eventsProcessed = 0;
        const failedEvents: { eventId: number; error: string }[] = [];

        for (const event of events) {
            try {
                console.log(`[${eventsProcessed + 1}/${events.length}] ${event.EventDate.slice(0, 10)} — EventId ${event.EventId}`);

                // Fetch agenda items for this meeting
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
                        // Texts endpoint not available — matterText stays null
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
                    citySlug: CITY_SLUG,
                    bodyId: event.EventBodyId,
                    bodyName: event.EventBodyName ?? "",
                    eventDate: new Date(event.EventDate),
                    eventLocation: event.EventLocation ?? "",
                    phase: "historical",
                    items,
                    lastUpdated: new Date()
                };

                await eventsCol.updateOne(
                    { citySlug: CITY_SLUG, eventId: event.EventId },
                    { $set: eventDoc, $setOnInsert: { ingestedAt: new Date() } },
                    { upsert: true }
                );

                console.log(`  → ${items.length} items saved`);
                eventsProcessed++;
            } catch (err) {
                console.error(`  ✗ Failed event ${event.EventId}:`, err);
                failedEvents.push({ eventId: event.EventId, error: String(err) });
            }
        }

        // Mark historical ingest complete
        await stateCol.updateOne(
            { citySlug: CITY_SLUG },
            {
                $set: {
                    citySlug: CITY_SLUG,
                    legistarSlug: LEGISTAR_SLUG,
                    bodyNameContains: COUNCIL_BODY_NAME_CONTAINS,
                    bodyType: COUNCIL_BODY_TYPE,
                    historicalComplete: true,
                    latestEventDate: new Date(),
                    lastRunAt: new Date()
                }
            },
            { upsert: true }
        );

        console.log(`\nDone. ${eventsProcessed}/${events.length} events processed.`);
        if (failedEvents.length > 0) {
            console.warn(`Failed events:`, failedEvents);
        }
        console.log("IngestState updated — Sonoma historical complete.");

    } finally {
        await client.close();
    }
}

ingestSonomaHistorical().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
