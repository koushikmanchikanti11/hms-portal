import { getSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { DoctorLayoutClient } from "./layout-client";
import { prisma } from "@/lib/db";

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const user = session.user as any;

    if (user.role !== "doctor") {
        if (user.role === "patient") redirect("/patient/dashboard");
        redirect("/hospital/dashboard");
    }

    // Fetch doctor profile for specialization info
    const doctor = await prisma.doctor.findFirst({
        where: { userId: user.id },
        select: { specialization: true },
    });

    return (
        <DoctorLayoutClient userName={user.name} specialization={doctor?.specialization || "General"}>
            {children}
        </DoctorLayoutClient>
    );
}
