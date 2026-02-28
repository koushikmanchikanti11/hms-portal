import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";
import { hashPassword } from "better-auth/crypto";
import crypto from "crypto";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor", "patient"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;

    const doctors = await prisma.doctor.findMany({
        where: { hospitalId },
        orderBy: { name: "asc" },
    });

    return NextResponse.json(doctors);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const body = await req.json();

    if (!body.name || !body.specialization) {
        return NextResponse.json({ error: "Name and specialization are required" }, { status: 400 });
    }

    // If email + password provided, create login account for doctor portal
    if (body.email && body.password) {
        const existing = await prisma.user.findFirst({ where: { email: body.email } });
        if (existing) {
            return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
        }

        const passwordHash = await hashPassword(body.password);

        const doctor = await prisma.$transaction(async (tx) => {
            // Create user first so we have the userId
            const user = await tx.user.create({
                data: {
                    name: body.name,
                    email: body.email,
                    emailVerified: true,
                    role: "doctor",
                    hospitalId,
                    passwordHash,
                } as any,
            });

            // Create doctor linked to the user
            const doc = await tx.doctor.create({
                data: {
                    hospitalId,
                    name: body.name,
                    specialization: body.specialization,
                    phone: body.phone || undefined,
                    email: body.email,
                    availableDays: body.availableDays || [],
                    consultationFee: body.consultationFee || undefined,
                    userId: user.id,
                } as any,
            });

            await tx.account.create({
                data: {
                    id: crypto.randomUUID(),
                    userId: user.id,
                    accountId: user.id,
                    providerId: "credential",
                    password: passwordHash,
                },
            });

            return doc;
        });

        return NextResponse.json(doctor, { status: 201 });
    }

    // No password — create doctor without portal access
    const doctor = await prisma.doctor.create({
        data: {
            hospitalId,
            name: body.name,
            specialization: body.specialization,
            phone: body.phone || undefined,
            email: body.email || undefined,
            availableDays: body.availableDays || [],
            consultationFee: body.consultationFee || undefined,
        },
    });

    return NextResponse.json(doctor, { status: 201 });
}
