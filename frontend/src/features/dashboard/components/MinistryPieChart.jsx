import { HiClipboardList } from "react-icons/hi";
import { useDashboardStats } from "../hooks/useDashboardStats";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from "recharts";

// Dynamic color palette that works for any number of ministries
const MINISTRY_COLORS = [
    '#3B00DD', // Purple
    '#9800B4', // Magenta
    '#FF00E4', // Pink
    '#00FF4B', // Green
    '#5b8f95', // Teal
    '#8D00FF', // Violet
    '#FFDF00', // Yellow
    '#FF6B6B', // Red
    '#4ECDC4', // Cyan
    '#95E1D3', // Mint
];

const getMinistryColor = (index) => {
    return MINISTRY_COLORS[index % MINISTRY_COLORS.length];
};

export default function MinistryPieChart() {
    const { chartStats, loading } = useDashboardStats();

    const ministryGroupData = chartStats?.ministry_distribution?.map((ministry) => ({
        ministry: ministry.ministry_name,
        members: ministry.count
    })) || [];

    // Add unassigned members if they exist
    const unassignedCount = chartStats?.unassigned_members || 0;
    if (unassignedCount > 0) {
        ministryGroupData.push({
            ministry: 'Member',
            members: unassignedCount
        });
    }

    // Empty state
    if (!loading && ministryGroupData.length === 0) {
        return (
            <div className="w-[60%] col-span-5 bg-white shadow-lg rounded-2xl p-6">
                <div className="flex gap-3">
                    <HiClipboardList className="h-7 w-7 p-1 bg-orange-200 rounded text-orange-500" />
                    <h3 className="text-l font-bold text-gray-900 mb-4">
                        Ministry Distribution
                    </h3>
                </div>
                <div className="flex items-center justify-center h-[200px] text-gray-500">
                    No ministry data available
                </div>
            </div>
        );
    }

    return (
        <div className="w-[60%] col-span-5 bg-white shadow-lg rounded-2xl p-6">
            <div className="flex gap-3">
                <HiClipboardList className="h-7 w-7 p-1 bg-orange-200 rounded text-orange-500" />
                <h3 className="text-l font-bold text-gray-900 mb-4">
                    Ministry Distribution
                </h3>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-[200px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
                </div>
            ) : (
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
                                    label={(entry) => `${entry.ministry}: ${entry.members}`}
                                >
                                    {ministryGroupData.map((entry, index) => (
                                        <Cell
                                            key={index}
                                            fill={getMinistryColor(index)}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-2 h-auto max-h-20 overflow-y-auto">
                        {ministryGroupData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: getMinistryColor(index) }}
                                />
                                <span className="text-[10px] text-gray-700">
                                    {entry.ministry} ({entry.members})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
