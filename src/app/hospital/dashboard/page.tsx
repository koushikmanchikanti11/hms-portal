import { getSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { ReceptionistDashboard } from "@/components/dashboard/staff/ReceptionistDashboard";
import { PharmacistDashboard } from "@/components/dashboard/staff/PharmacistDashboard";
import { NurseDashboard } from "@/components/dashboard/staff/NurseDashboard";
import { AccountantDashboard } from "@/components/dashboard/staff/AccountantDashboard";
import { WardBoyDashboard } from "@/components/dashboard/staff/WardBoyDashboard";
import { LabTechDashboard } from "@/components/dashboard/staff/LabTechDashboard";
import { GenericStaffDashboard } from "@/components/dashboard/staff/GenericStaffDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const user = session.user as any;
    const role: string = user.role;
    const staffRole: string | undefined = user.staffRole;

    // Admin → full admin dashboard
    if (role === "admin" || role === "super_admin") {
        return <AdminDashboard userName={user.name} />;
    }

    // Doctor → redirected at layout level, but guard here just in case
    if (role === "doctor") {
        redirect("/doctor/dashboard");
    }

    // Staff → route by sub-role
    switch (staffRole) {
        case "receptionist":
            return <ReceptionistDashboard />;
        case "pharmacist":
            return <PharmacistDashboard />;
        case "nurse":
            return <NurseDashboard />;
        case "accountant":
            return <AccountantDashboard />;
        case "ward_boy":
            return <WardBoyDashboard />;
        case "lab_technician":
            return <LabTechDashboard />;
        default:
            return <GenericStaffDashboard />;
    }
}
