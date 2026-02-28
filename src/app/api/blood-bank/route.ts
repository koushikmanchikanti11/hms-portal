import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;

    const inventory = await prisma.bloodUnit.groupBy({
        by: ["bloodGroup"],
        where: { hospitalId, status: "available" },
        _sum: { units: true },
    });

    const expiringSoon = await prisma.bloodUnit.findMany({
        where: {
            hospitalId,
            status: "available",
            expiryDate: {
                gte: new Date(),
                lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        },
        orderBy: { expiryDate: "asc" },
    });

    const allUnits = await prisma.bloodUnit.findMany({
        where: { hospitalId },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ inventory, expiringSoon, allUnits });
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const body = await req.json();

    if (!body.bloodGroup || !body.units || !body.expiryDate) {
        return NextResponse.json({ error: "Blood group, units, and expiry date required" }, { status: 400 });
    }

    const unit = await prisma.bloodUnit.create({
        data: {
            hospitalId,
            bloodGroup: body.bloodGroup,
            units: Number(body.units),
            donorName: body.donorName || undefined,
            donorContact: body.donorContact || undefined,
            collectedAt: body.collectedAt ? new Date(body.collectedAt) : new Date(),
            expiryDate: new Date(body.expiryDate),
            notes: body.notes || undefined,
        },
    });
    return NextResponse.json(unit, { status: 201 });
}
