import Fuse, { FuseResultMatch } from "fuse.js";
import { AgendaItemEntry } from "../types/index";

export function buildFuseIndex(agendaItems: AgendaItemEntry[]): Fuse<AgendaItemEntry> {
  return new Fuse(agendaItems, {
    keys: [
      { name: "matterTitle", weight: 0.7 },
      { name: "matterText",  weight: 0.3 },
    ],
    threshold: 0.35,        // If score is above this, it's a match
    includeScore: true,
    includeMatches: true,   // Tell us what fields matched
  });
}

// I learned that Fuse's "score" is a distance metric, where 0 means an exact match and 1 means no match at all
// To convert this to a confidence score between 0 and 1, we can do (1 - score), rounded to 3 decimal places
export function fuseScoreToConfidence(fuseScore: number): number {
  return parseFloat((1 - fuseScore).toFixed(3));
}
