import { getSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { HospitalLayoutClient } from "./layout-client";
import { prisma } from "@/lib/db";

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

    let hospitalName = user.hospitalName;
    if (!hospitalName && user.hospitalId) {
        const hospital = await prisma.hospital.findUnique({
            where: { id: user.hospitalId },
            select: { name: true }
        });
        if (hospital) hospitalName = hospital.name;
    }

    return (
        <HospitalLayoutClient
            hospitalName={hospitalName || "Hospital"}
            userName={user.name}
            userRole={user.role}
            staffRole={user.staffRole}
        >
            {children}
        </HospitalLayoutClient>
    );
}
