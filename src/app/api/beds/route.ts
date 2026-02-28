import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const { searchParams } = new URL(req.url);
    const wardId = searchParams.get("ward_id");
    const status = searchParams.get("status");

    const beds = await prisma.bed.findMany({
        where: {
            hospitalId,
            ...(wardId ? { wardId } : {}),
            ...(status ? { status: status as any } : {}),
        },
        include: {
            ward: { select: { id: true, name: true, floor: true } },
            currentPatient: { select: { id: true, name: true, phone: true } },
        },
        orderBy: [{ ward: { name: "asc" } }, { bedNumber: "asc" }],
    });
    return NextResponse.json(beds);
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["admin"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;
    const body = await req.json();

    if (!body.wardId || !body.bedNumber) {
        return NextResponse.json({ error: "Ward and bed number required" }, { status: 400 });
    }

    const bed = await prisma.bed.create({
        data: {
            hospitalId,
            wardId: body.wardId,
            bedNumber: body.bedNumber,
            type: body.type || "general",
            notes: body.notes || undefined,
        },
    });
    return NextResponse.json(bed, { status: 201 });
}
