import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { name: "Sep", value: 12 },
  { name: "Oct", value: 18 },
  { name: "Nov", value: 15 },
  { name: "Dec", value: 22 },
  { name: "Jan", value: 19 },
  { name: "Feb", value: 24 },
  { name: "Mar", value: 28 },
];

export default function DashboardChart() {
  return (
    <header className="flex-1 min-w-[250px] min-h-[250px] bg-[#0b1120] border border-gray-800 rounded-xl p-6 shadow-md">
      <h1 className="text-lg font-semibold text-white ">
        Flagged Matches Over Time
      </h1>
      <p className="text-gray-400 text-sm mb-4">
        Number of potential conflicts detected per month
      </p>

      {/* start of chart container */}
      <div className="w-full h-64">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </header>
  );
}
