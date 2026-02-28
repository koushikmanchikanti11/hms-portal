import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-utils";

type Role = "super_admin" | "admin" | "doctor" | "staff" | "patient";

export async function requirePage(allowedRoles: Role[]) {
    const session = await getSession();

    if (!session) redirect("/login");

    if (!allowedRoles.includes((session.user as any).role as Role)) {
        if ((session.user as any).role === "patient") {
            redirect("/patient/dashboard");
        }
        redirect("/hospital/dashboard");
    }

    return session;
}
