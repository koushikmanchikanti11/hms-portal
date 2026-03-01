"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function PatientSplitCard({ data, totalPatients }: { data?: any, totalPatients?: number }) {
    const total = totalPatients || 1; // Prevent divide by zero
    const newPatients = data?.newPatients || 0;
    const oldPatients = data?.oldPatients || 0;
    const newPct = Math.round((newPatients / total) * 100);
    const oldPct = 100 - newPct;

    const maleCount = data?.maleCount || 0;
    const femaleCount = data?.femaleCount || 0;
    const totalGender = maleCount + femaleCount || 1;
    const malePct = Math.round((maleCount / totalGender) * 100);

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-[var(--shadow-sm)] flex flex-col gap-5 h-full">

            {/* New vs Old patients */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[15px] font-semibold text-gray-800 font-dm-sans">Patient</h3>
                    <select className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 bg-white outline-none focus:ring-1 focus:ring-blue-500">
                        <option>Monthly</option>
                    </select>
                </div>
                <div className="flex justify-between mb-2">
                    <div>
                        <p className="text-xs text-gray-400">New Patients</p>
                        <p className="text-2xl font-bold text-gray-900 tabular font-dm-sans leading-tight">{newPatients}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Old Patients</p>
                        <p className="text-2xl font-bold text-gray-900 tabular font-dm-sans leading-tight">{oldPatients}</p>
                    </div>
                </div>
                {/* Progress bar */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1 flex">
                    <div className="h-full bg-[#111827] rounded-l-full" style={{ width: `${newPct}%` }} />
                    <div className="h-full bg-gray-200 rounded-r-full" style={{ width: `${oldPct}%` }} />
                </div>
                <div className="flex justify-between mt-1.5">
                    <span className="text-xs font-bold text-gray-900 tabular">{newPct}%</span>
                    <span className="text-xs text-gray-400 tabular">{oldPct}%</span>
                </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Gender donut */}
            <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[15px] font-semibold text-gray-800 font-dm-sans">Gender</h3>
                    <select className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 bg-white outline-none focus:ring-1 focus:ring-blue-500">
                        <option>Overall</option>
                    </select>
                </div>
                <div className="flex items-center gap-5 mt-2">
                    <div className="w-[100px] h-[100px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[{ value: maleCount }, { value: femaleCount }]}
                                    innerRadius={30}
                                    outerRadius={46}
                                    dataKey="value"
                                    startAngle={90}
                                    endAngle={-270}
                                >
                                    <Cell fill="#1A56DB" />
                                    <Cell fill="#60A5FA" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-0.5">
                            <span className="text-sm font-bold text-[#111827] tabular font-dm-sans leading-none">{totalGender}</span>
                            <span className="text-[10px] text-[#9CA3AF] mt-0.5 font-medium leading-none">{malePct}%</span>
                        </div>
                    </div>
                    <div className="space-y-3 flex-1">
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#1A56DB]" />
                                <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">Man</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 tabular-nums">{maleCount}</span>
                        </div>
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#60A5FA]" />
                                <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">Woman</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 tabular-nums">{femaleCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
