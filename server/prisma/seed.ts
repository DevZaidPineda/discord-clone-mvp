import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.message.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.serverMember.deleteMany();
  await prisma.server.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash("password123", 12);

  const alice = await prisma.user.create({
    data: { email: "alice@example.com", username: "alice", password: hash },
  });

  const bob = await prisma.user.create({
    data: { email: "bob@example.com", username: "bob", password: hash },
  });

  const server = await prisma.server.create({
    data: {
      name: "Dev Hangout",
      inviteCode: "dev-hangout-001",
      ownerId: alice.id,
      channels: {
        create: [{ name: "general" }, { name: "random" }, { name: "dev-talk" }],
      },
      members: {
        create: [
          { userId: alice.id, role: "ADMIN" },
          { userId: bob.id, role: "MEMBER" },
        ],
      },
    },
    include: { channels: true },
  });

  const general = server.channels.find((c) => c.name === "general")!;
  await prisma.message.createMany({
    data: [
      { content: "Welcome to the server! 🎉", authorId: alice.id, channelId: general.id },
      { content: "Thanks for the invite!", authorId: bob.id, channelId: general.id },
    ],
  });

  console.log("✅ Seed completed!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
