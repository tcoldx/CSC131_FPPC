type Severity = "HIGH" | "MEDIUM" | "LOW";

export default function RecentFlaggedMatches() {
  const matches: Array<{
    id: string;
    official: string;
    date: string;
    interest: string;
    severity: Severity;
  }> = [
    {
      id: "ALR-2024-0891",
      official: "Tim Duncan",
      date: "3/14/2026",
      interest: "Investment in TechCorp Holdings ($50,000 - $100,000)",
      severity: "HIGH",
    },
    {
      id: "ALR-2024-0889",
      official: "Tredis Ingram",
      date: "3/11/2026",
      interest: "Spouse employed by GreenEnergy Solutions",
      severity: "HIGH",
    },
    {
      id: "ALR-2024-0887",
      official: "Victor Lee",
      date: "3/9/2026",
      interest: "Real estate holdings in Downtown District",
      severity: "MEDIUM",
    },
    {
      id: "ALR-2024-0884",
      official: "Kelly Rowland",
      date: "3/7/2026",
      interest: "Board member of Healthcare Providers Alliance",
      severity: "MEDIUM",
    },
    {
      id: "RAND-2026-0881",
      official: "Iraj Sabzevari",
      date: "3/4/2026",
      interest: "Income from consulting - Urban Development LLC ($10,000+)",
      severity: "LOW",
    },
  ];

  const severityStyles = {
    HIGH: "bg-red-950/80 text-red-400 ring-red-500/30",
    MEDIUM: "bg-orange-950/80 text-orange-400 ring-orange-500/30",
    LOW: "bg-yellow-950/80 text-yellow-400 ring-yellow-500/30",
  };

  return (
    <div className="bg-[#050816] text-white rounded-2xl border border-white/10 p-6 w-full shadow-lg">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Recent Flagged Matches</h2>
          <p className="text-sm text-gray-400 mt-1">
            Latest potential conflicts detected by the system
          </p>
        </div>

        <a
          href="#"
          className="text-sky-400 text-sm font-medium hover:text-sky-300 transition"
        >
          View all →
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-left text-sm text-gray-300">
              <th className="pb-4 pr-6 font-medium">Alert ID</th>
              <th className="pb-4 pr-6 font-medium">Official</th>
              <th className="pb-4 pr-6 font-medium">Date</th>
              <th className="pb-4 pr-6 font-medium">Matched Interest</th>
              <th className="pb-4 font-medium">Severity</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {matches.map((match, index) => {
              const splitId = match.id.split("-");
              const officialName = match.official.split(" ");

              return (
                <tr
                  key={match.id}
                  className={index !== matches.length - 1 ? "border-b border-white/10" : ""}
                >
                  <td className="py-6 pr-6 text-sky-400 font-medium leading-7">
                    {splitId[0]}-
                    <br />
                    {splitId[1]}-
                    <br />
                    {splitId[2]}
                  </td>

                  <td className="py-6 pr-6 text-white leading-7">
                    {officialName[0]}
                    <br />
                    {officialName[1]}
                  </td>

                  <td className="py-6 pr-6 text-gray-200 whitespace-nowrap">
                    {match.date}
                  </td>

                  <td className="py-6 pr-6 text-gray-100">{match.interest}</td>

                  <td className="py-6">
                    <span
                      className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold ring-1 ring-inset ${severityStyles[match.severity]}`}
                    >
                      {match.severity}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}