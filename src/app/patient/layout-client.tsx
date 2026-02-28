"use client";

import { PatientSidebar } from "@/components/layout/PatientSidebar";

interface PatientLayoutClientProps {
    children: React.ReactNode;
    userName: string;
}

export function PatientLayoutClient({ children, userName }: PatientLayoutClientProps) {
    return (
        <div className="flex h-screen bg-gray-50">
            <PatientSidebar userName={userName} />
            <main className="flex-1 overflow-y-auto lg:pl-0">{children}</main>
        </div>
    );
}
