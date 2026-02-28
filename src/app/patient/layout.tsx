import { getSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { PatientLayoutClient } from "./layout-client";

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const user = session.user as any;

    if (user.role !== "patient") {
        redirect("/hospital/dashboard");
    }

    return (
        <PatientLayoutClient userName={user.name}>
            {children}
        </PatientLayoutClient>
    );
}
