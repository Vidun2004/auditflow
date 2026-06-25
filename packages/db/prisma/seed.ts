import { PrismaClient, UserRole, OrgStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding AuditFlow...");

  // Create a demo org
  const org = await prisma.organization.upsert({
    where: { slug: "demo-corp" },
    update: {},
    create: {
      name: "Demo Corporation",
      slug: "demo-corp",
      status: OrgStatus.ACTIVE,
      settings: {
        create: {
          displayName: "Demo Corporation",
          accentColor: "#0f172a",
          timezone: "UTC",
          dateFormat: "DD/MM/YYYY",
        },
      },
    },
  });

  console.log(`✅ Org created: ${org.name} (${org.id})`);

  // Note: Users are created via Supabase Auth then synced here.
  // Seed creates the org structure only.

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
