import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const cylinders = await prisma.oxygenCylinder.findMany({
        where: {
            hospitalId,
            ...(status ? { status: status as any } : {}),
        },
        orderBy: [{ status: "asc" }, { cylinderCode: "asc" }],
    });
    return NextResponse.json(cylinders);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const body = await req.json();

    if (!body.cylinderCode) {
        return NextResponse.json({ error: "Cylinder code is required" }, { status: 400 });
    }

    const existing = await prisma.oxygenCylinder.findUnique({
        where: { hospitalId_cylinderCode: { hospitalId, cylinderCode: body.cylinderCode } },
    });
    if (existing) {
        return NextResponse.json({ error: "Cylinder code already exists" }, { status: 409 });
    }

    const cylinder = await prisma.oxygenCylinder.create({
        data: {
            hospitalId,
            cylinderCode: body.cylinderCode,
            size: body.size || "D_TYPE",
            status: body.status || "full",
            pressureBar: body.pressureBar ? Number(body.pressureBar) : undefined,
            supplierName: body.supplierName || undefined,
            notes: body.notes || undefined,
        },
    });
    return NextResponse.json(cylinder, { status: 201 });
}
