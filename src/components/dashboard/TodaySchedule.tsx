import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

export function TodaySchedule({ appointments = [] }: { appointments?: any[] }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[var(--shadow-sm)] h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                    <h3 className="text-[15px] font-semibold text-gray-800 font-dm-sans">Today's Schedule</h3>
                </div>
                <select className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 bg-white outline-none focus:ring-1 focus:ring-blue-500">
                    <option>This day</option>
                </select>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
                {appointments && appointments.length > 0 ? (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-28">Time</th>
                                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Doctor</th>
                                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Patient</th>
                                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-10" />
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((a) => (
                                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors last:border-0 group cursor-pointer">
                                    <td className="px-5 py-3 text-sm font-medium text-gray-700 tabular">{a.time}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <img src={a.doctor.avatar} className="w-7 h-7 rounded-full object-cover" alt={a.doctor.name} />
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{a.doctor.name}</p>
                                                <p className="text-[11px] text-gray-400 tabular">{a.timeRange}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{a.patientName}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="icon" className="w-7 h-7 text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="w-3.5 h-3.5" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                        <p className="text-sm text-gray-500 font-medium">No appointments scheduled for today</p>
                    </div>
                )}
            </div>
        </div>
    );
}
