import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── ISO 27001 controls (Annex A, abridged key controls) ─────────────────────

const ISO_27001_CONTROLS = [
  {
    controlId: "A.5.1",
    title: "Policies for information security",
    category: "Organizational",
  },
  {
    controlId: "A.5.2",
    title: "Information security roles and responsibilities",
    category: "Organizational",
  },
  { controlId: "A.6.1", title: "Screening", category: "People" },
  {
    controlId: "A.6.2",
    title: "Terms and conditions of employment",
    category: "People",
  },
  {
    controlId: "A.7.1",
    title: "Physical security perimeter",
    category: "Physical",
  },
  { controlId: "A.7.2", title: "Physical entry", category: "Physical" },
  {
    controlId: "A.7.3",
    title: "Securing offices, rooms and facilities",
    category: "Physical",
  },
  {
    controlId: "A.8.1",
    title: "User endpoint devices",
    category: "Technological",
  },
  {
    controlId: "A.8.2",
    title: "Privileged access rights",
    category: "Technological",
  },
  {
    controlId: "A.8.3",
    title: "Information access restriction",
    category: "Technological",
  },
  {
    controlId: "A.8.4",
    title: "Access to source code",
    category: "Technological",
  },
  {
    controlId: "A.8.5",
    title: "Secure authentication",
    category: "Technological",
  },
  {
    controlId: "A.8.6",
    title: "Capacity management",
    category: "Technological",
  },
  {
    controlId: "A.8.7",
    title: "Protection against malware",
    category: "Technological",
  },
  {
    controlId: "A.8.8",
    title: "Management of technical vulnerabilities",
    category: "Technological",
  },
  {
    controlId: "A.8.9",
    title: "Configuration management",
    category: "Technological",
  },
  {
    controlId: "A.8.10",
    title: "Information deletion",
    category: "Technological",
  },
  { controlId: "A.8.11", title: "Data masking", category: "Technological" },
  {
    controlId: "A.8.12",
    title: "Data leakage prevention",
    category: "Technological",
  },
  { controlId: "A.8.15", title: "Logging", category: "Technological" },
  {
    controlId: "A.8.16",
    title: "Monitoring activities",
    category: "Technological",
  },
  { controlId: "A.8.23", title: "Web filtering", category: "Technological" },
  {
    controlId: "A.8.24",
    title: "Use of cryptography",
    category: "Technological",
  },
  { controlId: "A.8.28", title: "Secure coding", category: "Technological" },
];

// ─── ISO 9001 controls ────────────────────────────────────────────────────────

const ISO_9001_CONTROLS = [
  {
    controlId: "4.1",
    title: "Understanding the organization and its context",
    category: "Context",
  },
  {
    controlId: "4.2",
    title: "Understanding needs and expectations of interested parties",
    category: "Context",
  },
  {
    controlId: "4.3",
    title: "Determining the scope of the QMS",
    category: "Context",
  },
  {
    controlId: "5.1",
    title: "Leadership and commitment",
    category: "Leadership",
  },
  { controlId: "5.2", title: "Quality policy", category: "Leadership" },
  {
    controlId: "5.3",
    title: "Organizational roles, responsibilities and authorities",
    category: "Leadership",
  },
  {
    controlId: "6.1",
    title: "Actions to address risks and opportunities",
    category: "Planning",
  },
  {
    controlId: "6.2",
    title: "Quality objectives and planning to achieve them",
    category: "Planning",
  },
  { controlId: "7.1", title: "Resources", category: "Support" },
  { controlId: "7.2", title: "Competence", category: "Support" },
  { controlId: "7.3", title: "Awareness", category: "Support" },
  { controlId: "7.4", title: "Communication", category: "Support" },
  { controlId: "7.5", title: "Documented information", category: "Support" },
  {
    controlId: "8.1",
    title: "Operational planning and control",
    category: "Operation",
  },
  {
    controlId: "8.4",
    title: "Control of externally provided processes",
    category: "Operation",
  },
  {
    controlId: "8.5",
    title: "Production and service provision",
    category: "Operation",
  },
  {
    controlId: "9.1",
    title: "Monitoring, measurement, analysis and evaluation",
    category: "Performance",
  },
  { controlId: "9.2", title: "Internal audit", category: "Performance" },
  { controlId: "9.3", title: "Management review", category: "Performance" },
  {
    controlId: "10.1",
    title: "Nonconformity and corrective action",
    category: "Improvement",
  },
  {
    controlId: "10.2",
    title: "Continual improvement",
    category: "Improvement",
  },
];

// ─── SOC 2 Trust Service Criteria ─────────────────────────────────────────────

