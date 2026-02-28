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

    // Find the bed currently occupied by this patient
    const activeBed = await prisma.bed.findFirst({
        where: {
            currentPatientId: patientId,
            status: "occupied"
        },
        include: {
            ward: true,
            hospital: { select: { name: true } }
        }
    });

    return NextResponse.json(activeBed || null);
}
