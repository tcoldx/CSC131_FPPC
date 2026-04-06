"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  LayoutDashboard,
  TriangleAlert,
  Users,
  Settings,
  Database,
} from "lucide-react";

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="flex">
      <aside
        className={` flex flex-col border-r h-full border-slate-700 ${open ? "w-64" : "w-16"} bg-slate-950 text-white transition-all`}
      >
        <div className="flex px-6 border-b border-slate-700 pb-6 pt-7 ">
          <div className="flex gap-3 items-center ">
            <Shield className="size-8 text-blue-400" />
            {open && (
              <div>
                <div className="font-semibold text-xl ">Ethics Monitor</div>
                <div className="text-gray-400 text-xs ">Conflict Detection</div>
              </div>
            )}
          </div>
        </div>

        <nav className=" p-5 flex flex-1 flex-col gap-1 border-b  border-slate-700 ">
          <Link
            href="/"
            className={` flex items-center gap-3 p-3 rounded-xl ${pathname === "/" ? " text-gray-400 hover:bg-slate-900 hover:text-gray-100 transition" : "border-blue-400 text-blue-400 bg-blue-900"}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            {open && <span>Dashboard</span>}
          </Link>
          <Link
            href="/"
            className={` flex items-center gap-3 p-3 rounded-xl ${pathname === "/" ? " text-gray-400 hover:bg-slate-900 hover:text-gray-100 transition" : "border-blue-400 text-blue-400 bg-blue-900"}`}
          >
            <TriangleAlert className="w-5 h-5" />
            {open && <span>Alerts</span>}
          </Link>
          <Link
            href="/"
            className={` flex items-center gap-3 p-3 rounded-xl ${pathname === "/" ? " text-gray-400 hover:bg-slate-900 hover:text-gray-100 transition" : "border-blue-400 text-blue-400 bg-blue-900"}`}
          >
            <Users className="w-5 h-5" />
            {open && <span>Officials</span>}
          </Link>
          <Link
            href="/"
            className={` flex items-center gap-3 p-3 rounded-xl ${pathname === "/" ? " text-gray-400 hover:bg-slate-900 hover:text-gray-100 transition" : "border-blue-400 text-blue-400 bg-blue-900"}`}
          >
            <Database className="w-5 h-5" />
            {open && <span>Data Soures</span>}
          </Link>
          <Link
            href="/"
            className={` flex items-center gap-3 p-3 rounded-xl ${pathname === "/" ? " text-gray-400 hover:bg-slate-900 hover:text-gray-100 transition" : "border-blue-400 text-blue-400 bg-blue-900"}`}
          >
            <Settings className="w-5 h-5" />
            {open && <span>Settings</span>}
          </Link>
          {/*<button onClick={() => setOpen(!open)} className="mb-4">
            {open ? "Close" : "Open"}
          </button> */}
        </nav>
      </aside>
    </div>
  );
}
