"use client";
import { useEffect, useState } from "react";

type Severity = "HIGH" | "MEDIUM" | "LOW";

interface FlaggedResult {
  _id: string;
  officialName: string;
  agency: string;
  businessName: string;
  investmentType: string;
  matterTitle: string;
  citySlug: string;
  eventDate: string;
  createdAt: string;
  score: number;
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

export default function AlertsPage() {
  const [alerts, setAlerts]   = useState<FlaggedResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res  = await fetch("/api/flagged-results");
        const data = await res.json();
        setAlerts(data);
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  return (
    <div className="flex-1 bg-slate-950 min-h-screen p-6 flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-gray-300">Alerts</h1>
        <p className="text-md text-gray-400">
          All potential conflicts of interest detected by the system
        </p>
      </header>

      <div className="bg-[#050816] text-white rounded-2xl border border-white/10 p-6 shadow-lg">
        {loading ? (
          <p className="text-gray-400 text-sm">Loading alerts...</p>
        ) : alerts.length === 0 ? (
          <p className="text-gray-400 text-sm">No alerts found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-left text-sm text-gray-300">
                  <th className="pb-4 pr-6 font-medium">Official</th>
                  <th className="pb-4 pr-6 font-medium">Agency</th>
                  <th className="pb-4 pr-6 font-medium">Business Interest</th>
                  <th className="pb-4 pr-6 font-medium">Investment Type</th>
                  <th className="pb-4 pr-6 font-medium">Agenda Item</th>
                  <th className="pb-4 pr-6 font-medium">Event Date</th>
                  <th className="pb-4 pr-6 font-medium">Score</th>
                  <th className="pb-4 font-medium">Severity</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {alerts.map((alert, index) => {
                  const severity = getSeverity(alert.score);
                  return (
                    <tr
                      key={alert._id?.toString() ?? index}
                      className={index !== alerts.length - 1 ? "border-b border-white/10" : ""}
                    >
                      <td className="py-4 pr-6 text-white font-medium whitespace-nowrap">
                        {alert.officialName}
                      </td>
                      <td className="py-4 pr-6 text-gray-300 whitespace-nowrap">
                        {alert.agency}
                      </td>
                      <td className="py-4 pr-6 text-gray-100">
                        {alert.businessName}
                      </td>
                      <td className="py-4 pr-6 text-gray-300">
                        {alert.investmentType}
                      </td>
                      <td className="py-4 pr-6 text-gray-100 max-w-[250px] truncate">
                        {alert.matterTitle}
                      </td>
                      <td className="py-4 pr-6 text-gray-300 whitespace-nowrap">
                        {new Date(alert.eventDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 pr-6 text-gray-300">
                        {(alert.score * 100).toFixed(0)}%
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold ring-1 ring-inset ${severityStyles[severity]}`}>
                          {severity}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}