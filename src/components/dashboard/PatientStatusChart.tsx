"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export function PatientStatusChart({ data = [] }: { data?: any[] }) {
    // Calculate total patients from the chart data for the current view
    const totalStatus = data?.reduce((acc, curr) => acc + (curr.consultation || 0) + (curr.checkUp || 0), 0) || 0;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-[var(--shadow-sm)] h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div>
                    <h3 className="text-[15px] font-semibold text-gray-800 font-dm-sans">Patients Status</h3>
                    <p className="text-[32px] font-bold text-gray-900 tracking-tight mt-1 tabular font-dm-sans leading-none">
                        {totalStatus}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#1A56DB]" /> Consultation
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#111827]" /> Check-Up
                    </div>
                    <select className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 bg-white outline-none focus:ring-1 focus:ring-blue-500">
                        <option>Monthly</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                        barGap={2}
                        barCategoryGap="30%"
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v} />
                        <Tooltip
                            contentStyle={{ border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}
                            cursor={{ fill: "rgba(0,0,0,0.03)" }}
                        />
                        <Bar dataKey="consultation" fill="#1A56DB" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="checkUp" fill="#111827" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
