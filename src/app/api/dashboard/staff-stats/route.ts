import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "staff"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId, session } = guard;

    const user = session.user as any;
    const staffRole = user.staffRole as string | undefined;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    switch (staffRole) {
        case "receptionist": {
            const [appointmentsToday, waitingQueue, pendingInvoices] = await Promise.all([
                prisma.appointment.count({
                    where: { hospitalId, appointmentDate: { gte: today, lt: tomorrow } },
                }),
                prisma.queueToken.count({
                    where: { hospitalId, status: "waiting", date: { gte: today, lt: tomorrow } },
                }),
                prisma.invoice.findMany({
                    where: { hospitalId, status: { in: ["pending", "partial"] } },
                    select: { totalAmount: true, paidAmount: true },
                }),
            ]);
            const pendingAmount = pendingInvoices.reduce(
                (sum, inv) => sum + (Number(inv.totalAmount) - Number(inv.paidAmount)), 0
            );
            return NextResponse.json({
                appointments_today: appointmentsToday,
                patients_waiting: waitingQueue,
                pending_bills: pendingInvoices.length,
                pending_amount: pendingAmount,
            });
        }

        case "pharmacist": {
            const [prescriptionsToday, expiringSoon] = await Promise.all([
                prisma.prescription.count({
                    where: { hospitalId, issuedAt: { gte: today, lt: tomorrow } },
                }),
                prisma.medicine.count({
                    where: { hospitalId, expiryDate: { gte: today, lte: thirtyDaysFromNow } },
                }),
            ]);
            // low stock: medicines where stockQty < minThreshold (column comparison via raw)
            const lowStockResult = await prisma.$queryRaw<{ count: bigint }[]>`
                SELECT COUNT(*)::bigint as count FROM medicines
                WHERE "hospitalId" = ${hospitalId} AND "stockQty" < "minThreshold"
            `;
            const lowStock = Number(lowStockResult[0]?.count ?? 0);
            return NextResponse.json({
                low_stock_count: lowStock,
                prescriptions_today: prescriptionsToday,
                expiring_soon: expiringSoon,
            });
        }

        case "nurse": {
            const [occupiedBeds, activePrescriptions] = await Promise.all([
                prisma.bed.count({ where: { hospitalId, status: "occupied" } }),
                prisma.prescription.count({ where: { hospitalId, status: "active" } }),
            ]);
            return NextResponse.json({
                assigned_patients: occupiedBeds,
                pending_vitals: 0, // placeholder — real vitals tracking would need a separate model
                active_prescriptions: activePrescriptions,
            });
        }

        case "accountant": {
            const [revenueToday, pendingInvoices, revenueMonth] = await Promise.all([
                prisma.invoice.findMany({
                    where: { hospitalId, status: "paid", updatedAt: { gte: today, lt: tomorrow } },
                    select: { totalAmount: true },
                }),
                prisma.invoice.findMany({
                    where: { hospitalId, status: { in: ["pending", "partial"] } },
                    select: { totalAmount: true, paidAmount: true },
                }),
                prisma.invoice.findMany({
                    where: { hospitalId, status: "paid", updatedAt: { gte: monthStart } },
                    select: { totalAmount: true },
                }),
            ]);
            return NextResponse.json({
                revenue_today: revenueToday.reduce((s, i) => s + Number(i.totalAmount), 0),
                pending_bills: pendingInvoices.length,
                pending_amount: pendingInvoices.reduce(
                    (s, i) => s + (Number(i.totalAmount) - Number(i.paidAmount)), 0
                ),
                revenue_this_month: revenueMonth.reduce((s, i) => s + Number(i.totalAmount), 0),
            });
        }

        case "ward_boy": {
            const [totalBeds, occupiedBeds, availableBeds] = await Promise.all([
                prisma.bed.count({ where: { hospitalId } }),
                prisma.bed.count({ where: { hospitalId, status: "occupied" } }),
                prisma.bed.count({ where: { hospitalId, status: "available" } }),
            ]);
            return NextResponse.json({ total_beds: totalBeds, occupied_beds: occupiedBeds, available_beds: availableBeds });
        }

        case "lab_technician": {
            const [ordersToday, totalPatients, reportsToday] = await Promise.all([
                prisma.appointment.count({
                    where: { hospitalId, appointmentDate: { gte: today, lt: tomorrow } },
                }),
                prisma.patient.count({ where: { hospitalId } }),
                prisma.record.count({
                    where: { hospitalId, createdAt: { gte: today, lt: tomorrow } },
                }),
            ]);
            return NextResponse.json({ orders_today: ordersToday, reports_today: reportsToday, total_patients: totalPatients });
        }

        default: {
            // Generic staff — return basic stats
            const [totalPatients, appointmentsToday] = await Promise.all([
                prisma.patient.count({ where: { hospitalId } }),
                prisma.appointment.count({
                    where: { hospitalId, appointmentDate: { gte: today, lt: tomorrow } },
                }),
            ]);
            return NextResponse.json({ total_patients: totalPatients, appointments_today: appointmentsToday });
        }
    }
}
