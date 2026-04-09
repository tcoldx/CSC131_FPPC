"use client";
import react from "react";
import { Search, Bell, User, Menu } from "lucide-react";

export default function Navbar() {
    return (
        <header className="h-16 w-full bg-slate-950 border-b border-gray-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <button className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <Menu className="size-5 text-gray-400" />
        </button>
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search officials, alerts, or documents..."
              className="pl-10 bg-[#1a1a24] border-gray-700 text-gray-100 placeholder:text-gray-500 p-1 rounded-md w-full focus:ring-2 focus:ring-gray-500 focus:outline-none"
            />
          </div>
        </div>
        <button className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <Search className="size-5 text-gray-400" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <Bell className="size-5 text-gray-400" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm text-gray-300">Admin User</p>
            <p className="text-xs text-gray-400">Ethics Division</p>
          </div>
          <div className="size-9 bg-gray-700 rounded-full flex items-center justify-center">
            <User className="size-5 text-gray-300" />
          </div>
        </div>
      </div>
    </header>
    )
}