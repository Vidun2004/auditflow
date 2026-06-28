import { prisma } from "@auditflow/db";
import type { ActionStatus } from "@/types";

export interface ActionFilters {
  status?: ActionStatus;
  findingId?: string;
  assigneeId?: string;
  overdue?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getActions(orgId: string, filters: ActionFilters = {}) {
  const {
    status,
    findingId,
    assigneeId,
    overdue,
    search,
    page = 1,
    pageSize = 20,
  } = filters;

  const where = {
    orgId,
    ...(status && { status }),
    ...(findingId && { findingId }),
    ...(assigneeId && { assigneeId }),
    ...(overdue && {
      dueDate: { lt: new Date() },
      status: { notIn: ["CLOSED"] as ActionStatus[] },
    }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.correctiveAction.findMany({
      where,
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        status: true,
        progress: true,
        dueDate: true,
        closedAt: true,
        createdAt: true,
        finding: {
          select: {
            id: true,
            title: true,
            severity: true,
            audit: { select: { id: true, title: true } },
          },
        },
        assignee: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.correctiveAction.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getActionById(orgId: string, actionId: string) {
  return prisma.correctiveAction.findFirst({
    where: { id: actionId, orgId },
    include: {
      finding: {
        select: {
          id: true,
          title: true,
          severity: true,
          status: true,
          audit: { select: { id: true, title: true } },
        },
      },
      assignee: { select: { id: true, name: true, email: true, role: true } },
      createdBy: { select: { id: true, name: true, email: true } },
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
    },
  });
}

export type ActionList = Awaited<ReturnType<typeof getActions>>;
export type ActionDetail = Awaited<ReturnType<typeof getActionById>>;
