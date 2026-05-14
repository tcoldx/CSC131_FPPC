"use client";
import { useEffect, useState } from "react";

type Severity = "HIGH" | "MEDIUM" | "LOW";

interface FlaggedResult {
  _id: string;
  officialName: string;
  createdAt: string;
  businessName: string;
  matterTitle: string;
  score: number;
  citySlug: string;
}

function getSeverity(score: number): Severity {
  if (score >= 0.75) return "HIGH";
  if (score >= 0.50) return "MEDIUM";
  return "LOW";
}

const severityStyles = {
  HIGH:   "bg-red-950/80 text-red-400 ring-red-500/30",
  MEDIUM: "bg-orange-950/80 text-orange-400 ring-orange-500/30",
  LOW:    "bg-yellow-950/80 text-yellow-400 ring-yellow-500/30",
};

export default function RecentFlaggedMatches() {
  const [matches, setMatches] = useState<FlaggedResult[]>([]);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res  = await fetch("/api/flagged-results");
        const data = await res.json();
        // Show only the 5 most recent
        setMatches(data.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch flagged results:", err);
      }
    }
    fetchMatches();
  }, []);

  return (
    <div className="bg-[#050816] text-white rounded-2xl border border-white/10 p-6 w-full shadow-lg">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Recent Flagged Matches</h2>
          <p className="text-sm text-gray-400 mt-1">
            Latest potential conflicts detected by the system
          </p>
        </div>
        <a href="/alerts" className="text-sky-400 text-sm font-medium hover:text-sky-300 transition">
          View all →
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-left text-sm text-gray-300">
              <th className="pb-4 pr-6 font-medium">Official</th>
              <th className="pb-4 pr-6 font-medium">Date</th>
              <th className="pb-4 pr-6 font-medium">Business Interest</th>
              <th className="pb-4 pr-6 font-medium">Agenda Item</th>
              <th className="pb-4 font-medium">Severity</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {matches.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  No flagged results found
                </td>
              </tr>
            ) : (
              matches.map((match, index) => {
                const severity = getSeverity(match.score);
                return (
                  <tr
                    key={match._id?.toString() ?? index}
                    className={index !== matches.length - 1 ? "border-b border-white/10" : ""}
                  >
                    <td className="py-6 pr-6 text-white font-medium">
                      {match.officialName}
                    </td>
                    <td className="py-6 pr-6 text-gray-200 whitespace-nowrap">
                      {new Date(match.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-6 pr-6 text-gray-100">
                      {match.businessName}
                    </td>
                    <td className="py-6 pr-6 text-gray-100 max-w-[200px] truncate">
                      {match.matterTitle}
                    </td>
                    <td className="py-6">
                      <span className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold ring-1 ring-inset ${severityStyles[severity]}`}>
                        {severity}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}