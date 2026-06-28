"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actionSchema, type ActionInput } from "@/lib/validations";
import { createActionAction } from "@/server/actions/action.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/loading";
import { cn } from "@/lib/utils";
import type { OrgUser } from "@/server/services/audit.service";

interface Props {
  users: OrgUser[];
  findings: {
    id: string;
    title: string;
    severity: string;
    audit: { title: string };
  }[];
  defaultFindingId?: string;
}

const SEVERITY_DOT: Record<string, string> = {
  LOW: "bg-green-500",
  MEDIUM: "bg-amber-500",
  HIGH: "bg-orange-500",
  CRITICAL: "bg-red-600",
};

export function CreateActionForm({ users, findings, defaultFindingId }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ActionInput>({
    resolver: zodResolver(actionSchema),
    defaultValues: {
      findingId: defaultFindingId ?? "",
      progress: 0,
    },
  });

  async function onSubmit(data: ActionInput) {
    setServerError(null);
    const result = await createActionAction(data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    router.push(`/actions/${result.data!.id}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Action details
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {serverError && (
            <div className="px-6 py-4">
              <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            </div>
          )}

          {/* Title */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Action title <span className="text-red-500">*</span>
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                Clear description of what needs to be done
              </p>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Input
                placeholder="e.g. Apply security patches to all production servers"
                {...register("title")}
                className={errors.title ? "border-red-300" : ""}
              />
              {errors.title && (
                <p className="text-xs text-red-600">{errors.title.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                Step-by-step details or acceptance criteria
              </p>
            </div>
            <div className="col-span-2">
              <Textarea
                placeholder="Describe the steps required to complete this action..."
                rows={3}
                {...register("description")}
              />
            </div>
          </div>

          {/* Finding */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Related finding <span className="text-red-500">*</span>
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                The finding this action will resolve
              </p>
            </div>
            <div className="col-span-2 space-y-1.5">
              {findings.length === 0 ? (
                <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  No open findings found. Create a finding first.
                </div>
              ) : (
                <select
                  {...register("findingId")}
                  className={cn(
                    "w-full border bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-900",
                    errors.findingId ? "border-red-300" : "border-gray-200",
                  )}
                >
                  <option value="">Select a finding...</option>
                  {findings.map((f) => (
                    <option key={f.id} value={f.id}>
                      [{f.severity}] {f.title} — {f.audit.title}
                    </option>
                  ))}
                </select>
              )}
              {errors.findingId && (
                <p className="text-xs text-red-600">
                  {errors.findingId.message}
                </p>
              )}
            </div>
          </div>

          {/* Assignee */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Assign to
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                Person responsible for completing this action
              </p>
            </div>
            <div className="col-span-2">
              <select
                {...register("assigneeId")}
                className="w-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-900"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name ?? u.email} ({u.role.toLowerCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due date */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Due date
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                Deadline for completing this action
              </p>
            </div>
            <div className="col-span-2">
              <Input type="date" {...register("dueDate")} className="w-full" />
            </div>
          </div>

          {/* Initial progress */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Initial progress
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                Current completion percentage (0–100)
              </p>
            </div>
            <div className="col-span-2 space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  {...register("progress", { valueAsNumber: true })}
                  className="flex-1 h-1.5 accent-gray-900"
                />
                <span className="w-10 text-right text-sm font-medium text-gray-700">
                  0%
                </span>
              </div>
              {errors.progress && (
                <p className="text-xs text-red-600">
                  {errors.progress.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border-gray-200 text-gray-600"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || findings.length === 0}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" className="border-white border-t-gray-400" />
                Creating action...
              </span>
            ) : (
              "Create action"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
