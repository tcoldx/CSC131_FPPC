"use client";

import { useState } from "react";
import Link from "next/link";

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex">
      <aside
        className={`${open ? "w-64" : "w-16"} bg-amber-950 text-white p-4 transition-all`}
      >
        <button onClick={() => setOpen(!open)} className="mb-4">
          {open ? "Close" : "Open"}
        </button>

        <nav className="flex flex-col gap-2">
          <Link href="">Dashboard</Link>
          <Link href="">Alerts</Link>
          <Link href="">Officals</Link>
          <Link href="">Data Sources</Link>
          <Link href="">Settings</Link>
        </nav>
      </aside>
    </div>
  );
}
