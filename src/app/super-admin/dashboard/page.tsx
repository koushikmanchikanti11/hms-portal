import { requirePage } from "@/lib/auth-guards";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { Building2, Hospital, Users, Activity, Clock } from "lucide-react";

export default async function SuperAdminDashboard() {
    await requirePage(["super_admin"]);

    const [totalHospitals, activeHospitals, totalUsers] = await Promise.all([
        prisma.hospital.count(),
        prisma.hospital.count({ where: { isActive: true } }),
        prisma.user.count(),
    ]);

    const recentHospitals = await prisma.hospital.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { _count: { select: { patients: true, doctors: true } } },
    });

    // Mock recent activity for UI
    const recentActivity = [
        { id: 1, action: "New hospital registered", target: "City General Hospital", time: "2 hours ago", type: "success" },
        { id: 2, action: "User account suspended", target: "Dr. Smith (admin)", time: "5 hours ago", type: "warning" },
        { id: 3, action: "Billing cycle processed", target: "System-wide", time: "1 day ago", type: "info" },
        { id: 4, action: "New subscription plan created", target: "Enterprise Tier", time: "2 days ago", type: "success" },
    ];

    return (
        <>
            <PageHeader title="System Dashboard" />
            <div className="p-4 md:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                    <KPICard title="Total Hospitals" value={totalHospitals} icon={Building2} color="blue" />
                    <KPICard title="Active Hospitals" value={activeHospitals} icon={Hospital} color="green" />
                    <KPICard title="Total Users" value={totalUsers} icon={Users} color="blue" />
                    <KPICard title="System Status" value="Online" icon={Activity} color="green" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Hospitals</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-[640px] w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hospital</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patients</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctors</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentHospitals.map((h: { id: string; name: string; slug: string; _count: { patients: number; doctors: number } }) => (
                                        <tr key={h.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3 px-4 font-medium text-gray-900">{h.name}</td>
                                            <td className="py-3 px-4 text-gray-500">{h.slug}</td>
                                            <td className="py-3 px-4 text-gray-500">{h._count.patients}</td>
                                            <td className="py-3 px-4 text-gray-500">{h._count.doctors}</td>
                                        </tr>
                                    ))}
                                    {recentHospitals.length === 0 && (
                                        <tr><td colSpan={4} className="py-8 text-center text-gray-400">No hospitals yet</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5 text-[#1A56DB]" />
                            <h2 className="text-lg font-semibold text-gray-900">System Activity</h2>
                        </div>
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex gap-3">
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${activity.type === 'success' ? 'bg-green-500' :
                                        activity.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                        }`}
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                        <p className="text-xs text-gray-500">{activity.target} • {activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
