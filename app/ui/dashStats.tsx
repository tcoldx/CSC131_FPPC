import react from "react";

export default function DashStats() {
    return (
        <div>
            <div className="flex gap-6 flex-wrap">
        
        {/* Card 1 */}
        <div className="flex-1 min-w-[250px] bg-[#0b1120] border border-gray-800 rounded-xl p-5 shadow-md">
          <p className="text-gray-400 text-sm">Total Alerts</p>
          <h2 className="text-3xl font-semibold text-gray-300 mt-2">6</h2>
          <p className="text-gray-500 text-sm mt-1">
            3 active, 3 archived
          </p>
        </div>

        {/* Card 2 */}
        <div className="flex-1 min-w-[250px] bg-[#0b1120] border border-gray-800 rounded-xl p-5 shadow-md">
          <p className="text-gray-400 text-sm">Recent Flags</p>
          <h2 className="text-3xl font-semibold text-gray-300 mt-2">3</h2>
          <p className="text-gray-500 text-sm mt-1">
            Last 30 days
          </p>
        </div>

        {/* Card 3 */}
        <div className="flex-1 min-w-[250px] bg-[#0b1120] border border-gray-800 rounded-xl p-5 shadow-md">
          <p className="text-gray-400 text-sm">Data Sources</p>
          <h2 className="text-3xl font-semibold text-gray-300 mt-2">4/5</h2>
          <p className="text-gray-500 text-sm mt-1">
            Active sources
          </p>
        </div>

        {/* Card 4 */}
        <div className="flex-1 min-w-[250px] bg-[#0b1120] border border-gray-800 rounded-xl p-5 shadow-md">
          <p className="text-gray-400 text-sm">Pipeline Status</p>
          <h2 className="text-3xl font-semibold mt-2 text-green-400">
            Active
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Processing in real-time
          </p>
        </div>

      </div>
        </div>
    );
}
