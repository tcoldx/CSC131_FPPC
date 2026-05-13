import { Official, Event, FlaggedResult } from "../types/index";
import { normalize } from "./normalize";
import { buildFuseIndex, fuseScoreToConfidence } from "./fuseEngine";

// convert "City of Sacramento" to "sacramento" to match citySlug format
function agencyToCitySlug(agency: string): string {
  return agency
    .toLowerCase()
    .replace(/^(city of|county of|town of)\s+/, "")  // strip prefix
    .replace(/\s+/g, "-")                             // spaces to hyphens
    .trim();
}

export function runMatchingEngine(
  officials: Official[],
  events: Event[]                                     // takes full Event objects now
): FlaggedResult[] {
  const flagged: FlaggedResult[] = [];

  for (const official of officials) {

    // Skip officials with no agency field
    if (!official.agency) continue;
    
    const officialSlug = agencyToCitySlug(official.agency);

    // Filter events to only this official's jurisdiction using citySlug
    const relevantEvents = events.filter(
      (e) => e.citySlug === officialSlug
    );

    if (relevantEvents.length === 0) continue;

    // Flatten all items from all relevant events into one searchable list
    // but keep a reference back to the parent event for the report
    const allItems = relevantEvents.flatMap((event) =>
      event.items.map((item) => ({ item, event }))
    );

    // Build Fuse index over just the AgendaItemEntry objects
    const fuse = buildFuseIndex(allItems.map((a) => a.item));

    const normalizedBusiness = normalize(official.businessName);
    const results = fuse.search(normalizedBusiness);

    for (const result of results) {
      const confidence = fuseScoreToConfidence(result.score ?? 1);
      if (confidence >= 0.65) {
        // Find the parent event for this matched item
        const matched = allItems.find(
          (a) => a.item.eventItemId === result.item.eventItemId
        );

        if (!matched) continue;

        flagged.push({
          officialId:    official._id,
          officialName:  `${official.firstName} ${official.lastName}`,
          agency:        official.agency,
          businessName:  official.businessName,
          investmentType: official.investmentType,
          citySlug:      matched.event.citySlug,
          bodyName:      matched.event.bodyName,
          eventDate:     matched.event.eventDate,
          matterTitle:   result.item.matterTitle,
          matterText:    result.item.matterText,
          score:         confidence,
          createdAt:     new Date(),  // add timestamp for when this was flagged
        });
      }
    }
  }

  return flagged;
}