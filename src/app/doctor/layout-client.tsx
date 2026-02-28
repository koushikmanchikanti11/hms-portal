"use client";

import { DoctorSidebar } from "@/components/layout/DoctorSidebar";

interface DoctorLayoutClientProps {
    children: React.ReactNode;
    userName: string;
    specialization: string;
}

export function DoctorLayoutClient({ children, userName, specialization }: DoctorLayoutClientProps) {
    return (
        <div className="flex h-screen bg-gray-50">
            <DoctorSidebar userName={userName} specialization={specialization} />
            <main className="flex-1 overflow-y-auto lg:pl-0">{children}</main>
        </div>
    );
}
