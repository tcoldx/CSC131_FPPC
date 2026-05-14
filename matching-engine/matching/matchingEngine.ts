import { Official, Event, FlaggedResult } from "../types/index";
import { normalize } from "./normalize";
import { buildFuseIndex, fuseScoreToConfidence } from "./fuseEngine";

const SLUG_MAP: Record<string, string> = {
  "County of Sonoma":   "sonoma-county",
  "City of Sacramento": "sacramento",
};

function agencyToCitySlug(citySlug: string): string {
  return SLUG_MAP[citySlug] ?? citySlug.toLowerCase().replace(/\s+/g, "-");
}

export function runMatchingEngine(
  officials: Official[],
  events: Event[]
): FlaggedResult[] {
  const flagged: FlaggedResult[] = [];

  for (const official of officials) {
    if (!official.citySlug) continue;

    const officialSlug = agencyToCitySlug(official.citySlug);

    const relevantEvents = events.filter(
      (e) => e.citySlug === officialSlug
    );

    if (relevantEvents.length === 0) continue;

    const allItems = relevantEvents.flatMap((event) =>
      event.items.map((item) => ({ item, event }))
    );

    const fuse = buildFuseIndex([...allItems.map((a) => a.item)]);
    const normalizedBusiness = normalize(official.businessName);
    const results = fuse.search(normalizedBusiness);

    for (const result of results) {
      const confidence = fuseScoreToConfidence(result.score ?? 1);
      if (confidence >= 0.50) {
        const matched = allItems.find(
          (a) => a.item.eventItemId === result.item.eventItemId
        );
        if (!matched) continue;

        flagged.push({
          officialId:     official._id,
          officialName:   `${official.firstName} ${official.lastName}`,
          agency:         official.citySlug,
          businessName:   official.businessName,
          investmentType: official.investmentType,
          citySlug:       matched.event.citySlug,
          bodyName:       matched.event.bodyName,
          eventDate:      matched.event.eventDate,
          matterTitle:    result.item.matterTitle,
          matterText:     result.item.matterText,
          score:          confidence,
          createdAt:      new Date(),
        });
      }
    }
  }

  return flagged;
}