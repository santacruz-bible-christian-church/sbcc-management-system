import { useDashboardStats } from '../hooks/useDashboardStats';
import { HiUsers } from 'react-icons/hi';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar,
    Cell,
} from "recharts";

// Gender color mapping
const GENDER_COLORS = {
    male: "#0088FE",
    female: "#FF69B4",
    other: "#FDB54A"
};

const getGenderColor = (gender) => {
    const genderLower = gender?.toLowerCase() || '';
    return GENDER_COLORS[genderLower] || "#CCCCCC";
};

export default function TotalMembersStatsCard() {
    const { stats, chartStats, loading, error } = useDashboardStats();

    // Transform age groups data
    const rawAgeGroups = chartStats?.age_groups ?? {};
    const ageGroupData = Object.entries(rawAgeGroups).map(([ageRange, count]) => ({
        name: ageRange,
        members: count
    }));

    // Transform gender distribution data
    const rawGenderGroups = chartStats?.gender_distribution ?? {};
    const genderGroupData = Object.entries(rawGenderGroups).map(([gender, count]) => ({
        name: gender.charAt(0).toUpperCase() + gender.slice(1),
        members: count,
        gender: gender.toLowerCase()
    }));

    const totalMembers = stats?.overview?.total_members ?? 0;

    // Loading state
    if (loading) {
        return (
            <div className="col-span-8 bg-white shadow-lg rounded-2xl p-6 h-[330px]">
                <div className="flex gap-3 mb-4">
                    <HiUsers className="h-7 w-7 p-1 bg-blue-200 rounded text-blue-500" />
                    <h3 className="text-l font-bold text-gray-900">
                        Total Members Overview
                    </h3>
                </div>
                <div className="flex items-center justify-center h-[200px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="col-span-8 bg-white shadow-lg rounded-2xl p-6 h-[330px]">
                <div className="flex gap-3 mb-4">
                    <HiUsers className="h-7 w-7 p-1 bg-blue-200 rounded text-blue-500" />
                    <h3 className="text-l font-bold text-gray-900">
                        Total Members Overview
                    </h3>
                </div>
                <div className="flex items-center justify-center h-[200px] text-red-500">
                    Failed to load demographics data
                </div>
            </div>
        );
    }

    return (
        <div className="col-span-8 bg-white shadow-lg rounded-2xl p-6 gap-6 h-[330px]">
            <div className="flex gap-3">
                <HiUsers className="h-7 w-7 p-1 bg-blue-200 rounded text-blue-500" />
                <h3 className="text-l font-bold text-gray-900 mb-4">
                    Total Members Overview
                </h3>
            </div>
            <p className="mb-3 p-1 flex text-[15px] items-center">
                {totalMembers} {totalMembers === 1 ? 'member' : 'members'}
            </p>
            <div className="w-full flex h-[200px]">
                {/* Age Distribution Chart */}
                <div className="w-full text-[10px]">
                    <p className="text-xs text-gray-600 mb-2 text-center font-medium">Age Distribution</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={ageGroupData}>
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis width={20} tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="members"
                                stroke="#FDB54A"
                                strokeWidth={2}
                                dot={{ fill: '#FDB54A', r: 3 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Gender Distribution Chart */}
                <div className="w-full text-[10px]">
                    <p className="text-xs text-gray-600 mb-2 text-center font-medium">Gender Distribution</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={genderGroupData}>
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis width={30} tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="members" radius={[8, 8, 0, 0]}>
                                {genderGroupData.map((entry, index) => (
                                    <Cell
                                        key={index}
                                        fill={getGenderColor(entry.gender)}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
