"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

export function QueueStatus({ data }: { data?: any }) {
    const total = (data?.completed || 0) + (data?.waiting || 0) + (data?.cancelled || 0);
    const completedPct = total > 0 ? Math.round(((data?.completed || 0) / total) * 100) : 0;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-[var(--shadow-sm)] flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-semibold text-gray-800 font-dm-sans">Queue Status</h3>
                <select className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 bg-white outline-none focus:ring-1 focus:ring-blue-500">
                    <option>This day</option>
                </select>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="h-[140px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                            cx="50%"
                            cy="90%"
                            innerRadius="80%"
                            outerRadius="110%"
                            startAngle={180}
                            endAngle={0}
                            data={[{ name: "Completed", value: completedPct, fill: "#1A56DB" }]}
                        >
                            <RadialBar
                                dataKey="value"
                                cornerRadius={10}
                                background={{ fill: "#F3F4F6" }}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute bottom-2 left-0 right-0 text-center">
                        <span className="text-2xl font-bold text-gray-900 tabular font-dm-sans">{completedPct}%</span>
                    </div>
                </div>

                <div className="w-full space-y-2.5 mt-4">
                    {[
                        { label: "Completed", count: data?.completed || 0, color: "#1A56DB" },
                        { label: "Waiting", count: data?.waiting || 0, color: "#BFDBFE" },
                        { label: "Cancelled", count: data?.cancelled || 0, color: "#F87171" },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between group">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                                <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">{item.label}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 tabular-nums">{item.count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
