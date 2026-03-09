"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    CalendarPlus,
    FileText,
    ClipboardList,
    Clock,
    BedDouble,
    LogOut,
    Menu,
    X,
    Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarLogo } from "./SidebarLogo";

const navItems = [
    { label: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
    { label: "Book Appointments", href: "/patient/appointments", icon: CalendarPlus },
    { label: "Prescriptions", href: "/patient/prescriptions", icon: FileText },
    { label: "Records", href: "/patient/records", icon: ClipboardList },
    { label: "Billing", href: "/patient/billing", icon: Receipt },
    { label: "Last Visited", href: "/patient/last-visited", icon: Clock },
    { label: "Ward", href: "/patient/ward", icon: BedDouble },
];

interface PatientSidebarProps {
    userName?: string;
}

export function PatientSidebar({ userName = "Patient" }: PatientSidebarProps) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const accentColor = "#0891B2"; // Cyan

    const sidebarContent = (
        <>
            <SidebarLogo
                label="Patient Portal"
                sublabel="Self-Service"
                accentColor={accentColor}
            />

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-cyan-50 text-cyan-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-cyan-700" : "text-gray-400")} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-gray-200 px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: accentColor }}>
                        <span className="text-xs font-semibold text-white">{userName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                        <p className="text-xs text-gray-500">Patient</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                            await fetch('/api/auth/sign-out', { method: 'POST' });
                            window.location.href = '/login';
                        }}
                        className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </>
    );

    return (
        <>
            {open && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setOpen(false)} />}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col",
                "transform transition-transform duration-200 ease-in-out",
                open ? "translate-x-0" : "-translate-x-full",
                "lg:translate-x-0 lg:static lg:z-auto"
            )}>
                {sidebarContent}
            </aside>
            <button className="lg:hidden fixed top-4 left-4 z-10 p-2 bg-white rounded-lg shadow-md border border-gray-200" onClick={() => setOpen(true)}>
                <Menu className="h-5 w-5 text-gray-600" />
            </button>
        </>
    );
}
