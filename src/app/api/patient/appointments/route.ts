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

    const appointments = await prisma.appointment.findMany({
        where: { patientId },
        include: {
            doctor: { select: { name: true, specialization: true, phone: true } },
        },
        orderBy: { appointmentDate: "desc" },
    });

    return NextResponse.json(appointments);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["patient"]);
    if (guard instanceof NextResponse) return guard;
    const { session, hospitalId } = guard;
    const user = session.user as any;
    const patientId = user.patientId;

    if (!patientId) {
        return NextResponse.json({ error: "No patient profile linked" }, { status: 403 });
    }

    const body = await req.json();

    if (!body.doctorId || !body.appointmentDate) {
        return NextResponse.json({ error: "Doctor and date are required" }, { status: 400 });
    }

    const appointment = await prisma.appointment.create({
        data: {
            hospitalId,
            patientId,
            doctorId: body.doctorId,
            appointmentDate: new Date(body.appointmentDate),
            type: "OP", // Default to Outpatient for self-booking
            status: "scheduled",
            createdById: user.id,
        },
        include: {
            doctor: { select: { name: true, specialization: true } },
        },
    });

    return NextResponse.json(appointment, { status: 201 });
}
