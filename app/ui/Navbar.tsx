"use client";
import React, { useState, useEffect, useRef } from "react";
import { Search, Bell, User, Menu } from "lucide-react";
import { NavCard } from "./navbarcard";

type RawOfficial = {
  _id: string;
  ["lastName"]?: string;
  ["firstName"]?: string;
  ["middleName"]?: string;
  ["citySlug"]?: string;
  ["position"]?: string;
  ["email"]: string;
  ["filingType"]: string;
  ["filingYear"]: string;
  ["businessName"]: string;
  ["businessDescription"]: string;
  ["valueRange"]: string;
  ["investmentType"]: string;
};
// entire object types defined and needed for prop drilling.
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

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [officialData, setOfficialData] = useState<Official[]>([]);
  const [filteredOfficials, setFilteredOfficials] = useState<Official[]>([]);
  const [officialSearch, setOfficialSearch] = useState("");
  const dropdownRef = useRef<any>(null);
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
              official["firstName"]?.trim() && official["lastName"]?.trim()
          )
          .map((official) => ({
            _id: official._id || "",
            firstName: official["firstName"] || "",
            lastName: official["lastName"] || "",
            middleName: official["middleName"] || "",
            citySlug: official["citySlug"] || "",
            position: official.position || "",
            email: official.email || "",
            filingType: official.filingType || "",
            filingYear: official.filingYear || "",
            businessName: official.businessName || "",
            businessDescription: official.businessDescription || "",
            valueRange: official.valueRange || "",
            investmentType: official.investmentType || " "
          }));

        setOfficialData(normalizedData);
        setFilteredOfficials([]);

      } catch (error) {
        console.error("given error from failed response:", error);
      }
    };

    fetchOfficials();
  }, []);

  useEffect(() => {
    function dropTheMenuClick(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
      document.addEventListener("mousedown", dropTheMenuClick);

    return () => {
      document.removeEventListener("mousedown", dropTheMenuClick);
    }
  },[])

  function onChangeFunction(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setOfficialSearch(value);
    const search = value.toLowerCase().trim();
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
        official.citySlug.toLowerCase().includes(search)
      );
    });

    setFilteredOfficials(filtered);
  }

  return (
    <header  className="h-16 w-full bg-slate-950 border-b border-gray-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <button className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <Menu className="size-5 text-gray-400" />
        </button>
    {/* the container for the input*/}
        <div className="flex-1 max-w-xl hidden md:block">
          <div ref={dropdownRef} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />

            <input
          
              value={officialSearch}
              onFocus={() => setDropdownOpen(true)}
              onChange={onChangeFunction}
              type="text"
              placeholder="Search officials, alerts, or documents..."
              className="pl-10 bg-[#1a1a24] border border-gray-700 text-gray-100 placeholder:text-gray-500 p-2 rounded-md w-full focus:ring-2 focus:ring-gray-500 focus:outline-none"
            />
          {/* the dropdown menu container */}
            {dropdownOpen && (
              <div className="absolute top-full left-0 w-full bg-[#1a1a24] border border-gray-700 rounded-md mt-1 p-2 text-sm text-gray-300 z-50">
                <div className="font-semibold mb-2">Search Results</div>

                <div className="flex flex-col gap-2">
                  {officialSearch.trim() === "" ? (
                    <div className="text-gray-500">Start typing to search officials</div>
                  ) : filteredOfficials.length > 0 ? (
                    filteredOfficials.slice(0, 5).map((official) => (
                      <NavCard onSelect={() => setDropdownOpen(false)} key={official._id} od={official}/>
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