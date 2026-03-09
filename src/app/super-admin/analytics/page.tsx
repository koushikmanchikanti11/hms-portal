"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loader2, Building2, Users, Stethoscope, User, CalendarDays, DollarSign } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { formatCurrency } from "@/lib/utils";

interface AnalyticsData {
    hospitals: number;
    users: number;
    patients: number;
    doctors: number;
    appointments: number;
    totalRevenue: number | string;
    collectedRevenue: number | string;
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch("/api/admin/analytics");
                if (res.ok) {
                    setData(await res.json());
                }
            } catch (error) {
                console.error("Failed to fetch analytics");
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    return (
        <>
            <PageHeader title="Platform Analytics" />

            <div className="p-4 md:p-6 space-y-6">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#1A56DB]" />
                    </div>
                ) : data ? (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800">Overview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <KPICard
                                title="Total Hospitals"
                                value={data.hospitals}
                                icon={Building2}
                                trend={{ value: "12%", direction: "up", label: "vs last month" }}
                            />
                            <KPICard
                                title="Total System Users"
                                value={data.users}
                                icon={Users}
                                trend={{ value: "5%", direction: "up", label: "vs last month" }}
                            />
                            <KPICard
                                title="Total Patients"
                                value={data.patients}
                                icon={User}
                                trend={{ value: "18%", direction: "up", label: "vs last month" }}
                            />
                            <KPICard
                                title="Total Doctors"
                                value={data.doctors}
                                icon={Stethoscope}
                                trend={{ value: "2%", direction: "up", label: "vs last month" }}
                            />
                        </div>

                        <h3 className="text-lg font-semibold text-gray-800 mt-8">Operations & Revenue</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <KPICard
                                title="Total Appointments"
                                value={data.appointments}
                                icon={CalendarDays}
                            />
                            <KPICard
                                title="Platform Billed"
                                value={formatCurrency(Number(data.totalRevenue))}
                                icon={DollarSign}
                            />
                            <KPICard
                                title="Revenue Collected"
                                value={formatCurrency(Number(data.collectedRevenue))}
                                icon={DollarSign}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">Failed to load analytics data</div>
                )}
            </div>
        </>
    );
}
