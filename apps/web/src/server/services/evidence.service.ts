import { prisma } from "@auditflow/db";

export interface EvidenceFilters {
  auditId?: string;
  findingId?: string;
  actionId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getEvidence(
  orgId: string,
  filters: EvidenceFilters = {},
) {
  const {
    auditId,
    findingId,
    actionId,
    search,
    page = 1,
    pageSize = 20,
  } = filters;

  const where = {
    orgId,
    ...(auditId && { auditId }),
    ...(findingId && { findingId }),
    ...(actionId && { actionId }),
    ...(search && {
      name: { contains: search, mode: "insensitive" as const },
    }),
  };

  const [items, total] = await Promise.all([
    prisma.evidence.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        fileUrl: true,
        fileType: true,
        fileSizeKb: true,
        createdAt: true,
        audit: { select: { id: true, title: true } },
        finding: { select: { id: true, title: true } },
        action: { select: { id: true, title: true } },
      },
    }),
    prisma.evidence.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getEvidenceById(orgId: string, evidenceId: string) {
  return prisma.evidence.findFirst({
    where: { id: evidenceId, orgId },
    include: {
      audit: { select: { id: true, title: true } },
      finding: { select: { id: true, title: true } },
      action: { select: { id: true, title: true } },
    },
  });
}

export type EvidenceList = Awaited<ReturnType<typeof getEvidence>>;
