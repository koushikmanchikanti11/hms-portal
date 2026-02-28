import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["patient"]);
    if (guard instanceof NextResponse) return guard;
    const { session } = guard;
    const user = session.user as any;
    const patientId = user.patientId;

    if (!patientId) {
        return NextResponse.json({ error: "No patient profile linked" }, { status: 403 });
    }

    const lastVisit = await prisma.appointment.findFirst({
        where: {
            patientId,
            status: "completed",
            appointmentDate: {
                lte: new Date()
            }
        },
        orderBy: { appointmentDate: "desc" },
        include: {
            doctor: { select: { name: true, specialization: true } },
            records: {
                take: 1,
                orderBy: { createdAt: "desc" }
            }
        }
    });

    return NextResponse.json(lastVisit || null);
}
