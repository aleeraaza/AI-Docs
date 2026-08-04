import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import mammoth from "mammoth";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma";
import {
  GUIDE_HTML,
  GUIDE_TITLE,
  RESUME_TITLE,
  WELCOME_HTML,
  WELCOME_TITLE,
  writeSampleDocx,
} from "./seed-content";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

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

async function loadResumeHtml() {
  const resumePath = path.join(
    process.cwd(),
    "samples",
    "Ali_Raza_Full_Software_Engineer.docx",
  );
  try {
    const buffer = await fs.readFile(resumePath);
    const result = await mammoth.convertToHtml({ buffer });
    const html = result.value?.trim();
    if (!html) {
      return `<h1>${RESUME_TITLE}</h1><p>Resume content unavailable.</p>`;
    }
    return html;
  } catch {
    return `<h1>${RESUME_TITLE}</h1><p>Place <code>Ali_Raza_Full_Software_Engineer.docx</code> in <code>samples/</code> and re-run the seed.</p>`;
  }
}

async function main() {
  await writeSampleDocx("Welcome_to_Ali_Docs.docx", WELCOME_TITLE, WELCOME_HTML);
  await writeSampleDocx(
    "About_Ali_Docs_How_to_Use.docx",
    GUIDE_TITLE,
    GUIDE_HTML,
  );

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

  const ali = await prisma.user.findUniqueOrThrow({
    where: { email: "ali@alidocs.dev" },
  });
  const bob = await prisma.user.findUniqueOrThrow({
    where: { email: "bob@alidocs.dev" },
  });
  const carol = await prisma.user.findUniqueOrThrow({
    where: { email: "carol@alidocs.dev" },
  });

  // Wipe previous demo docs/shares so leftover titles don't confuse the UI
  await prisma.documentShare.deleteMany({});
  await prisma.document.deleteMany({});

  const resumeHtml = await loadResumeHtml();

  const resumeDoc = await prisma.document.create({
    data: {
      title: RESUME_TITLE,
      content: resumeHtml,
      ownerId: ali.id,
    },
  });

  const welcomeDoc = await prisma.document.create({
    data: {
      title: WELCOME_TITLE,
      content: WELCOME_HTML,
      ownerId: bob.id,
    },
  });

  const guideDoc = await prisma.document.create({
    data: {
      title: GUIDE_TITLE,
      content: GUIDE_HTML,
      ownerId: carol.id,
    },
  });

  // Demo shares: Bob can read Ali's resume; Ali can edit Bob's welcome
  await prisma.documentShare.createMany({
    data: [
      {
        documentId: resumeDoc.id,
        userId: bob.id,
        permission: "view",
      },
      {
        documentId: welcomeDoc.id,
        userId: ali.id,
        permission: "edit",
      },
      {
        documentId: guideDoc.id,
        userId: ali.id,
        permission: "view",
      },
    ],
  });

  console.log("Seeded users + sample documents (clean slate):");
  for (const user of users) {
    console.log(`  ${user.email} / ${user.password}`);
  }
  console.log(`  Ali   owns: ${RESUME_TITLE}`);
  console.log(`  Bob   owns: ${WELCOME_TITLE}`);
  console.log(`  Carol owns: ${GUIDE_TITLE}`);
  console.log("  Shares: resume→Bob (Reader), welcome→Ali (Writer), guide→Ali (Reader)");
  console.log("Sample .docx files updated in samples/");
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
