import { getSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { HospitalLayoutClient } from "./layout-client";

export default async function HospitalLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const user = session.user as any;

    // Patients and doctors should not access the hospital admin dashboard
    if (user.role === "patient") {
        redirect("/patient/dashboard");
    }
    if (user.role === "doctor") {
        redirect("/doctor/dashboard");
    }

    return (
        <HospitalLayoutClient
            hospitalName={user.hospitalName || "Hospital"}
            userName={user.name}
            userRole={user.role}
            staffRole={user.staffRole}
        >
            {children}
        </HospitalLayoutClient>
    );
}
