"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { findingSchema, type FindingInput } from "@/lib/validations";
import { createFindingAction } from "@/server/actions/finding.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/loading";
import { cn } from "@/lib/utils";
import type { OrgUser } from "@/server/services/audit.service";

interface Props {
  users: OrgUser[];
  audits: { id: string; title: string; type: string }[];
  defaultAuditId?: string;
}

const SEVERITIES = [
  {
    value: "LOW",
    label: "Low",
    description: "Minor issue, low business impact",
    color: "border-green-300 bg-green-50 text-green-800",
    activeColor: "border-green-600 bg-green-600 text-white",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    description: "Moderate risk, needs attention",
    color: "border-amber-300 bg-amber-50 text-amber-800",
    activeColor: "border-amber-500 bg-amber-500 text-white",
  },
  {
    value: "HIGH",
    label: "High",
    description: "Significant risk, prompt action needed",
    color: "border-orange-300 bg-orange-50 text-orange-800",
    activeColor: "border-orange-600 bg-orange-600 text-white",
  },
  {
    value: "CRITICAL",
    label: "Critical",
    description: "Severe risk, immediate action required",
    color: "border-red-300 bg-red-50 text-red-800",
    activeColor: "border-red-600 bg-red-600 text-white",
  },
];

export function CreateFindingForm({ users, audits, defaultAuditId }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState("LOW");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FindingInput>({
    resolver: zodResolver(findingSchema),
    defaultValues: {
      severity: "LOW",
      auditId: defaultAuditId ?? "",
    },
  });

  function selectSeverity(value: string) {
    setSelectedSeverity(value);
    setValue("severity", value as FindingInput["severity"], {
      shouldValidate: true,
    });
  }

  async function onSubmit(data: FindingInput) {
    setServerError(null);
    const result = await createFindingAction(data);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    router.push(`/findings/${result.data!.id}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" {...register("severity")} value={selectedSeverity} />

      <div className="border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Finding details
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
                Title <span className="text-red-500">*</span>
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                Short, descriptive finding name
              </p>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Input
                placeholder="e.g. Unpatched critical vulnerability in production"
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
                Full details of the finding
              </p>
            </div>
            <div className="col-span-2">
              <Textarea
                placeholder="Describe the finding in detail — what was observed, where, and what the potential impact is..."
                rows={4}
                {...register("description")}
              />
            </div>
          </div>

          {/* Severity — selectable buttons */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Severity <span className="text-red-500">*</span>
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                Impact level of this finding
              </p>
            </div>
            <div className="col-span-2">
              <div className="grid grid-cols-2 gap-2">
                {SEVERITIES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => selectSeverity(s.value)}
                    className={cn(
                      "flex flex-col items-start gap-0.5 border p-3 text-left transition-colors",
                      selectedSeverity === s.value ? s.activeColor : s.color,
                    )}
                  >
                    <span className="text-sm font-semibold">{s.label}</span>
                    <span className="text-xs opacity-80">{s.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Audit */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Audit <span className="text-red-500">*</span>
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                Which audit this finding belongs to
              </p>
            </div>
            <div className="col-span-2 space-y-1.5">
              {audits.length === 0 ? (
                <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  No active audits found. Create or start an audit first.
                </div>
              ) : (
                <select
                  {...register("auditId")}
                  className={cn(
                    "w-full border bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-900",
                    errors.auditId ? "border-red-300" : "border-gray-200",
                  )}
                >
                  <option value="">Select an audit...</option>
                  {audits.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({a.type.toLowerCase()})
                    </option>
                  ))}
                </select>
              )}
              {errors.auditId && (
                <p className="text-xs text-red-600">{errors.auditId.message}</p>
              )}
            </div>
          </div>

          {/* Department */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Department
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                Area where the finding was identified
              </p>
            </div>
            <div className="col-span-2">
              <Input
                placeholder="e.g. IT, Finance, HR"
                {...register("department")}
              />
            </div>
          </div>

          {/* Assignee */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Assign to
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                Person responsible for resolving this finding
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
                Target resolution date
              </p>
            </div>
            <div className="col-span-2">
              <Input type="date" {...register("dueDate")} className="w-full" />
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
            disabled={isSubmitting || audits.length === 0}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" className="border-white border-t-gray-400" />
                Creating finding...
              </span>
            ) : (
              "Create finding"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
