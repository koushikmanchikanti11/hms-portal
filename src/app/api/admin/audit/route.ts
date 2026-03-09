import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["super_admin"]);
    if (guard instanceof NextResponse) return guard;

    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 100, // Limit to 100 for now
            include: {
                hospital: { select: { name: true } }
            }
        });

        // We also need the user name for each log. Let's fetch users
        const userIds = Array.from(new Set(logs.map(log => log.userId)));
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, role: true }
        });

        const userMap = new Map(users.map(u => [u.id, u]));

        const enrichedLogs = logs.map(log => ({
            ...log,
            userName: userMap.get(log.userId)?.name || "Unknown User",
            userRole: userMap.get(log.userId)?.role || "unknown"
        }));

        return NextResponse.json(enrichedLogs);
    } catch (error) {
        console.error("Failed to fetch audit logs", error);
        return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
    }
}
