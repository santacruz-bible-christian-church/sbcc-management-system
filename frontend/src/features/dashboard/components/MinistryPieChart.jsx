import { HiClipboardList } from "react-icons/hi";
import { useDashboardStats } from "../hooks/useDashboardStats";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from "recharts";

const ministryColors = {
    'Music Ministry': '#3B00DD',
    'Youth Ministry': '#9800B4',
    'Children Ministry': '#FF00E4',
    'Prayer Ministry': '#00FF4B',
    'Media Ministry': '#5b8f95',
    'Worship Ministry': '#8D00FF',
    'Usher Ministry': '#FFDF00',
};
console.log(ministryColors['Music Ministry'])

const getMinistryColor = (ministry) => {
    return ministryColors[ministry]
};

export default function MinistryPieChart() {
    const { chartStats } = useDashboardStats()

    const ministryGroupData = chartStats?.ministry_distribution?.map((ministry) => ({
        ministry: ministry.ministry_name,
        members: ministry.count
    })) || [];

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
                                data={ministryGroupData}
                                dataKey="members"
                                nameKey="ministry"
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                label
                            >
                                {ministryGroupData.map((entry, index) => (
                                    <Cell
                                        key={index}
                                        fill={getMinistryColor(entry.ministry)}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap justify-center gap-2 h-10">
                    {ministryGroupData.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: getMinistryColor(entry.ministry) }}
                            />
                            <span className="text-[10px] text-gray-700">{entry.ministry}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

    );
}
