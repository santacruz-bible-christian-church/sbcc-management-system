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

export default function TotalMembersStatsCard() {
    const { stats, chartStats, loading, error, refreshing, refresh, retry } = useDashboardStats();


    // convert age_group object to array
    const rawAgeGroups = chartStats?.age_groups ?? {};
    const ageGroupData = Object.entries(rawAgeGroups).map(([ageRange, count]) => ({
        name: ageRange,
        members: count
    }))

    // convert gender_distribution object to array
    const rawGenderGroups = chartStats?.gender_distribution ?? {};
    const genderGroupData = Object.entries(rawGenderGroups).map(([gender, count]) => ({
        name: gender,
        members: count
    }))

    if (!chartStats) {
        return null;
    }

    return (
        <div className="col-span-8 bg-white shadow-lg rounded-2xl p-6 gap-6 h-[330px]">
            <div className="flex gap-3">
                <HiUsers className="h-7 w-7 p-1 bg-blue-200 rounded text-blue-500" />
                <h3 className="text-l font-bold text-gray-900 mb-4">
                    Total Members Overview
                </h3>
            </div>
            <p className=" mb-3 p-1 flex text-[15px] items-center">{stats?.overview?.total_members ?? 0} members</p>
            <div className="w-full flex h-[200px]">
                <div className="w-full text-[10px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={ageGroupData}>
                            <XAxis dataKey="name" />
                            <YAxis width={20} />
                            <Tooltip />
                            <Line type="monotone" dataKey="members" stroke="#FDB54A" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="w-full text-[10px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={genderGroupData}>
                            <XAxis dataKey="name" />
                            <YAxis width={30} />
                            <Tooltip />
                            <Bar dataKey="members">
                                {genderGroupData.map((entry, index) => {
                                    let color;
                                    if (entry.name.toLowerCase() === "male") {
                                        color = "#0088FE"
                                    } else if (entry.name.toLowerCase() === "female") {
                                        color = "#FF69B4"
                                    } else if (entry.name.toLowerCase() === "other") {
                                        color = "#FDB54A"
                                    }
                                    return < Cell
                                        key={index}
                                        fill={color}
                                    />
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div >
    );
}
