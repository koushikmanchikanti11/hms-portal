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

    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
    });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const [appointments, records, prescriptions] = await Promise.all([
        prisma.appointment.findMany({
            where: { patientId },
            include: { doctor: { select: { name: true, specialization: true } } },
            orderBy: { appointmentDate: "desc" },
            take: 5,
        }),
        prisma.record.findMany({
            where: { patientId },
            include: { doctor: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
            take: 5,
        }),
        prisma.prescription.findMany({
            where: { patientId },
            include: { doctor: { select: { name: true } } },
            orderBy: { issuedAt: "desc" },
            take: 5,
        }),
    ]);

    return NextResponse.json({
        patient,
        recentAppointments: appointments,
        recentRecords: records,
        recentPrescriptions: prescriptions,
        counts: {
            appointments: appointments.length,
            records: records.length,
            prescriptions: prescriptions.length,
        },
    });
}
