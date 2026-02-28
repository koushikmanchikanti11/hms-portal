import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { searchParams } = new URL(req.url);
    const active = searchParams.get("active");

    const cases = await prisma.emergencyCase.findMany({
        where: {
            hospitalId,
            ...(active === "true" ? { status: { in: ["waiting", "in_treatment"] } } : {}),
        },
        include: {
            assignedDoctor: { select: { id: true, name: true, specialization: true } },
            patient: { select: { id: true, name: true } },
        },
        orderBy: [
            { triageLevel: "asc" },
            { arrivedAt: "asc" },
        ],
    });
    return NextResponse.json(cases);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const body = await req.json();

    if (!body.patientName || !body.chiefComplaint) {
        return NextResponse.json({ error: "Patient name and complaint required" }, { status: 400 });
    }

    const count = await prisma.emergencyCase.count({ where: { hospitalId } });
    const caseNumber = `EMG-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    const emergencyCase = await prisma.emergencyCase.create({
        data: {
            hospitalId,
            caseNumber,
            patientId: body.patientId || undefined,
            patientName: body.patientName,
            patientAge: body.patientAge ? Number(body.patientAge) : undefined,
            patientGender: body.patientGender || undefined,
            triageLevel: body.triageLevel || "urgent",
            chiefComplaint: body.chiefComplaint,
            vitalsBP: body.vitalsBP || undefined,
            vitalsHR: body.vitalsHR ? Number(body.vitalsHR) : undefined,
            vitalsTemp: body.vitalsTemp ? Number(body.vitalsTemp) : undefined,
            vitalsSpO2: body.vitalsSpO2 ? Number(body.vitalsSpO2) : undefined,
            vitalsRR: body.vitalsRR ? Number(body.vitalsRR) : undefined,
            assignedDoctorId: body.doctorId || undefined,
        },
    });
    return NextResponse.json(emergencyCase, { status: 201 });
}
