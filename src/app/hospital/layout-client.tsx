"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

interface HospitalLayoutClientProps {
    children: React.ReactNode;
    hospitalName: string;
    userName: string;
    userRole: string;
    staffRole?: string;
}

export function HospitalLayoutClient({ children, hospitalName, userName, userRole, staffRole }: HospitalLayoutClientProps) {
    return (
        <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
            <Sidebar
                hospitalName={hospitalName}
                userName={userName}
                userRole={userRole}
                staffRole={staffRole}
            />
            <div className="flex flex-col flex-1 min-w-0">
                <TopBar />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

