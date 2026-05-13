const LEGAL_SUFFIXES = /\b(inc|corp|llc|ltd|co|company|corporation)\b\.?/gi;

// All known aliases for company names. We need to add more as we encounter them in the data. This is a way to handle common abbreviations.
export const ALIASES: Record<string, string> = {
  "pg&e": "pacific gas electric",
  "pge":  "pacific gas electric",
  "aapl": "apple",
  "tsla": "tesla",
  "JCI": "johnson controls",
  "LOW": "lowes companies",
};

// Normalizes company names by lowercasing, removing legal suffixes, punctuation, and extra spaces; also applies known aliases
export function normalize(name: string): string {
  let result = name.toLowerCase();
  result = result.replace(LEGAL_SUFFIXES, "");
  result = result.replace(/[^\w\s]/g, "");
  result = result.replace(/\s+/g, " ").trim();
  return ALIASES[result] ?? result;
}