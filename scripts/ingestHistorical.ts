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

const CITY_SLUG = "sacramento";
const BASE_URL = `https://webapi.legistar.com/v1/${CITY_SLUG}`;
const COUNCIL_BODY_TYPE = "Primary Legislative Body";
const COUNCIL_BODY_NAME_CONTAINS = "City Council";
const HISTORICAL_START = "2019-01-01";
const HISTORICAL_END = "2019-12-31";
const API_DELAY_MS = 150;
// Sacramento uses "Consent Item" as catch-all type — match on title keywords instead
const TEXT_FETCH_KEYWORDS = ["agreement", "contract", "resolution", "ordinance", "professional services", "lease", "funding", "award"];

function shouldFetchText(title: string): boolean {
    const lower = title.toLowerCase();
    return TEXT_FETCH_KEYWORDS.some(k => lower.includes(k));
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function ingestHistorical() {
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
        // Find all City Council bodies (Sacramento splits meetings into time blocks)
        const bodiesRes = await axios.get(`${BASE_URL}/Bodies`);
        const councils = (bodiesRes.data as any[]).filter(
            b => b.BodyTypeName === COUNCIL_BODY_TYPE &&
                 b.BodyName.includes(COUNCIL_BODY_NAME_CONTAINS) &&
                 b.BodyActiveFlag === 1
        );
        if (councils.length === 0) throw new Error(`No bodies matching "${COUNCIL_BODY_NAME_CONTAINS}" with type "${COUNCIL_BODY_TYPE}" found in Legistar`);
        console.log(`Found ${councils.length} council body/bodies: ${councils.map((b: any) => b.BodyName).join(", ")}`);

        // Fetch and store members for all council bodies (not all Legistar cities expose this endpoint)
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
                console.warn(`Warning: BodyMembers endpoint not available for "${body.BodyName}" — skipping member ingest. Council member data will need to be sourced separately.`);
            }
        }

        // Fetch all 2019 meetings across all council bodies
        const bodyFilter = councils.map((b: any) => `EventBodyId eq ${b.BodyId}`).join(" or ");
        const eventsRes = await axios.get(
            `${BASE_URL}/Events?$filter=(${bodyFilter}) and EventDate ge datetime'${HISTORICAL_START}' and EventDate le datetime'${HISTORICAL_END}'&$orderby=EventDate asc`
        );
        const events: any[] = eventsRes.data || [];
        console.log(`Found ${events.length} City Council meetings in 2019\n`);

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
                    if (shouldFetchText(item.EventItemTitle ?? "")) {
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
                            // Texts endpoint not supported by this Legistar instance — title-only matching
                        }
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
                    legistarSlug: CITY_SLUG,
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
        console.log("IngestState updated — historical complete.");

    } finally {
        await client.close();
    }
}

ingestHistorical().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
