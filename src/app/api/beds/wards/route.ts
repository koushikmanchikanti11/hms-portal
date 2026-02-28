import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;

    const wards = await prisma.ward.findMany({
        where: { hospitalId },
        include: { _count: { select: { beds: true } } },
        orderBy: { name: "asc" },
    });
    return NextResponse.json(wards);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const body = await req.json();

    if (!body.name) {
        return NextResponse.json({ error: "Ward name is required" }, { status: 400 });
    }

    const ward = await prisma.ward.create({
        data: {
            hospitalId,
            name: body.name,
            floor: body.floor || undefined,
            totalBeds: body.totalBeds ? Number(body.totalBeds) : 0,
        },
    });
    return NextResponse.json(ward, { status: 201 });
}
