"use client";
import { useEffect, useState } from "react";

interface Official {
  _id: string;
  firstName: string;
  lastName: string;
  agency: string;
  position: string;
  filingYear: string;
  businessName: string;
  investmentType: string;
  citySlug: string;
}

export default function OfficialsPage() {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function fetchOfficials() {
      try {
        const res  = await fetch("/api/officials");
        const data = await res.json();
        setOfficials(data);
      } catch (err) {
        console.error("Failed to fetch officials:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOfficials();
  }, []);

  return (
    <div className="flex-1 bg-slate-950 h-screen p-2 flex flex-col gap-10">
      <header className="h-16 w-full bg-slate-950 flex items-start flex-col justify-start gap-1">
        <h1 className="text-3xl font-semibold text-gray-300">Officials</h1>
        <p className="text-md text-gray-400">
          Public officials with Form 700 financial disclosures on file
        </p>
      </header>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading officials...</p>
      ) : officials.length === 0 ? (
        <p className="text-gray-400 text-sm">No officials found.</p>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {officials.map((official) => (
            <div
              key={official._id?.toString()}
              className="bg-[#0b1120] border border-gray-800 rounded-xl p-5 shadow-md flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-lg">
                  {official.firstName} {official.lastName}
                </h3>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-md">
                  {official.filingYear}
                </span>
              </div>
              <p className="text-sky-400 text-sm">{official.position}</p>
              <p className="text-gray-400 text-sm">{official.agency}</p>
              <div className="mt-2 pt-2 border-t border-gray-800">
                <p className="text-gray-500 text-xs">Financial Interest</p>
                <p className="text-gray-300 text-sm mt-1">{official.businessName}</p>
                <p className="text-gray-500 text-xs mt-1">{official.investmentType}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}