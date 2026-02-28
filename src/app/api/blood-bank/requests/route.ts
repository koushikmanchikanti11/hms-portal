import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;

    const requests = await prisma.bloodRequest.findMany({
        where: { hospitalId },
        include: {
            patient: { select: { id: true, name: true, bloodGroup: true } },
        },
        orderBy: { requestedAt: "desc" },
    });
    return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const body = await req.json();

    if (!body.patientId || !body.bloodGroup || !body.unitsNeeded) {
        return NextResponse.json({ error: "Patient, blood group, and units required" }, { status: 400 });
    }

    const request = await prisma.bloodRequest.create({
        data: {
            hospitalId,
            patientId: body.patientId,
            bloodGroup: body.bloodGroup,
            unitsNeeded: Number(body.unitsNeeded),
            urgency: body.urgency || "routine",
            notes: body.notes || undefined,
        },
    });
    return NextResponse.json(request, { status: 201 });
}
