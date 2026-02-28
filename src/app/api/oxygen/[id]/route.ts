import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.assignedTo !== undefined) updateData.assignedTo = body.assignedTo || null;
    if (body.assignedPatientId !== undefined) updateData.assignedPatientId = body.assignedPatientId || null;
    if (body.pressureBar !== undefined) updateData.pressureBar = Number(body.pressureBar);
    if (body.notes !== undefined) updateData.notes = body.notes;

    if (body.status === "full") {
        updateData.lastRefilledAt = new Date();
        updateData.assignedTo = null;
        updateData.assignedPatientId = null;
    }

    await prisma.oxygenCylinder.updateMany({
        where: { id, hospitalId },
        data: updateData,
    });
    return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await params;

    await prisma.oxygenCylinder.deleteMany({ where: { id, hospitalId } });
    return NextResponse.json({ success: true });
}
