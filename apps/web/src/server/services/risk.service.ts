import { prisma } from "@auditflow/db";
import type { RiskStatus, RiskLikelihood, RiskImpact } from "@/types";

export interface RiskFilters {
  status?: RiskStatus;
  search?: string;
  minScore?: number;
  page?: number;
  pageSize?: number;
}

// ─── Score matrix: likelihood (1-5) × impact (1-5) ───────────────────────────

export const LIKELIHOOD_SCORE: Record<RiskLikelihood, number> = {
  RARE: 1,
  UNLIKELY: 2,
  POSSIBLE: 3,
  LIKELY: 4,
  ALMOST_CERTAIN: 5,
};

export const IMPACT_SCORE: Record<RiskImpact, number> = {
  INSIGNIFICANT: 1,
  MINOR: 2,
  MODERATE: 3,
  MAJOR: 4,
  CATASTROPHIC: 5,
};

export const LIKELIHOOD_LABELS: Record<RiskLikelihood, string> = {
  RARE: "Rare",
  UNLIKELY: "Unlikely",
  POSSIBLE: "Possible",
  LIKELY: "Likely",
  ALMOST_CERTAIN: "Almost Certain",
};

export const IMPACT_LABELS: Record<RiskImpact, string> = {
  INSIGNIFICANT: "Insignificant",
  MINOR: "Minor",
  MODERATE: "Moderate",
  MAJOR: "Major",
  CATASTROPHIC: "Catastrophic",
};

export function calculateRiskScore(
  likelihood: RiskLikelihood,
  impact: RiskImpact,
): number {
  return LIKELIHOOD_SCORE[likelihood] * IMPACT_SCORE[impact];
}

export function getRiskLevel(score: number): {
  label: string;
  color: string;
  bg: string;
  border: string;
} {
  if (score >= 15)
    return {
      label: "Critical",
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-300",
    };
  if (score >= 10)
    return {
      label: "High",
      color: "text-orange-700",
      bg: "bg-orange-50",
      border: "border-orange-300",
    };
  if (score >= 5)
    return {
      label: "Medium",
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-300",
    };
  return {
    label: "Low",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-300",
  };
}

export async function getRisks(orgId: string, filters: RiskFilters = {}) {
  const { status, search, minScore, page = 1, pageSize = 20 } = filters;

  const where = {
    orgId,
    ...(status && { status }),
    ...(minScore && { score: { gte: minScore } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { owner: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.risk.findMany({
      where,
      orderBy: [{ score: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.risk.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getRiskById(orgId: string, riskId: string) {
  return prisma.risk.findFirst({
    where: { id: riskId, orgId },
  });
}

export async function getRiskMatrixData(orgId: string) {
  const risks = await prisma.risk.findMany({
    where: { orgId, status: { not: "CLOSED" } },
    select: {
      id: true,
      name: true,
      likelihood: true,
      impact: true,
      score: true,
      status: true,
    },
  });

  return risks;
}

export type RiskList = Awaited<ReturnType<typeof getRisks>>;
export type RiskDetail = Awaited<ReturnType<typeof getRiskById>>;
export type RiskMatrixData = Awaited<ReturnType<typeof getRiskMatrixData>>;
