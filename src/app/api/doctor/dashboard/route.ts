import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { session, hospitalId } = guard;
    const user = session.user as any;

    const doctor = await prisma.doctor.findFirst({ where: { userId: user.id, hospitalId } });
    if (!doctor) return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
        todayAppointments,
        totalAppointments,
        totalPatients,
        totalPrescriptions,
        totalRecords,
        recentAppointments,
    ] = await Promise.all([
        prisma.appointment.count({
            where: { doctorId: doctor.id, appointmentDate: { gte: today, lt: tomorrow } }
        }),
        prisma.appointment.count({ where: { doctorId: doctor.id } }),
        prisma.appointment.groupBy({
            by: ["patientId"],
            where: { doctorId: doctor.id },
        }).then(r => r.length),
        prisma.prescription.count({ where: { doctorId: doctor.id } }),
        prisma.record.count({ where: { doctorId: doctor.id } }),
        prisma.appointment.findMany({
            where: { doctorId: doctor.id },
            orderBy: { appointmentDate: "desc" },
            take: 5,
            include: { patient: { select: { name: true, phone: true } } },
        }),
    ]);

    return NextResponse.json({
        doctor: { name: doctor.name, specialization: doctor.specialization },
        counts: {
            todayAppointments,
            totalAppointments,
            totalPatients,
            totalPrescriptions,
            totalRecords,
        },
        recentAppointments,
    });
}
