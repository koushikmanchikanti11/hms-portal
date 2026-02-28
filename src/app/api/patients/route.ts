import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";
import { hashPassword } from "better-auth/crypto";
import crypto from "crypto";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;

    const { hospitalId } = guard;

    const patients = await prisma.patient.findMany({
        where: { hospitalId },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(patients);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;

    const { hospitalId } = guard;
    const body = await req.json();

    if (!body.name || !body.phone) {
        return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    if (body.email && body.password) {
        const existingEmail = await prisma.user.findUnique({ where: { email: body.email } });
        if (existingEmail) {
            return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }
    }

    const patientData = {
        hospitalId,
        name: body.name,
        phone: body.phone,
        dob: body.dob ? new Date(body.dob) : undefined,
        gender: body.gender || undefined,
        email: body.email || undefined,
        address: body.address || undefined,
        bloodGroup: body.bloodGroup || undefined,
        emergencyContactName: body.emergencyContactName || undefined,
        emergencyContactPhone: body.emergencyContactPhone || undefined,
    };

    let patient;

    if (body.email && body.password) {
        const passwordHash = await hashPassword(body.password);

        patient = await prisma.$transaction(async (tx) => {
            const newPatient = await tx.patient.create({ data: patientData });

            const user = await tx.user.create({
                data: {
                    hospitalId,
                    name: body.name,
                    email: body.email,
                    passwordHash,
                    role: "patient",
                    patientId: newPatient.id,
                    emailVerified: true,
                },
            });

            await tx.account.create({
                data: {
                    id: crypto.randomUUID(),
                    accountId: user.id,
                    providerId: "credential",
                    userId: user.id,
                    password: passwordHash,
                },
            });

            return newPatient;
        });
    } else {
        patient = await prisma.patient.create({
            data: patientData,
        });
    }

    return NextResponse.json(patient, { status: 201 });
}
