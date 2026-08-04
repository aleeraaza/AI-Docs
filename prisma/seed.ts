import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const users = [
  {
    email: "ali@alidocs.dev",
    name: "Ali Raza",
    password: "password123",
  },
  {
    email: "bob@alidocs.dev",
    name: "Bob Martinez",
    password: "password123",
  },
  {
    email: "carol@alidocs.dev",
    name: "Carol Okonkwo",
    password: "password123",
  },
];

async function main() {
  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, passwordHash },
      create: {
        email: user.email,
        name: user.name,
        passwordHash,
      },
    });
  }

  // Keep legacy seeded accounts working for existing local DBs
  const legacy = [
    { email: "alice@ajaia.dev", name: "Alice Chen" },
    { email: "bob@ajaia.dev", name: "Bob Martinez" },
    { email: "carol@ajaia.dev", name: "Carol Okonkwo" },
  ];
  for (const user of legacy) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (existing) {
      await prisma.user.update({
        where: { email: user.email },
        data: { passwordHash: await bcrypt.hash("password123", 10) },
      });
    }
  }

  const ali = await prisma.user.findUniqueOrThrow({
    where: { email: "ali@alidocs.dev" },
  });
  const bob = await prisma.user.findUniqueOrThrow({
    where: { email: "bob@alidocs.dev" },
  });

  const existing = await prisma.document.findFirst({
    where: { ownerId: ali.id, title: "Welcome to Ali Docs" },
  });

  if (!existing) {
    const doc = await prisma.document.create({
      data: {
        title: "Welcome to Ali Docs",
        ownerId: ali.id,
        content: `<h1>Welcome to Ali Docs</h1><p>Built by <strong>Ali Raza</strong> — a lightweight collaborative editor inspired by Google Docs.</p><p>Try <strong>bold</strong>, <em>italic</em>, <u>underline</u>, headings, and lists.</p><ul><li>Create docs from blank or templates</li><li>Import .txt, .md, or .docx</li><li>Share with Reader or Writer access</li></ul>`,
      },
    });

    await prisma.documentShare.create({
      data: {
        documentId: doc.id,
        userId: bob.id,
        permission: "edit",
      },
    });
  }

  console.log("Seeded users:");
  for (const user of users) {
    console.log(`  ${user.email} / ${user.password}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
