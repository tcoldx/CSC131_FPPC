import React from "react";
import {
  Shield,
  LayoutDashboard,
  TriangleAlert,
  Users,
  Settings,
  Database,
} from "lucide-react";
import Link from "next/link";

export default function OfficialsCard4() {
  return (
    <Link
      href="/officials/officialscard1"
      className=" hover:bg-gray-900 transition bg-[#0b1120] border flex flex-col gap-4 border-gray-800 rounded-xl p-7  h-55 w-95  "
    >
      <div className=" flex-1 relative  flex gap-3  ">
        <div className=" flex items-center justify-center rounded-full size-12 bg-gray-600">
          <Users className="text-sm size-6" />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <p className="font-bold">Michael Johnson</p>
          <p className=" font-thin text-sm text-gray-400 ">Board Member</p>
        </div>
        <div className="flex items-center px-1.5 p-1 gap-2 bg-amber-700/30 border border-amber-600 rounded-sm absolute top-0 right-0">
          {" "}
          <TriangleAlert className=" text-amber-600 size-3" />
          <span className="text-xs text-amber-600">7</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div>
          <p className="font-thin text-gray-500 text-sm">Agency</p>
          <p className=" text-gray-300 text-sm ">Transportation Authority</p>
        </div>
        <div>
          <p className="font-thin text-gray-500 text-sm ">Last filing</p>
          <p className=" text-gray-300 text-sm ">1/21/2026</p>
        </div>
      </div>
    </Link>
  );
}
