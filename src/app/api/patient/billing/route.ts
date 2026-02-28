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

    const invoices = await prisma.invoice.findMany({
        where: { patientId },
        include: {
            appointment: {
                include: {
                    doctor: { select: { name: true, specialization: true } },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { name: true },
    });

    const totals = {
        total: invoices.reduce((s, i) => s + Number(i.totalAmount), 0),
        paid: invoices.reduce((s, i) => s + Number(i.paidAmount), 0),
        pending: invoices
            .filter(i => i.status !== "paid")
            .reduce((s, i) => s + (Number(i.totalAmount) - Number(i.paidAmount)), 0),
    };

    return NextResponse.json({ invoices, totals, patientName: patient?.name || "Patient" });
}
