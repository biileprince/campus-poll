// Idempotent seed: ensures an admin user exists. Safe to re-run.
// Run with: npm run db:seed   (from inside /server)
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'biileprince@gmail.com').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

async function main() {
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

    if (existing) {
        // Make sure the user is promoted to admin. Leave name/password alone
        // unless they were missing (Google-only account).
        const updated = await prisma.user.update({
            where: { id: existing.id },
            data: {
                role: 'ADMIN',
                ...(existing.password ? {} : { password: hashed }),
                ...(existing.name ? {} : { name: ADMIN_NAME }),
            },
            select: { id: true, email: true, name: true, role: true },
        });
        console.log(`✅ Promoted existing user to ADMIN: ${updated.email}`);
        if (!existing.password) {
            console.log(`   Set initial password to: ${ADMIN_PASSWORD}`);
        } else {
            console.log(`   (Existing password kept — sign in with the password you already use.)`);
        }
    } else {
        const created = await prisma.user.create({
            data: {
                email: ADMIN_EMAIL,
                password: hashed,
                name: ADMIN_NAME,
                role: 'ADMIN',
            },
            select: { id: true, email: true, name: true, role: true },
        });
        console.log(`✅ Created ADMIN user: ${created.email}`);
        console.log(`   Password: ${ADMIN_PASSWORD}`);
    }
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
