"use client";
import { useEffect, useState } from "react";

export default function DashStats() {
  const [totalAlerts, setTotalAlerts]     = useState(0);
  const [recentFlags, setRecentFlags]     = useState(0);
  const [dataSources, setDataSources]     = useState(0);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res  = await fetch("/api/flagged-results");
        const data = await res.json();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        setTotalAlerts(data.length);
        setRecentFlags(
          data.filter((r: any) => new Date(r.createdAt) >= thirtyDaysAgo).length
        );
        setDataSources(
          new Set(data.map((r: any) => r.citySlug)).size
        );
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    }
    fetchStats();
  }, []);

  return (
    <div>
      <div className="flex gap-6 flex-wrap">
        {/* Card 1 */}
        <div className="flex-1 min-w-[250px] bg-[#0b1120] border border-gray-800 rounded-xl p-5 shadow-md">
          <p className="text-gray-400 text-sm">Total Alerts</p>
          <h2 className="text-3xl font-semibold text-gray-300 mt-2">{totalAlerts}</h2>
          <p className="text-gray-500 text-sm mt-1">{totalAlerts} active, 0 archived</p>
        </div>
        {/* Card 2 */}
        <div className="flex-1 min-w-[250px] bg-[#0b1120] border border-gray-800 rounded-xl p-5 shadow-md">
          <p className="text-gray-400 text-sm">Recent Flags</p>
          <h2 className="text-3xl font-semibold text-gray-300 mt-2">{recentFlags}</h2>
          <p className="text-gray-500 text-sm mt-1">Last 30 days</p>
        </div>
        {/* Card 3 */}
        <div className="flex-1 min-w-[250px] bg-[#0b1120] border border-gray-800 rounded-xl p-5 shadow-md">
          <p className="text-gray-400 text-sm">Data Sources</p>
          <h2 className="text-3xl font-semibold text-gray-300 mt-2">{dataSources}</h2>
          <p className="text-gray-500 text-sm mt-1">Active sources</p>
        </div>
        {/* Card 4 */}
        <div className="flex-1 min-w-[250px] bg-[#0b1120] border border-gray-800 rounded-xl p-5 shadow-md">
          <p className="text-gray-400 text-sm">Pipeline Status</p>
          <h2 className="text-3xl font-semibold mt-2 text-red-400">Disabled</h2>
          <p className="text-gray-500 text-sm mt-1">Processing in real-time</p>
        </div>
      </div>
    </div>
  );
}