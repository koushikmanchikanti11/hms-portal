import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await params;

    const emergencyCase = await prisma.emergencyCase.findFirst({
        where: { id, hospitalId },
        include: {
            assignedDoctor: { select: { id: true, name: true, specialization: true } },
            patient: { select: { id: true, name: true, phone: true } },
        },
    });
    if (!emergencyCase) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(emergencyCase);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.assignedDoctorId) updateData.assignedDoctorId = body.assignedDoctorId;
    if (body.assignedBedId) updateData.assignedBedId = body.assignedBedId;
    if (body.notes) updateData.notes = body.notes;
    if (body.triageLevel) updateData.triageLevel = body.triageLevel;
    if (body.vitalsBP) updateData.vitalsBP = body.vitalsBP;
    if (body.vitalsHR) updateData.vitalsHR = Number(body.vitalsHR);
    if (body.vitalsTemp) updateData.vitalsTemp = Number(body.vitalsTemp);
    if (body.vitalsSpO2) updateData.vitalsSpO2 = Number(body.vitalsSpO2);
    if (body.status === "in_treatment") updateData.treatmentStartAt = new Date();
    if (["discharged", "admitted", "referred", "deceased"].includes(body.status)) {
        updateData.resolvedAt = new Date();
    }

    await prisma.emergencyCase.updateMany({
        where: { id, hospitalId },
        data: updateData,
    });
    return NextResponse.json({ success: true });
}
