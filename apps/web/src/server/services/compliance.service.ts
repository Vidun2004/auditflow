import { prisma } from "@auditflow/db";
import type { Framework } from "@/types";

export const FRAMEWORK_LABELS: Record<Framework, string> = {
  ISO_27001: "ISO 27001",
  ISO_9001: "ISO 9001",
  SOC_2: "SOC 2",
  GDPR: "GDPR",
};

export const FRAMEWORK_DESCRIPTIONS: Record<Framework, string> = {
  ISO_27001: "Information security management system",
  ISO_9001: "Quality management system",
  SOC_2: "Trust service criteria for service organizations",
  GDPR: "General Data Protection Regulation",
};

export async function getFrameworkSummary(orgId: string) {
  const frameworks: Framework[] = ["ISO_27001", "ISO_9001", "SOC_2", "GDPR"];

  const summaries = await Promise.all(
    frameworks.map(async (framework) => {
      const [totalControls, mappedControls] = await Promise.all([
        prisma.control.count({ where: { orgId, framework, isEnabled: true } }),
        prisma.controlMapping.count({
          where: { orgId, control: { framework } },
        }),
      ]);

      const coverageScore =
        totalControls === 0
          ? 0
          : Math.round((mappedControls / totalControls) * 100);

      return {
        framework,
        label: FRAMEWORK_LABELS[framework],
        description: FRAMEWORK_DESCRIPTIONS[framework],
        totalControls,
        mappedControls,
        coverageScore,
      };
    }),
  );

  return summaries;
}

export async function getFrameworkControls(
  orgId: string,
  framework: Framework,
) {
  const controls = await prisma.control.findMany({
    where: { orgId, framework, isEnabled: true },
    include: {
      controlMappings: {
        include: {
          finding: {
            select: {
              id: true,
              title: true,
              severity: true,
              status: true,
            },
          },
        },
      },
    },
    orderBy: { controlId: "asc" },
  });

  return controls;
}

export async function mapFindingToControl(
  orgId: string,
  findingId: string,
  controlId: string,
  notes?: string,
) {
  return prisma.controlMapping.upsert({
    where: { controlId_findingId: { controlId, findingId } },
    update: { notes: notes ?? null },
    create: { orgId, controlId, findingId, notes: notes ?? null },
  });
}

export async function unmapFindingFromControl(
  controlId: string,
  findingId: string,
) {
  return prisma.controlMapping.deleteMany({
    where: { controlId, findingId },
  });
}

export type FrameworkSummary = Awaited<ReturnType<typeof getFrameworkSummary>>;
export type FrameworkControls = Awaited<
  ReturnType<typeof getFrameworkControls>
>;
