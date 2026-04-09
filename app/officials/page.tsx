import React from "react";
import {
  Shield,
  LayoutDashboard,
  TriangleAlert,
  Users,
  Settings,
  Database,
} from "lucide-react";
import OfficialsCard from "../ui/officials-card1";
import OfficialsCard2 from "../ui/officials-card2";
import OfficialsCard3 from "../ui/officials-card3";
import OfficialsCard4 from "../ui/officials-card4";
import OfficialsCard5 from "../ui/officials-card5";

export default function OfficialsPage() {
  return (
    <div className="flex-1 bg-slate-950 h-screen p-10 flex flex-col gap-7">
      <header className="h-16 w-full bg-slate-950 flex items-start flex-col justify-start gap-1">
        <h1 className="text-3xl font-semibold text-gray-300 font ">
          Officials
        </h1>
        <p className="text-md text-gray-400">
          Public officials with Form 700 financial disclosures on file
        </p>
      </header>
      <div className="grid grid-cols-3 gap-5">
        <OfficialsCard />
        <OfficialsCard2 />
        <OfficialsCard3 />
        <OfficialsCard4 />
        <OfficialsCard5 />
      </div>
    </div>
  );
}
