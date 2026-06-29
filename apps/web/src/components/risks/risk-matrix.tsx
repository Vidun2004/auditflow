"use client";

import { cn } from "@/lib/utils";
import type { RiskMatrixData } from "@/server/services/risk.service";
import {
  LIKELIHOOD_SCORE,
  IMPACT_SCORE,
  getRiskLevel,
} from "@/server/services/risk.service";
import type { RiskLikelihood, RiskImpact } from "@/types";

const LIKELIHOOD_KEYS: RiskLikelihood[] = [
  "ALMOST_CERTAIN",
  "LIKELY",
  "POSSIBLE",
  "UNLIKELY",
  "RARE",
];

const IMPACT_KEYS: RiskImpact[] = [
  "INSIGNIFICANT",
  "MINOR",
  "MODERATE",
  "MAJOR",
  "CATASTROPHIC",
];

const LIKELIHOOD_SHORT: Record<RiskLikelihood, string> = {
  ALMOST_CERTAIN: "Almost Certain",
  LIKELY: "Likely",
  POSSIBLE: "Possible",
  UNLIKELY: "Unlikely",
  RARE: "Rare",
};

const IMPACT_SHORT: Record<RiskImpact, string> = {
  INSIGNIFICANT: "Insignificant",
  MINOR: "Minor",
  MODERATE: "Moderate",
  MAJOR: "Major",
  CATASTROPHIC: "Catastrophic",
};

function getCellColor(score: number): string {
  if (score >= 15) return "bg-red-100 border-red-200";
  if (score >= 10) return "bg-orange-100 border-orange-200";
  if (score >= 5) return "bg-amber-100 border-amber-200";
  return "bg-green-100 border-green-200";
}

interface Props {
  data: RiskMatrixData;
}

export function RiskMatrix({ data }: Props) {
  // Build lookup: likelihood+impact → risks
  const cellMap = new Map<string, typeof data>();
  for (const risk of data) {
    const key = `${risk.likelihood}_${risk.impact}`;
    if (!cellMap.has(key)) cellMap.set(key, []);
    cellMap.get(key)!.push(risk);
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          {/* Impact header (columns) */}
          <thead>
            <tr>
              <th className="w-32 border border-gray-200 bg-gray-50 p-2 text-left text-xs font-medium text-gray-500">
                Likelihood ↓ / Impact →
              </th>
              {IMPACT_KEYS.map((impact) => (
                <th
                  key={impact}
                  className="border border-gray-200 bg-gray-50 p-2 text-center text-xs font-medium text-gray-600"
                >
                  {IMPACT_SHORT[impact]}
                  <span className="block text-gray-400 font-normal">
                    ×{IMPACT_SCORE[impact]}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {LIKELIHOOD_KEYS.map((likelihood) => (
              <tr key={likelihood}>
                {/* Row header */}
                <td className="border border-gray-200 bg-gray-50 p-2 font-medium text-gray-600">
                  {LIKELIHOOD_SHORT[likelihood]}
                  <span className="block text-gray-400 font-normal">
                    ×{LIKELIHOOD_SCORE[likelihood]}
                  </span>
                </td>

                {IMPACT_KEYS.map((impact) => {
                  const score =
                    LIKELIHOOD_SCORE[likelihood] * IMPACT_SCORE[impact];
                  const key = `${likelihood}_${impact}`;
                  const cellRisks = cellMap.get(key) ?? [];

                  return (
                    <td
                      key={impact}
                      className={cn(
                        "border border-gray-200 p-1.5 align-top min-w-24",
                        getCellColor(score),
                      )}
                    >
                      {/* Score */}
                      <div className="text-xs font-semibold text-gray-500 mb-1">
                        {score}
                      </div>

                      {/* Risks in this cell */}
                      {cellRisks.map((risk) => (
                        <a
                          key={risk.id}
                          href={`/risks/${risk.id}`}
                          className="block mb-1 border border-white bg-white px-1.5 py-1 text-xs text-gray-700 hover:bg-gray-50 transition-colors truncate shadow-sm"
                          title={risk.name}
                        >
                          {risk.name.length > 20
                            ? `${risk.name.slice(0, 20)}…`
                            : risk.name}
                        </a>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {[
          {
            label: "Low (1–4)",
            bg: "bg-green-100",
            border: "border-green-200",
          },
          {
            label: "Medium (5–9)",
            bg: "bg-amber-100",
            border: "border-amber-200",
          },
          {
            label: "High (10–14)",
            bg: "bg-orange-100",
            border: "border-orange-200",
          },
          {
            label: "Critical (15–25)",
            bg: "bg-red-100",
            border: "border-red-200",
          },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={cn("h-3 w-5 border", item.bg, item.border)} />
            <span className="text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
