import { SuperAdminSidebar } from "@/components/layout/SuperAdminSidebar";
import { TopBar } from "@/components/layout/TopBar";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-gray-50">
            <SuperAdminSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <TopBar userRole="super_admin" />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
