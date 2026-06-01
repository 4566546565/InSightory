import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.log("Usage: npx tsx prisma/update-users.ts <email> <password>");
    process.exit(1);
  }

  const pwHash = await bcrypt.hash(password, 12);
  const lockedPw = await bcrypt.hash("LOCKED_ACCOUNT_DO_NOT_USE", 12);

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    await db.user.update({ where: { email }, data: { passwordHash: pwHash } });
    console.log(`Updated account: ${email}`);
  } else {
    await db.user.create({
      data: {
        username: email.split("@")[0],
        email,
        passwordHash: pwHash,
        displayName: email.split("@")[0],
        role: "STUDENT",
      },
    });
    console.log(`Created account: ${email}`);
  }

  const others = await db.user.findMany({ where: { email: { not: email } } });
  for (const u of others) {
    await db.user.update({ where: { id: u.id }, data: { passwordHash: lockedPw } });
    console.log(`Locked account: ${u.email}`);
  }

  console.log(`Done. Only ${email} can log in now.`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
