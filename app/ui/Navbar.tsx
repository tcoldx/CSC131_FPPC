"use client";
import React, { useState, useEffect } from "react";
import { Search, Bell, User, Menu } from "lucide-react";

type RawOfficial = {
  _id: string;
  ["Last Name"]?: string;
  ["First Name"]?: string;
  ["Middle Name"]?: string;
  ["Agency"]?: string;
  ["Position"]?: string;
  ["Work Email Address"]?: string;
  ["Filing Type"]?: string;
  ["Filing Year"]?: string;
  ["Due Date"]?: string;
  ["Filed Date"]?: string;
  ["NAME OF BUSINESS ENTITY"]?: string;
};

type Official = {
  _id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  agency: string;
  position: string;
  workEmail: string;
  filingType: string;
  filingYear: string;
  dueDate: string;
  filingDate: string;
  businessEntityName: string;
};

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [officialData, setOfficialData] = useState<Official[]>([]);
  const [filteredOfficials, setFilteredOfficials] = useState<Official[]>([]);
  const [officialSearch, setOfficialSearch] = useState("");

  useEffect(() => {
    const fetchOfficials = async () => {
      try {
        const response = await fetch("/api/officials");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: RawOfficial[] = await response.json();

        const normalizedData: Official[] = data
          .filter(
            (official) =>
              official["First Name"]?.trim() && official["Last Name"]?.trim()
          )
          .map((official) => ({
            _id: official._id,
            firstName: official["First Name"] || "",
            lastName: official["Last Name"] || "",
            middleName: official["Middle Name"] || "",
            agency: official["Agency"] || "",
            position: official["Position"] || "",
            workEmail: official["Work Email Address"] || "",
            filingType: official["Filing Type"] || "",
            filingYear: official["Filing Year"] || "",
            dueDate: official["Due Date"] || "",
            filingDate: official["Filed Date"] || "",
            businessEntityName: official["NAME OF BUSINESS ENTITY"] || "",
          }));

        setOfficialData(normalizedData);
        setFilteredOfficials([]);

        console.log("Fetched officials data:", normalizedData);
      } catch (error) {
        console.error("given error from failed response:", error);
      }
    };

    fetchOfficials();
  }, []);

  function onChangeFunction(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setOfficialSearch(value);

    const search = value.toLowerCase().trim();
    console.log("User search input:", value);

    if (!search) {
      setFilteredOfficials([]);
      return;
    }

    const filtered = officialData.filter((official) => {
      const fullName = `${official.firstName} ${official.lastName}`.toLowerCase();

      return (
        official.firstName.toLowerCase().includes(search) ||
        official.lastName.toLowerCase().includes(search) ||
        fullName.includes(search) ||
        official.position.toLowerCase().includes(search) ||
        official.agency.toLowerCase().includes(search)
      );
    });

    setFilteredOfficials(filtered);
  }

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
              value={officialSearch}
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => {
                setTimeout(() => setDropdownOpen(false), 150);
              }}
              onChange={onChangeFunction}
              type="text"
              placeholder="Search officials, alerts, or documents..."
              className="pl-10 bg-[#1a1a24] border border-gray-700 text-gray-100 placeholder:text-gray-500 p-2 rounded-md w-full focus:ring-2 focus:ring-gray-500 focus:outline-none"
            />

            {dropdownOpen && (
              <div className="absolute top-full left-0 w-full bg-[#1a1a24] border border-gray-700 rounded-md mt-1 p-2 text-sm text-gray-300 z-50">
                <div className="font-semibold mb-2">Search Results</div>

                <div className="flex flex-col gap-2">
                  {officialSearch.trim() === "" ? (
                    <div className="text-gray-500">Start typing to search officials</div>
                  ) : filteredOfficials.length > 0 ? (
                    filteredOfficials.slice(0, 5).map((official) => (
                      <div
                        key={official._id}
                        className="p-2 hover:bg-gray-800 rounded-md cursor-pointer transition-colors"
                      >
                        <div className="font-medium">
                          {official.firstName} {official.lastName}
                        </div>
                        <div className="text-xs text-gray-400">
                          {official.position || "No position listed"}
                          {official.agency ? ` • ${official.agency}` : ""}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">No results found</div>
                  )}
                </div>
              </div>
            )}
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
  );
}