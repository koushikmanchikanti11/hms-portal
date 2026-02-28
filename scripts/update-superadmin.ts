import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

async function main() {
    const newEmail = "koushik.manchikanti.11@gmail.com";
    const newPassword = "Manchikanti11";

    const passwordHash = await hashPassword(newPassword);

    const user = await prisma.user.updateMany({
        where: { role: "super_admin" },
        data: {
            email: newEmail,
            passwordHash,
        },
    });

    await prisma.account.updateMany({
        where: { providerId: "credential" },
        data: {
            password: passwordHash,
        },
    });

    console.log("✅ Super Admin credentials updated!");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());