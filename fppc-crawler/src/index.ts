import { getRow } from "./excelReader.js";
import { buildQueries } from "./queryBuilder.js";
import { runScraper } from "./main.js";

async function main() {

  console.log("\nReading Excel row...");

  const row = await getRow();

  console.log("Row Data:", row);

  console.log("\nBuilding queries...");

  const queries = buildQueries(row);

  console.log("Queries:", queries);

  console.log("\nRunning scraper...\n");

  await runScraper(queries);

}

main();