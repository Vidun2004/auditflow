"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { auditSchema, type AuditInput } from "@/lib/validations";
import { createAuditAction } from "@/server/actions/audit.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/loading";
import { cn } from "@/lib/utils";
import type { OrgUser } from "@/server/services/audit.service";

interface Props {
  users: OrgUser[];
}

const AUDIT_TYPES = [
  {
    value: "INTERNAL",
    label: "Internal",
    description: "In-house compliance checks",
  },
  {
    value: "EXTERNAL",
    label: "External",
    description: "Third-party auditor reviews",
  },
  {
    value: "SECURITY",
    label: "Security",
    description: "Cybersecurity & access audits",
  },
  {
    value: "VENDOR",
    label: "Vendor",
    description: "Supplier & vendor assessments",
  },
];

export function CreateAuditForm({ users }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState("INTERNAL");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AuditInput>({
    resolver: zodResolver(auditSchema),
    defaultValues: { type: "INTERNAL" },
  });

  function toggleAssignee(id: string) {
    setSelectedAssignees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function selectType(value: string) {
    setSelectedType(value);
    setValue("type", value as AuditInput["type"], { shouldValidate: true });
  }

  async function onSubmit(data: AuditInput) {
    setServerError(null);
    const result = await createAuditAction({
      ...data,
      assigneeIds: selectedAssignees,
    });

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    router.push(`/audits/${result.data!.id}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Hidden type field for RHF */}
      <input type="hidden" {...register("type")} value={selectedType} />

      <div className="border border-gray-200 bg-white">
        {/* Form header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Audit details
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {/* Error banner */}
          {serverError && (
            <div className="px-6 py-4">
              <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            </div>
          )}

          {/* Title */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div className="col-span-1">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-700"
              >
                Audit title <span className="text-red-500">*</span>
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                A clear, descriptive name for this audit
              </p>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Input
                id="title"
                placeholder="e.g. Q4 2025 Security Audit"
                {...register("title")}
                className={cn(
                  "w-full",
                  errors.title
                    ? "border-red-300 focus-visible:ring-red-300"
                    : "",
                )}
              />
              {errors.title && (
                <p className="text-xs text-red-600">{errors.title.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div className="col-span-1">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Description
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                Objectives and background context
              </p>
            </div>
            <div className="col-span-2">
              <Textarea
                id="description"
                placeholder="What is this audit for? What are the key objectives?"
                rows={3}
                {...register("description")}
                className="w-full"
              />
            </div>
          </div>

          {/* Audit type — selectable buttons */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div className="col-span-1">
              <Label className="text-sm font-medium text-gray-700">
                Audit type <span className="text-red-500">*</span>
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                Select the category of audit
              </p>
            </div>
            <div className="col-span-2">
              <div className="grid grid-cols-2 gap-2">
                {AUDIT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => selectType(t.value)}
                    className={cn(
                      "flex flex-col items-start gap-0.5 border p-3 text-left transition-colors",
                      selectedType === t.value
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50",
                    )}
                  >
                    <span className="text-sm font-medium">{t.label}</span>
                    <span
                      className={cn(
                        "text-xs",
                        selectedType === t.value
                          ? "text-gray-300"
                          : "text-gray-400",
                      )}
                    >
                      {t.description}
                    </span>
                  </button>
                ))}
              </div>
              {errors.type && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.type.message}
                </p>
              )}
            </div>
          </div>

          {/* Scope */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div className="col-span-1">
              <Label
                htmlFor="scope"
                className="text-sm font-medium text-gray-700"
              >
                Scope
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                Systems, processes, or areas covered
              </p>
            </div>
            <div className="col-span-2">
              <Textarea
                id="scope"
                placeholder="e.g. All production systems, HR data processing, Vendor onboarding process..."
                rows={2}
                {...register("scope")}
                className="w-full"
              />
            </div>
          </div>

          {/* Department */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div className="col-span-1">
              <Label
                htmlFor="department"
                className="text-sm font-medium text-gray-700"
              >
                Department
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                Primary department being audited
              </p>
            </div>
            <div className="col-span-2">
              <Input
                id="department"
                placeholder="e.g. IT, Finance, HR, Operations"
                {...register("department")}
                className="w-full"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div className="col-span-1">
              <Label className="text-sm font-medium text-gray-700">
                Audit period
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                Planned start and end dates
              </p>
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startDate" className="text-xs text-gray-500">
                  Start date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  className="w-full"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate" className="text-xs text-gray-500">
                  End date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Assignees */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div className="col-span-1">
              <Label className="text-sm font-medium text-gray-700">
                Assign auditors
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                Team members responsible for this audit
              </p>
            </div>
            <div className="col-span-2">
              {users.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No users in your organization yet.
                </p>
              ) : (
                <div className="border border-gray-200 divide-y divide-gray-100 max-h-56 overflow-y-auto">
                  {users.map((user) => {
                    const isSelected = selectedAssignees.includes(user.id);
                    return (
                      <label
                        key={user.id}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors",
                          isSelected ? "bg-gray-50" : "hover:bg-gray-50",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center border shrink-0 transition-colors",
                            isSelected
                              ? "border-gray-900 bg-gray-900"
                              : "border-gray-300 bg-white",
                          )}
                          onClick={() => toggleAssignee(user.id)}
                        >
                          {isSelected && (
                            <svg
                              className="h-2.5 w-2.5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={3}
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="square"
                                strokeLinejoin="miter"
                                d="m4.5 12.75 6 6 9-13.5"
                              />
                            </svg>
                          )}
                        </div>
                        <div
                          className="flex-1 min-w-0"
                          onClick={() => toggleAssignee(user.id)}
                        >
                          <p className="text-sm font-medium text-gray-700 truncate">
                            {user.name ?? user.email}
                          </p>
                          {user.name && (
                            <p className="text-xs text-gray-400 truncate">
                              {user.email}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 capitalize shrink-0">
                          {user.role.toLowerCase()}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
              {selectedAssignees.length > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  {selectedAssignees.length} assignee
                  {selectedAssignees.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/audits")}
            className="border-gray-200 text-gray-600 hover:text-gray-900"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" className="border-white border-t-gray-400" />
                Creating audit...
              </span>
            ) : (
              "Create audit"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
