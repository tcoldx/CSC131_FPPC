"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { User2, ArrowLeft } from "lucide-react";

type Official = {
  _id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  citySlug: string;
  position: string;
  email: string;
  filingType: string;
  filingYear: string;
  businessName: string;
  businessDescription: string;
  valueRange: string;
  investmentType: string;
};

export default function OfficialPage() {
  const params = useParams();
  const id = params?.id as string;

  const [official, setOfficial] = useState<Official | null>(null);
  const [filteredOfficial, setFilteredOfficial] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfficial = async () => {
      try {
        const res = await fetch(`/api/officials/${id}`);
        const officialRes = await fetch(`/api/officials`);
        const officialData = await officialRes.json();
        // get all official info by name
        const data = await res.json();
        setOfficial(data);
        const filteredOfficial = officialData.filter((o: Official) => o.firstName === data.firstName && o.lastName === data?.lastName);
        setFilteredOfficial(filteredOfficial);
      } catch (err) {
        console.error("Failed to load official:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOfficial();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 opacity-70 text-white bg-gray-900 min-h-screen">
        Loading profile...
      </div>
    );
  }

  if (!official) {
    return (
      <div className="p-6 text-white bg-gray-900 min-h-screen">
        Official not found.
      </div>
    );
  }

  const fullName = `${official.firstName} ${
    official.middleName ?? ""
  } ${official.lastName}`;

  return (
    <div className="min-h-screen text-white bg-darkblue-999">
      
      {/* HEADER */}
      <div className="border-b border-white/10 px-6 py-6">
        
        {/* BACK LINK */}
        <Link
          href="/officials"
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Officials
        </Link>

        {/* PROFILE ROW */}
        <div className="flex flex-row items-center justify-between gap-4">
          
          {/* ICON */}
          <div className="flex flex-row items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <User2 className="h-8 w-8 text-white/80" />
          </div>

          {/* TEXT */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold leading-tight">
              {fullName}
            </h1>

            <p className="text-sm text-white/70">
              {official.position}
            </p>

            <p className="text-sm text-white/50">
              {official.citySlug}
            </p>
          </div>
          </div>
          <div>
            Total Alerts: 
            <p className="font-medium text-orange-300">{Math.round(Math.random() * 50)}</p>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-3">
        
        {/* MAIN CONTENT */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* FINANCIAL DISCLOSURE */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="mb-4 text-lg font-semibold">
              Form 700 Financial Disclosure
            </h2>

            <div className="space-y-4">
              
              {/* INVESTMENT CARD */}
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="text-xs tracking-wide text-white/50">
                  INVESTMENT
                </p>

                <p className="mt-1 font-medium">
                  {official.businessName}
                </p>

                <p className="mt-1 text-sm text-white/70">
                  Value: {official.valueRange}
                </p>
              </div>

              {/* TYPE CARD */}
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="text-xs tracking-wide text-white/50">
                  TYPE
                </p>

                <p className="mt-1 font-medium">
                  {official.investmentType}
                </p>

                <p className="mt-1 text-sm text-white/70">
                  {official.businessDescription}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SIDE PANEL */}
        <div className="space-y-6">
          
          {/* QUICK STATS */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h3 className="mb-4 text-lg font-semibold">
              Quick Stats
            </h3>

            <div className="space-y-4 text-sm">
              
              <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                <span className="text-white/60">Email</span>

                <span className="text-right break-all">
                  {official.email}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-white/60">
                  Total Alerts
                </span>

                <span className="text-orange-300">0</span>
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-white/60">
                  Economic Interests
                </span>

                <span className="text-medium text-blue-300">{filteredOfficial.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">
                  Last Filing
                </span>

                <span className="text-medium text-white-300">{official.investmentType}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}