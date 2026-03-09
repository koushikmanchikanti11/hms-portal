"use client";

import { PatientSidebar } from "@/components/layout/PatientSidebar";
import { TopBar } from "@/components/layout/TopBar";

interface PatientLayoutClientProps {
    children: React.ReactNode;
    userName: string;
}

export function PatientLayoutClient({ children, userName }: PatientLayoutClientProps) {
    return (
        <div className="flex h-screen bg-gray-50">
            <PatientSidebar userName={userName} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <TopBar userRole="patient" />
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
