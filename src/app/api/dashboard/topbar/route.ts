import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "super_admin", "staff", "doctor"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    try {
        let searchResults = { patients: [] as any[], doctors: [] as any[] };

        // 1. If there's a search query, fetch global search results
        if (query.length >= 2) {
            const [patients, doctors] = await Promise.all([
                prisma.patient.findMany({
                    where: {
                        hospitalId,
                        OR: [
                            { name: { contains: query, mode: "insensitive" } },
                            { phone: { contains: query } },
                            { id: { contains: query } }
                        ]
                    },
                    select: { id: true, name: true, phone: true },
                    take: 5
                }),
                prisma.doctor.findMany({
                    where: {
                        hospitalId,
                        OR: [
                            { name: { contains: query, mode: "insensitive" } },
                            { specialization: { contains: query, mode: "insensitive" } }
                        ]
                    },
                    select: { id: true, name: true, specialization: true },
                    take: 5
                })
            ]);

            searchResults = { patients, doctors };
        }

        // 2. Fetch recent alerts/notifications
        // We'll aggregate pending appointments, emergency cases, and low stock
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [recentEmergencies, lowStockItems, todaysAppointments] = await Promise.all([
            prisma.emergencyCase.findMany({
                where: { hospitalId, status: "waiting" },
                orderBy: { arrivedAt: 'desc' },
                take: 3
            }),
            prisma.medicine.findMany({
                where: { hospitalId, stockQty: { lt: 10 } },
                take: 3
            }),
            prisma.appointment.findMany({
                where: { hospitalId, appointmentDate: { gte: today, lt: tomorrow }, status: "scheduled" },
                orderBy: { createdAt: 'desc' },
                include: { patient: { select: { name: true } }, doctor: { select: { name: true } } },
                take: 3
            })
        ]);

        const notifications: any[] = [];

        recentEmergencies.forEach(e => {
            notifications.push({
                id: `emg-${e.id}`,
                type: "emergency",
                title: "Emergency Waiting",
                desc: `${e.triageLevel.toUpperCase()} - ${e.patientName || 'Unknown Patient'}`,
                time: e.arrivedAt.toISOString(),
                unread: true
            });
        });

        lowStockItems.forEach(m => {
            notifications.push({
                id: `med-${m.id}`,
                type: "inventory",
                title: "Low Stock Alert",
                desc: `${m.name} is running low (${m.stockQty} left)`,
                time: m.updatedAt.toISOString(),
                unread: true
            });
        });

        todaysAppointments.forEach(a => {
            notifications.push({
                id: `apt-${a.id}`,
                type: "appointment",
                title: "New Appointment",
                desc: `${a.patient.name} w/ ${a.doctor.name}`,
                time: a.createdAt.toISOString(),
                unread: false // Just mark as read for demo
            });
        });

        // Sort notifications by time descending
        notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        return NextResponse.json({
            search: searchResults,
            notifications: notifications.slice(0, 10) // Return top 10
        });

    } catch (error) {
        console.error("Error fetching topbar data:", error);
        return NextResponse.json({ error: "Failed to fetch topbar data" }, { status: 500 });
    }
}
