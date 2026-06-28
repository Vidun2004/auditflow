import { prisma } from "@auditflow/db";
import type { FindingStatus, FindingSeverity } from "@/types";

export interface FindingFilters {
  status?: FindingStatus;
  severity?: FindingSeverity;
  auditId?: string;
  department?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getFindings(orgId: string, filters: FindingFilters = {}) {
  const {
    status,
    severity,
    auditId,
    department,
    search,
    page = 1,
    pageSize = 20,
  } = filters;

  const where = {
    orgId,
    ...(status && { status }),
    ...(severity && { severity }),
    ...(auditId && { auditId }),
    ...(department && { department }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { department: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.finding.findMany({
      where,
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        severity: true,
        status: true,
        department: true,
        dueDate: true,
        createdAt: true,
        audit: { select: { id: true, title: true } },
        assignee: { select: { id: true, name: true, email: true } },
        _count: { select: { actions: true } },
      },
    }),
    prisma.finding.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getFindingById(orgId: string, findingId: string) {
  return prisma.finding.findFirst({
    where: { id: findingId, orgId },
    include: {
      audit: { select: { id: true, title: true, type: true, status: true } },
      assignee: { select: { id: true, name: true, email: true, role: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      actions: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          progress: true,
          dueDate: true,
          assignee: { select: { name: true, email: true } },
        },
      },
      evidence: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          fileType: true,
          fileSizeKb: true,
          createdAt: true,
        },
      },
      controlMappings: {
        select: {
          id: true,
          notes: true,
          control: {
            select: {
              id: true,
              controlId: true,
              title: true,
              framework: true,
              category: true,
            },
          },
        },
      },
      _count: { select: { actions: true, evidence: true } },
    },
  });
}

export type FindingList = Awaited<ReturnType<typeof getFindings>>;
export type FindingDetail = Awaited<ReturnType<typeof getFindingById>>;
