import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["super_admin"]);
    if (guard instanceof NextResponse) return guard;

    try {
        const configs = await prisma.systemConfig.findMany();

        // Convert array of {key, value} to object
        const configMap: Record<string, string> = {};
        configs.forEach((c: { key: string; value: string }) => configMap[c.key] = c.value);

        return NextResponse.json(configMap);
    } catch (error) {
        console.error("Failed to fetch system config", error);
        return NextResponse.json({ error: "Failed to fetch system config" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const guard = await apiGuard(req, ["super_admin"]);
    if (guard instanceof NextResponse) return guard;

    try {
        const data = await req.json();

        // Data is key-value pairs
        const keys = Object.keys(data);

        // Upsert all keys
        await Promise.all(
            keys.map(key =>
                prisma.systemConfig.upsert({
                    where: { key },
                    update: { value: String(data[key]) },
                    create: { key, value: String(data[key]) }
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to save system config", error);
        return NextResponse.json({ error: "Failed to save system config" }, { status: 500 });
    }
}
