"use client";

import { DoctorSidebar } from "@/components/layout/DoctorSidebar";
import { TopBar } from "@/components/layout/TopBar";

interface DoctorLayoutClientProps {
    children: React.ReactNode;
    userName: string;
    specialization: string;
}

export function DoctorLayoutClient({ children, userName, specialization }: DoctorLayoutClientProps) {
    return (
        <div className="flex h-screen bg-gray-50">
            <DoctorSidebar userName={userName} specialization={specialization} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <TopBar userRole="doctor" />
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
