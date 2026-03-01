"use client";

import { useState, useEffect } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import { QueueStatus } from "@/components/dashboard/QueueStatus";
import { PatientStatusChart } from "@/components/dashboard/PatientStatusChart";
import { PatientSplitCard } from "@/components/dashboard/PatientSplitCard";
import { Users, CalendarDays, Stethoscope, BedDouble, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface DashboardStats {
    total_patients: number;
    patients_today: number;
    appointments_today: number;
    appointments_scheduled: number;
    pending_bills: number;
    pending_amount: number;
    low_stock_count: number;
    expiring_soon_count: number;
    revenue_this_month: number;
    active_emergency: number;
    total_beds: number;
    occupied_beds: number;
    pending_prescriptions: number;
    doctors_on_duty: number;
    today_appointments: any[];
    patient_split: any;
    queue_status: any;
    monthly_chart: any[];
}

export default function AdminDashboard({ userName = "Admin" }: { userName?: string }) {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/dashboard/stats")
            .then(res => res.json())
            .then(data => { setStats(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#1A56DB]" /></div>;
    }

    const firstName = userName.split(" ")[0];

    return (
        <div className="p-6 space-y-6 page-enter">
            {/* Welcome row */}
            <div>
                <h1 className="text-[22px] font-bold text-gray-900 font-dm-sans">
                    Welcome back, {firstName} 👋
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                    {format(new Date(), "EEEE, MMMM d, yyyy")}
                </p>
            </div>

            {/* KPI Cards row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    label="Today's Appointments"
                    value={stats?.appointments_today || 0}
                    icon={CalendarDays}
                    iconColor="blue"
                    trend={{ value: String(stats?.appointments_scheduled || 0), direction: "neutral", label: "scheduled" }}
                />
                <KPICard
                    label="Total Patients"
                    value={stats?.total_patients || 0}
                    icon={Users}
                    iconColor="green"
                    trend={{ value: String(stats?.patient_split?.newPatients || 0), direction: "up", label: "new this month" }}
                />
                <KPICard
                    label="Doctors On Duty"
                    value={stats?.doctors_on_duty || 0}
                    icon={Stethoscope}
                    iconColor="purple"
                    trend={{ value: "Active", direction: "neutral", label: "now" }}
                />
                <KPICard
                    label="Available Beds"
                    value={(stats?.total_beds || 0) - (stats?.occupied_beds || 0)}
                    icon={BedDouble}
                    iconColor="amber"
                    trend={{ value: String(stats?.occupied_beds || 0), direction: "neutral", label: "occupied today" }}
                />
            </div>

            {/* Middle row */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                <div className="xl:col-span-3"><TodaySchedule appointments={stats?.today_appointments} /></div>
                <div className="xl:col-span-2"><QueueStatus data={stats?.queue_status} /></div>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                <div className="xl:col-span-3"><PatientStatusChart data={stats?.monthly_chart} /></div>
                <div className="xl:col-span-2"><PatientSplitCard data={stats?.patient_split} totalPatients={stats?.total_patients} /></div>
            </div>
        </div>
    );
}
