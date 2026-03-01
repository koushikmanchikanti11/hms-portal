import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["admin", "super_admin"]);
    if (guard instanceof NextResponse) return guard;
    const { hospitalId } = guard;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
        totalPatients,
        patientsToday,
        appointmentsToday,
        appointmentsScheduled,
        pendingInvoices,
        paidThisMonth,
        lowStockMedicines,
        expiringSoon,
        activeEmergency,
        totalBeds,
        occupiedBeds,
        pendingPrescriptions,
        doctorsOnDuty,
    ] = await Promise.all([
        prisma.patient.count({ where: { hospitalId } }),
        prisma.patient.count({ where: { hospitalId, createdAt: { gte: today, lt: tomorrow } } }),
        prisma.appointment.count({ where: { hospitalId, appointmentDate: { gte: today, lt: tomorrow } } }),
        prisma.appointment.count({ where: { hospitalId, status: "scheduled" } }),
        prisma.invoice.findMany({ where: { hospitalId, status: { in: ["pending", "partial"] } }, select: { totalAmount: true, paidAmount: true } }),
        prisma.invoice.findMany({
            where: {
                hospitalId,
                status: "paid",
                updatedAt: { gte: startOfMonth },
            },
            select: { totalAmount: true },
        }),
        prisma.medicine.count({
            where: { hospitalId, stockQty: { lt: 10 } },
        }),
        prisma.medicine.count({
            where: { hospitalId, expiryDate: { gte: today, lte: thirtyDaysFromNow } },
        }),
        prisma.emergencyCase.count({
            where: { hospitalId, status: { in: ["waiting", "in_treatment"] } },
        }),
        prisma.bed.count({ where: { hospitalId } }),
        prisma.bed.count({ where: { hospitalId, status: "occupied" } }),
        prisma.prescription.count({
            where: { hospitalId, status: "active" },
        }),
        prisma.doctor.count({ where: { hospitalId } }),
    ]);

    const pendingAmount = pendingInvoices.reduce((sum, inv) =>
        sum + (Number(inv.totalAmount) - Number(inv.paidAmount)), 0
    );

    const revenueThisMonth = paidThisMonth.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    // Dashboard Sub-component Data Requirements

    // 1. Today's Schedule Data
    const todayAppointmentsData = await prisma.appointment.findMany({
        where: { hospitalId, appointmentDate: { gte: today, lt: tomorrow } },
        include: {
            patient: { select: { name: true } },
            doctor: { select: { name: true, user: { select: { image: true } } } }
        },
        orderBy: { appointmentDate: "asc" },
        take: 10
    });

    const formattedTodayAppointments = todayAppointmentsData.map(a => {
        const timeStr = a.appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        // Calculate a mock 30-min end time since we don't have end time
        const endDate = new Date(a.appointmentDate.getTime() + 30 * 60000);
        const timeRange = `${timeStr} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        return {
            id: a.id,
            time: timeStr,
            timeRange,
            patientName: a.patient.name,
            doctor: {
                name: a.doctor.name,
                avatar: a.doctor.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.doctor.name)}&background=random`
            }
        };
    });

    // 2. Patient Split
    const newPatients = await prisma.patient.count({
        where: { hospitalId, createdAt: { gte: startOfMonth } }
    });
    const oldPatients = totalPatients - newPatients;

    const genderStats = await prisma.patient.groupBy({
        by: ['gender'],
        where: { hospitalId },
        _count: true
    });
    const maleCount = genderStats.find(g => g.gender === "male")?._count || 0;
    const femaleCount = genderStats.find(g => g.gender === "female")?._count || 0;

    // 3. Queue Status Data (fall back to scheduled appts)
    const queueQuery = await prisma.appointment.groupBy({
        by: ['status'],
        where: { hospitalId, appointmentDate: { gte: today, lt: tomorrow } },
        _count: true
    });

    let queueStatus = { waiting: 0, completed: 0, cancelled: 0 };
    queueStatus.waiting = queueQuery.find(a => a.status === "scheduled")?._count || 0;
    queueStatus.completed = queueQuery.find(a => a.status === "completed")?._count || 0;
    queueStatus.cancelled = queueQuery.find(a => a.status === "cancelled")?._count || 0;

    // 4. Monthly Patient Status Chart (past 6 months)
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    const appointmentsByMonth = await prisma.appointment.findMany({
        where: { hospitalId, appointmentDate: { gte: sixMonthsAgo } },
        select: { appointmentDate: true, type: true }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyDataMap = new Map();

    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthStr = monthNames[d.getMonth()];
        monthlyDataMap.set(monthStr, { month: monthStr, consultation: 0, checkUp: 0 });
    }

    appointmentsByMonth.forEach(a => {
        const monthStr = monthNames[a.appointmentDate.getMonth()];
        const entry = monthlyDataMap.get(monthStr);
        if (entry) {
            if (a.type === "OP") entry.consultation += 1;
            else entry.checkUp += 1;
        }
    });
    const monthlyChartData = Array.from(monthlyDataMap.values());

    return NextResponse.json({
        total_patients: totalPatients,
        patients_today: patientsToday,
        appointments_today: appointmentsToday,
        appointments_scheduled: appointmentsScheduled,
        pending_bills: pendingInvoices.length,
        pending_amount: pendingAmount,
        low_stock_count: lowStockMedicines,
        expiring_soon_count: expiringSoon,
        revenue_this_month: revenueThisMonth,
        active_emergency: activeEmergency,
        total_beds: totalBeds,
        occupied_beds: occupiedBeds,
        pending_prescriptions: pendingPrescriptions,
        doctors_on_duty: doctorsOnDuty,

        // Detailed Component Data
        today_appointments: formattedTodayAppointments,
        patient_split: {
            newPatients,
            oldPatients,
            maleCount,
            femaleCount
        },
        queue_status: queueStatus,
        monthly_chart: monthlyChartData,
    });
}
