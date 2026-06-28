import { prisma } from "@auditflow/db";
import type { AuditStatus, AuditType } from "@/types";

export interface AuditFilters {
  status?: AuditStatus;
  type?: AuditType;
  department?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getAudits(orgId: string, filters: AuditFilters = {}) {
  const { status, type, department, search, page = 1, pageSize = 20 } = filters;

  const where = {
    orgId,
    ...(status && { status }),
    ...(type && { type }),
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
    prisma.audit.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        department: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        createdBy: { select: { name: true, email: true } },
        assignees: { select: { id: true, name: true, email: true } },
        _count: { select: { findings: true } },
      },
    }),
    prisma.audit.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getAuditById(orgId: string, auditId: string) {
  return prisma.audit.findFirst({
    where: { id: auditId, orgId },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      assignees: { select: { id: true, name: true, email: true, role: true } },
      findings: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          severity: true,
          status: true,
          department: true,
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
      _count: { select: { findings: true, evidence: true } },
    },
  });
}

export async function getOrgUsers(orgId: string) {
  return prisma.user.findMany({
    where: { orgId, isActive: true },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });
}

export type AuditList = Awaited<ReturnType<typeof getAudits>>;
export type AuditDetail = Awaited<ReturnType<typeof getAuditById>>;
export type OrgUser = Awaited<ReturnType<typeof getOrgUsers>>[number];