const SOC2_CONTROLS = [
  {
    controlId: "CC1.1",
    title:
      "COSO Principle 1: Demonstrates commitment to integrity and ethical values",
    category: "Common Criteria",
  },
  {
    controlId: "CC1.2",
    title: "COSO Principle 2: Board exercises oversight responsibility",
    category: "Common Criteria",
  },
  {
    controlId: "CC2.1",
    title: "COSO Principle 13: Uses relevant, quality information",
    category: "Common Criteria",
  },
  {
    controlId: "CC2.2",
    title: "COSO Principle 14: Communicates information internally",
    category: "Common Criteria",
  },
  {
    controlId: "CC2.3",
    title: "COSO Principle 15: Communicates with external parties",
    category: "Common Criteria",
  },
  {
    controlId: "CC3.1",
    title: "COSO Principle 6: Specifies suitable objectives",
    category: "Common Criteria",
  },
  {
    controlId: "CC3.2",
    title: "COSO Principle 7: Identifies and analyses risk",
    category: "Common Criteria",
  },
  {
    controlId: "CC4.1",
    title: "COSO Principle 16: Conducts ongoing evaluations",
    category: "Common Criteria",
  },
  {
    controlId: "CC5.1",
    title: "COSO Principle 10: Selects and develops control activities",
    category: "Common Criteria",
  },
  {
    controlId: "CC6.1",
    title: "Logical and physical access controls",
    category: "Logical Access",
  },
  {
    controlId: "CC6.2",
    title: "Prior to issuing system credentials",
    category: "Logical Access",
  },
  {
    controlId: "CC6.3",
    title: "Role-based access control",
    category: "Logical Access",
  },
  {
    controlId: "CC6.6",
    title: "Logical access security measures against threats",
    category: "Logical Access",
  },
  {
    controlId: "CC6.7",
    title: "Transmission of data and information",
    category: "Logical Access",
  },
  {
    controlId: "CC7.1",
    title: "Detection and monitoring procedures",
    category: "System Operations",
  },
  {
    controlId: "CC7.2",
    title: "Monitors system components",
    category: "System Operations",
  },
  {
    controlId: "CC7.3",
    title: "Evaluates security events",
    category: "System Operations",
  },
  {
    controlId: "CC8.1",
    title: "Change management process",
    category: "Change Management",
  },
  {
    controlId: "CC9.1",
    title: "Risk mitigation activities",
    category: "Risk Mitigation",
  },
  {
    controlId: "A1.1",
    title: "Availability — capacity planning",
    category: "Availability",
  },
  {
    controlId: "A1.2",
    title: "Availability — environmental protections",
    category: "Availability",
  },
  {
    controlId: "C1.1",
    title: "Confidentiality — identifies confidential information",
    category: "Confidentiality",
  },
  {
    controlId: "P1.1",
    title: "Privacy — notice and communication of objectives",
    category: "Privacy",
  },
  {
    controlId: "P4.1",
    title: "Privacy — collection of personal information",
    category: "Privacy",
  },
];

// ─── GDPR Articles ────────────────────────────────────────────────────────────

const GDPR_CONTROLS = [
  {
    controlId: "Art.5",
    title: "Principles relating to processing of personal data",
    category: "Principles",
  },
  {
    controlId: "Art.6",
    title: "Lawfulness of processing",
    category: "Principles",
  },
  {
    controlId: "Art.7",
    title: "Conditions for consent",
    category: "Principles",
  },
  {
    controlId: "Art.9",
    title: "Processing of special categories of data",
    category: "Principles",
  },
  {
    controlId: "Art.12",
    title: "Transparent information and communication",
    category: "Rights",
  },
  {
    controlId: "Art.13",
    title: "Information to be provided — data collected from subject",
    category: "Rights",
  },
  {
    controlId: "Art.15",
    title: "Right of access by the data subject",
    category: "Rights",
  },
  { controlId: "Art.16", title: "Right to rectification", category: "Rights" },
  {
    controlId: "Art.17",
    title: "Right to erasure ('right to be forgotten')",
    category: "Rights",
  },
  {
    controlId: "Art.18",
    title: "Right to restriction of processing",
    category: "Rights",
  },
  {
    controlId: "Art.20",
    title: "Right to data portability",
    category: "Rights",
  },
  { controlId: "Art.21", title: "Right to object", category: "Rights" },
  {
    controlId: "Art.25",
    title: "Data protection by design and by default",
    category: "Controller Obligations",
  },
  {
    controlId: "Art.28",
    title: "Processor obligations",
    category: "Controller Obligations",
  },
  {
    controlId: "Art.30",
    title: "Records of processing activities",
    category: "Controller Obligations",
  },
  {
    controlId: "Art.32",
    title: "Security of processing",
    category: "Security",
  },
  {
    controlId: "Art.33",
    title: "Notification of personal data breach to supervisory authority",
    category: "Security",
  },
  {
    controlId: "Art.34",
    title: "Communication of breach to data subject",
    category: "Security",
  },
  {
    controlId: "Art.35",
    title: "Data protection impact assessment",
    category: "Security",
  },
  {
    controlId: "Art.37",
    title: "Designation of the data protection officer",
    category: "DPO",
  },
  {
    controlId: "Art.44",
    title: "General principle for transfers",
    category: "Transfers",
  },
  {
    controlId: "Art.46",
    title: "Transfers subject to appropriate safeguards",
    category: "Transfers",
  },
];

export async function seedControls(orgId: string) {
  console.log(`  Seeding controls for org ${orgId}...`);

  const frameworks = [
    { key: "ISO_27001" as const, controls: ISO_27001_CONTROLS },
    { key: "ISO_9001" as const, controls: ISO_9001_CONTROLS },
    { key: "SOC_2" as const, controls: SOC2_CONTROLS },
    { key: "GDPR" as const, controls: GDPR_CONTROLS },
  ];

  for (const { key, controls } of frameworks) {
    for (const ctrl of controls) {
      await prisma.control.upsert({
        where: {
          orgId_framework_controlId: {
            orgId,
            framework: key,
            controlId: ctrl.controlId,
          },
        },
        update: {},
        create: {
          orgId,
          framework: key,
          controlId: ctrl.controlId,
          title: ctrl.title,
          category: ctrl.category,
          isEnabled: true,
        },
      });
    }
    console.log(`    ✅ ${key}: ${controls.length} controls`);
  }
}

async function main() {
  // Seed controls for all active orgs
  const orgs = await prisma.organization.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true },
  });

  if (orgs.length === 0) {
    console.log("No active orgs found — skipping control seed.");
    return;
  }

  for (const org of orgs) {
    console.log(`Seeding controls for: ${org.name}`);
    await seedControls(org.id);
  }
  console.log("✅ Controls seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
