"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { riskSchema, type RiskInput } from "@/lib/validations";
import { createRiskAction } from "@/server/actions/risk.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/loading";
import { cn } from "@/lib/utils";
import {
  LIKELIHOOD_LABELS,
  IMPACT_LABELS,
  calculateRiskScore,
  getRiskLevel,
} from "@/server/services/risk.service";
import type { RiskLikelihood, RiskImpact } from "@/types";

const LIKELIHOODS: RiskLikelihood[] = [
  "RARE",
  "UNLIKELY",
  "POSSIBLE",
  "LIKELY",
  "ALMOST_CERTAIN",
];

const IMPACTS: RiskImpact[] = [
  "INSIGNIFICANT",
  "MINOR",
  "MODERATE",
  "MAJOR",
  "CATASTROPHIC",
];

export function CreateRiskForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [likelihood, setLikelihood] = useState<RiskLikelihood>("POSSIBLE");
  const [impact, setImpact] = useState<RiskImpact>("MODERATE");

  const score = calculateRiskScore(likelihood, impact);
  const level = getRiskLevel(score);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RiskInput>({
    resolver: zodResolver(riskSchema),
    defaultValues: { likelihood: "POSSIBLE", impact: "MODERATE" },
  });

  function selectLikelihood(value: RiskLikelihood) {
    setLikelihood(value);
    setValue("likelihood", value, { shouldValidate: true });
  }

  function selectImpact(value: RiskImpact) {
    setImpact(value);
    setValue("impact", value, { shouldValidate: true });
  }

  async function onSubmit(data: RiskInput) {
    setServerError(null);
    const result = await createRiskAction(data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    router.push(`/risks/${result.data!.id}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" {...register("likelihood")} value={likelihood} />
      <input type="hidden" {...register("impact")} value={impact} />

      <div className="border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Risk details
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

          {/* Name */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Risk name <span className="text-red-500">*</span>
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                A clear, concise name for this risk
              </p>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Input
                placeholder="e.g. Data breach via unpatched systems"
                {...register("name")}
                className={errors.name ? "border-red-300" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
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
                Context and background for this risk
              </p>
            </div>
            <div className="col-span-2">
              <Textarea
                placeholder="Describe the risk, its causes, and potential consequences..."
                rows={3}
                {...register("description")}
              />
            </div>
          </div>

          {/* Likelihood */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Likelihood <span className="text-red-500">*</span>
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                How likely is this risk to occur?
              </p>
            </div>
            <div className="col-span-2">
              <div className="flex flex-wrap gap-2">
                {LIKELIHOODS.map((l, i) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => selectLikelihood(l)}
                    className={cn(
                      "flex flex-col items-start border px-3 py-2 text-left transition-colors min-w-28",
                      likelihood === l
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50",
                    )}
                  >
                    <span className="text-xs font-semibold">
                      {LIKELIHOOD_LABELS[l]}
                    </span>
                    <span
                      className={cn(
                        "text-xs",
                        likelihood === l ? "text-gray-400" : "text-gray-400",
                      )}
                    >
                      ×{i + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Impact */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Impact <span className="text-red-500">*</span>
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                How severe would the impact be?
              </p>
            </div>
            <div className="col-span-2">
              <div className="flex flex-wrap gap-2">
                {IMPACTS.map((imp, i) => (
                  <button
                    key={imp}
                    type="button"
                    onClick={() => selectImpact(imp)}
                    className={cn(
                      "flex flex-col items-start border px-3 py-2 text-left transition-colors min-w-28",
                      impact === imp
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50",
                    )}
                  >
                    <span className="text-xs font-semibold">
                      {IMPACT_LABELS[imp]}
                    </span>
                    <span className="text-xs text-gray-400">×{i + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live score preview */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Calculated score
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                Auto-computed from likelihood × impact
              </p>
            </div>
            <div className="col-span-2">
              <div
                className={cn(
                  "inline-flex items-center gap-4 border px-4 py-3",
                  level.bg,
                  level.border,
                )}
              >
                <div>
                  <p
                    className={cn(
                      "text-3xl font-bold tabular-nums",
                      level.color,
                    )}
                  >
                    {score}
                  </p>
                  <p className={cn("text-xs font-medium", level.color)}>
                    {level.label} risk
                  </p>
                </div>
                <div className="text-xs text-gray-500 space-y-0.5">
                  <p>Likelihood: {LIKELIHOOD_LABELS[likelihood]}</p>
                  <p>Impact: {IMPACT_LABELS[impact]}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mitigation plan */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Mitigation plan
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                How will this risk be controlled or reduced?
              </p>
            </div>
            <div className="col-span-2">
              <Textarea
                placeholder="Describe the controls, actions, or strategies to mitigate this risk..."
                rows={3}
                {...register("mitigationPlan")}
              />
            </div>
          </div>

          {/* Owner + Review date */}
          <div className="grid grid-cols-3 gap-6 px-6 py-5">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Owner & review date
              </Label>
              <p className="mt-0.5 text-xs text-gray-400">
                Who owns this risk and when should it be reviewed?
              </p>
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Risk owner</Label>
                <Input
                  placeholder="e.g. Head of IT Security"
                  {...register("owner")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">Review date</Label>
                <Input
                  type="date"
                  {...register("reviewDate")}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/risks")}
            className="border-gray-200 text-gray-600"
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
                Creating risk...
              </span>
            ) : (
              "Create risk"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
