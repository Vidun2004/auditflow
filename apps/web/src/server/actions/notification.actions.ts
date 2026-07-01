"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/server/services/notification.service";
import type { ApiResponse } from "@/types";

export async function markReadAction(
  notificationId: string,
): Promise<ApiResponse<null>> {
  const session = await requireSession();
  await markNotificationRead(notificationId, session.id);
  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  revalidatePath("/");
  return { data: null, error: null, success: true };
}

export async function markAllReadAction(): Promise<ApiResponse<null>> {
  const session = await requireSession();
  await markAllNotificationsRead(session.orgId, session.id);
  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  revalidatePath("/");
  return { data: null, error: null, success: true };
}
