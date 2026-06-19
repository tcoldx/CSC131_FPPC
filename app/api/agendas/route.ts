import { NextResponse } from 'next/server';
import axios from 'axios';
import { getMongoClient } from "@/app/lib/mongodb";

const API_DELAY_MS = 150;
const MAX_EVENTS_PER_CALL = parseInt(process.env.MAX_EVENTS_PER_CALL ?? "5");

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchEventItems(eventId: number, baseUrl: string) {
    const itemsRes = await axios.get(`${baseUrl}/Events/${eventId}/EventItems`);
    const rawItems: any[] = itemsRes.data || [];
    const items = [];

    for (const item of rawItems) {
        if (!item.EventItemMatterId) continue;

        await sleep(API_DELAY_MS);
        const attachRes = await axios.get(`${baseUrl}/Matters/${item.EventItemMatterId}/Attachments`);
        const attachments = (attachRes.data || []).map((a: any) => ({
            label: a.MatterAttachmentName,
            url: a.MatterAttachmentHyperlink,
            attachmentId: a.MatterAttachmentId
        }));

        let matterText: string | null = null;
        try {
            await sleep(API_DELAY_MS);
            const versionsRes = await axios.get(`${baseUrl}/Matters/${item.EventItemMatterId}/Versions`);
            const versions: any[] = versionsRes.data || [];
            if (versions.length > 0) {
                const key = versions[versions.length - 1].Key;
                await sleep(API_DELAY_MS);
                const textRes = await axios.get(`${baseUrl}/Matters/${item.EventItemMatterId}/Texts/${key}`);
                matterText = textRes.data?.MatterTextPlain ?? null;
            }
        } catch {
            // Texts endpoint not available for this Legistar instance
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

    return items;
}

export async function GET() {
    try {
        const client = await getMongoClient();
        const db = client.db("Agenda");
        const eventsCol = db.collection("Events");
        const stateCol = db.collection("IngestState");

        const jurisdictions = await stateCol.find({ historicalComplete: true }).toArray();

        if (jurisdictions.length === 0) {
            return NextResponse.json({
                status: "awaiting_registration",
                message: "No jurisdictions registered. Run registerJurisdiction.ts first."
            });
        }

        const results: any[] = [];

        for (const jur of jurisdictions) {
            const { citySlug, legistarSlug, bodyNameContains, bodyType, latestEventDate } = jur;

            if (!legistarSlug || !bodyNameContains || !bodyType) {
                results.push({ citySlug, status: "error", message: "Missing config fields — run patchIngestState.ts or registerJurisdiction.ts for this jurisdiction" });
                continue;
            }

            const baseUrl = `https://webapi.legistar.com/v1/${legistarSlug}`;

            const bodiesRes = await axios.get(`${baseUrl}/Bodies`);
            const councils = (bodiesRes.data as any[]).filter(
                b => b.BodyTypeName === bodyType &&
                     b.BodyName.includes(bodyNameContains) &&
                     b.BodyActiveFlag === 1
            );

            if (councils.length === 0) {
                results.push({ citySlug, status: "error", message: `No bodies matching "${bodyNameContains}"` });
                continue;
            }

            const startFrom = new Date(latestEventDate);
            startFrom.setDate(startFrom.getDate() + 1);
            const endAt = new Date();

            if (startFrom > endAt) {
                results.push({ citySlug, status: "ok", eventsProcessed: 0, eventsAvailable: 0 });
                continue;
            }

            const fmt = (d: Date) => d.toISOString().split("T")[0];
            const bodyFilter = councils.map((b: any) => `EventBodyId eq ${b.BodyId}`).join(" or ");
            const eventsRes = await axios.get(
                `${baseUrl}/Events?$filter=(${bodyFilter}) and EventDate ge datetime'${fmt(startFrom)}' and EventDate le datetime'${fmt(endAt)}'&$orderby=EventDate asc`
            );

            const events: any[] = eventsRes.data || [];
            const batch = events.slice(0, MAX_EVENTS_PER_CALL);
            const failedEvents: { eventId: number; error: string }[] = [];
            let eventsProcessed = 0;
            let latestDate = new Date(latestEventDate);

            for (const event of batch) {
                try {
                    const items = await fetchEventItems(event.EventId, baseUrl);
                    const eventDoc = {
                        eventId: event.EventId,
                        citySlug,
                        bodyId: event.EventBodyId,
                        bodyName: event.EventBodyName ?? "",
                        eventDate: new Date(event.EventDate),
                        eventLocation: event.EventLocation ?? "",
                        phase: "ongoing",
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
                    eventsProcessed++;
                } catch (err) {
                    console.error(`Failed event ${event.EventId}:`, err);
                    failedEvents.push({ eventId: event.EventId, error: String(err) });
                }
            }

            if (eventsProcessed > 0) {
                await stateCol.updateOne(
                    { citySlug },
                    { $set: { latestEventDate: latestDate, lastRunAt: new Date() } }
                );
            }

            results.push({
                citySlug,
                status: failedEvents.length > 0 ? "partial" : "ok",
                eventsProcessed,
                eventsAvailable: events.length,
                failedEvents
            });
        }

        return NextResponse.json({ phase: "ongoing", results });

    } catch (error: any) {
        console.error("DETAILED ERROR:", error);
        return NextResponse.json({
            error: "Fetch failed",
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
