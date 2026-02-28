import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await params;
    const body = await req.json();

    if (body.action === "assign" && body.patientId) {
        await prisma.bed.updateMany({
            where: { id, hospitalId, status: "available" },
            data: {
                status: "occupied",
                currentPatientId: body.patientId,
                admittedAt: new Date(),
            },
        });
    }

    if (body.action === "discharge") {
        await prisma.bed.updateMany({
            where: { id, hospitalId },
            data: {
                status: "available",
                currentPatientId: null,
                admittedAt: null,
                notes: body.notes || null,
            },
        });
    }

    if (body.action === "maintenance") {
        await prisma.bed.updateMany({
            where: { id, hospitalId },
            data: { status: body.maintenance ? "maintenance" : "available" },
        });
    }

    if (body.action === "reserve") {
        await prisma.bed.updateMany({
            where: { id, hospitalId, status: "available" },
            data: { status: "reserved" },
        });
    }

    return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await params;

    await prisma.bed.deleteMany({ where: { id, hospitalId } });
    return NextResponse.json({ success: true });
}
