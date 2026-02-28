import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin", "doctor", "staff"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await params;

    const prescription = await prisma.prescription.findFirst({
        where: { id, hospitalId },
        include: {
            patient: { select: { id: true, name: true, phone: true, email: true, address: true } },
            doctor: { select: { id: true, name: true, specialization: true, phone: true } },
        },
    });
    if (!prescription) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(prescription);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await params;
    const body = await req.json();

    const prescription = await prisma.prescription.findFirst({ where: { id, hospitalId } });
    if (!prescription) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.prescription.update({
        where: { id },
        data: {
            ...(body.status ? { status: body.status } : {}),
            ...(body.notes !== undefined ? { notes: body.notes } : {}),
            ...(body.items ? { items: body.items } : {}),
        },
    });
    return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await apiGuard(req, ["admin"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { id } = await params;

    await prisma.prescription.deleteMany({ where: { id, hospitalId } });
    return NextResponse.json({ success: true });
}
