import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";
import { hashPassword } from "better-auth/crypto";
import crypto from "crypto";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;

    const staff = await prisma.user.findMany({
        where: { hospitalId, role: "staff" },
        select: {
            id: true,
            name: true,
            email: true,
            staffRole: true,
            isActive: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(staff);
}

export async function PATCH(req: NextRequest) {
    const guard = await apiGuard(req, ["admin"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;

    const body = await req.json();
    const { userId, staffRole } = body;

    if (!userId) {
        return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const validRoles = ["receptionist", "nurse", "pharmacist", "lab_technician", "ward_boy", "accountant", null];
    if (!validRoles.includes(staffRole)) {
        return NextResponse.json({ error: "Invalid staffRole" }, { status: 400 });
    }

    // Ensure the user belongs to this hospital and is staff
    const user = await prisma.user.findFirst({
        where: { id: userId, hospitalId, role: "staff" },
    });

    if (!user) {
        return NextResponse.json({ error: "Staff user not found" }, { status: 404 });
    }

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { staffRole: staffRole ?? null },
        select: { id: true, name: true, email: true, staffRole: true },
    });

    return NextResponse.json(updated);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;

    const body = await req.json();
    const { name, email, password, staffRole: newStaffRole } = body;

    if (!name || !email || !password) {
        return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
        return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    const validRoles = ["receptionist", "nurse", "pharmacist", "lab_technician", "ward_boy", "accountant", "", null, undefined];
    if (!validRoles.includes(newStaffRole)) {
        return NextResponse.json({ error: "Invalid staffRole" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const staff = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                name,
                email,
                emailVerified: true,
                role: "staff",
                staffRole: newStaffRole || null,
                hospitalId,
                passwordHash,
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

        return user;
    });

    return NextResponse.json(
        { id: staff.id, name: staff.name, email: staff.email, staffRole: (staff as any).staffRole, isActive: staff.isActive },
        { status: 201 }
    );
}
