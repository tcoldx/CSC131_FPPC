import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";

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

async function patch() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("Missing MONGODB_URI");
    const client = new MongoClient(uri);
    await client.connect();
    const stateCol = client.db("Agenda").collection("IngestState");

    await stateCol.updateOne(
        { citySlug: "sonoma-county" },
        {
            $set: {
                legistarSlug: "Sonoma-county",
                bodyNameContains: "Board of Supervisors",
                bodyType: "Primary Legislative Body",
                latestEventDate: new Date()
            }
        }
    );
    console.log("Sonoma IngestState patched.");

    await stateCol.updateOne(
        { citySlug: "sacramento" },
        {
            $set: {
                legistarSlug: "sacramento",
                bodyNameContains: "City Council",
                bodyType: "Primary Legislative Body",
                latestEventDate: new Date()
            }
        }
    );
    console.log("Sacramento IngestState patched.");

    await client.close();
}

patch().catch(err => { console.error(err); process.exit(1); });
