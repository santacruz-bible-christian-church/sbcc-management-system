import { HiClipboardList } from "react-icons/hi";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

const ministryData = [
    { name: "Worship Team", value: 40 },
    { name: "Youth Ministry", value: 55 },
    { name: "Kids Ministry", value: 35 },
    { name: "Outreach", value: 25 },
    { name: "Tech/Media", value: 30 },
    { name: "Small Groups", value: 45 }
];

const COLORS = [
    "#FDB54A",
    "#0088FE",
    "#FF6384",
    "#4BC0C0",
    "#9966FF",
    "#36A2EB"
];

export default function MinistryPieChart() {
    return (
        <div className="w-[60%] col-span-5 bg-white shadow-lg rounded-2xl p-6">
            <div className="flex gap-3">
                <HiClipboardList className="h-7 w-7 p-1 bg-orange-200 rounded text-orange-500" />
                <h3 className="text-l font-bold text-gray-900 mb-4">
                    Ministry Distribution
                </h3>
            </div>

            <div className="flex flex-col items-center gap-1 h-[90%] w-full">
                <div className="flex-1 text-[10px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={ministryData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                label
                            >
                                {ministryData.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap justify-center gap-2 h-10">
                    {ministryData.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-[10px] text-gray-700">{entry.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

    );
}
