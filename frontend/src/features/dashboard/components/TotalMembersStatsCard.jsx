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
    Legend,
} from "recharts";

const ageGroupData = [
    { ageGroup: "0-12", total: 40 },
    { ageGroup: "13-17", total: 55 },
    { ageGroup: "18-25", total: 120 },
    { ageGroup: "26-40", total: 90 },
    { ageGroup: "41-60", total: 60 },
    { ageGroup: "60+", total: 30 },
];

const genderData = [
    { ageGroup: "0-12", male: 20, female: 20 },
    { ageGroup: "13-17", male: 30, female: 25 },
    { ageGroup: "18-25", male: 70, female: 50 },
    { ageGroup: "26-40", male: 40, female: 50 },
    { ageGroup: "41-60", male: 30, female: 30 },
    { ageGroup: "60+", male: 15, female: 15 },
];

export default function TotalMembersStatsCard() {
    const { stats, loading, error, refreshing, refresh, retry } = useDashboardStats();
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
                            <XAxis dataKey="ageGroup" />
                            <YAxis width={20} />
                            <Tooltip />
                            <Line type="monotone" dataKey="total" stroke="#FDB54A" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="w-full text-[10px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={genderData}>
                            <XAxis dataKey="ageGroup" />
                            <YAxis width={30} />
                            <Tooltip />
                            <Legend
                                verticalAlign="top"
                            />
                            <Bar dataKey="male" fill="#0088FE" />
                            <Bar dataKey="female" fill="#FF69B4" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div >
    );
}
