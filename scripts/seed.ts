// Seed script for HMS
// Run: npx ts-node scripts/seed.ts
// Or: npx tsx scripts/seed.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

import { hashPassword } from "better-auth/crypto";
import { auth } from "../src/lib/auth";


async function createOrUpdateUser(email: string, name: string, role: any, password: string, hospitalId?: string) {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.upsert({
        where: { email },
        update: { name, role, passwordHash, hospitalId },
        create: { name, email, role, passwordHash, hospitalId, emailVerified: true },
    });

    const existingAccount = await prisma.account.findFirst({
        where: { userId: user.id, providerId: "credential" },
    });

    if (!existingAccount) {
        await prisma.account.create({
            data: {
                id: crypto.randomUUID(),
                accountId: user.id,
                providerId: "credential",
                userId: user.id,
                password: passwordHash,
            },
        });
    } else {
        await prisma.account.update({
            where: { id: existingAccount.id },
            data: { password: passwordHash },
        });
    }
    return user;
}

const SPECIALIZATIONS = ["Cardiology", "Orthopedics", "Neurology", "Pediatrics", "Dermatology"];

const INDIAN_NAMES = [
    "Arun Kumar", "Priya Sharma", "Rajesh Patel", "Sunita Verma", "Vikram Singh",
    "Meena Reddy", "Suresh Gupta", "Kavitha Nair", "Deepak Joshi", "Anjali Rao",
    "Ravi Shankar", "Lakshmi Iyer", "Ramesh Bhatt", "Pooja Mehta", "Sanjay Deshmukh",
];

const MEDICINES = [
    { name: "Paracetamol 500mg", generic: "Acetaminophen", cat: "Antipyretic" },
    { name: "Amoxicillin 250mg", generic: "Amoxicillin", cat: "Antibiotic" },
    { name: "Ibuprofen 400mg", generic: "Ibuprofen", cat: "Painkiller" },
    { name: "Omeprazole 20mg", generic: "Omeprazole", cat: "Antacid" },
    { name: "Cetirizine 10mg", generic: "Cetirizine", cat: "Antihistamine" },
    { name: "Metformin 500mg", generic: "Metformin", cat: "Antidiabetic" },
    { name: "Atorvastatin 10mg", generic: "Atorvastatin", cat: "Cardiovascular" },
    { name: "Azithromycin 500mg", generic: "Azithromycin", cat: "Antibiotic" },
    { name: "Pantoprazole 40mg", generic: "Pantoprazole", cat: "Antacid" },
    { name: "Amlodipine 5mg", generic: "Amlodipine", cat: "Cardiovascular" },
    { name: "Vitamin D3", generic: "Cholecalciferol", cat: "Vitamin" },
    { name: "Dolo 650", generic: "Paracetamol", cat: "Antipyretic" },
    { name: "Crocin Advance", generic: "Paracetamol", cat: "Antipyretic" },
    { name: "Betadine Solution", generic: "Povidone-Iodine", cat: "Antiseptic" },
    { name: "Metronidazole 400mg", generic: "Metronidazole", cat: "Antibiotic" },
];


async function seed() {
    console.log("🌱 Seeding database (Admin Only)...\n");

    // 1️⃣ Create Super Admin
    const superAdmin = await createOrUpdateUser(
        "superadmin@hms.com",
        "Super Admin",
        "super_admin",
        "SuperAdmin@2026"
    );

    console.log("✅ Super Admin created:", superAdmin.email);

    // 2️⃣ Create Hospitals
    const hospitals = [
        {
            name: "Apollo Hospital",
            slug: "apollo",
            email: "info@apollo.com",
            phone: "9999999999",
            address: "Jubilee Hills, Hyderabad",
        },
        {
            name: "Fortis Hospital",
            slug: "fortis",
            email: "info@fortis.com",
            phone: "8888888888",
            address: "Bannerghatta Road, Bangalore",
        },
    ];

    for (const h of hospitals) {
        const hospital = await prisma.hospital.upsert({
            where: { slug: h.slug },
            update: {},
            create: h,
        });

        console.log(`🏥 Hospital created: ${hospital.name}`);

        // 3️⃣ Create Hospital Admin (ONLY)
        const admin = await createOrUpdateUser(
            `admin@${h.slug}.com`,
            `${hospital.name} Admin`,
            "admin",
            `${h.slug.charAt(0).toUpperCase() + h.slug.slice(1)}@2026`,
            hospital.id
        );

        console.log(`   👤 Admin created: ${admin.email}`);
    }

    console.log("\n✅ Minimal Seed Complete!\n");
    console.log("Login Credentials:");
    console.log("Super Admin:  koushik.manchikanti.11@gmail.com / Manchikanti11");
    console.log("Apollo Admin: admin@apollo.com / Apollo@2026");
    console.log("Fortis Admin: admin@fortis.com / Fortis@2026");
}

seed()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
