import { NextRequest, NextResponse } from "next/server";
import { apiGuard } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const guard = await apiGuard(req, ["super_admin"]);
    if (guard instanceof NextResponse) return guard;

    try {
        const [
            hospitalCount,
            userCount,
            patientCount,
            doctorCount,
            appointmentCount,
            revenueData
        ] = await Promise.all([
            prisma.hospital.count(),
            prisma.user.count(),
            prisma.patient.count(),
            prisma.doctor.count(),
            prisma.appointment.count(),
            prisma.invoice.aggregate({
                _sum: {
                    totalAmount: true,
                    paidAmount: true,
                }
            })
        ]);

        return NextResponse.json({
            hospitals: hospitalCount,
            users: userCount,
            patients: patientCount,
            doctors: doctorCount,
            appointments: appointmentCount,
            totalRevenue: revenueData._sum.totalAmount || 0,
            collectedRevenue: revenueData._sum.paidAmount || 0,
        });
    } catch (error) {
        console.error("Failed to fetch platform analytics", error);
        return NextResponse.json({ error: "Failed to fetch platform analytics" }, { status: 500 });
    }
}
