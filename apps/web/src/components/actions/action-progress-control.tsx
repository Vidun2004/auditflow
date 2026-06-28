"use client";

import { useState, useCallback } from "react";
import { updateActionProgressAction } from "@/server/actions/action.actions";
import { cn } from "@/lib/utils";

interface Props {
  actionId: string;
  initialProgress: number;
  disabled?: boolean;
}

const QUICK_VALUES = [0, 25, 50, 75, 100];

export function ActionProgressControl({
  actionId,
  initialProgress,
  disabled,
}: Props) {
  const [progress, setProgress] = useState(initialProgress);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = useCallback(
    async (value: number) => {
      if (disabled) return;
      setSaving(true);
      setSaved(false);
      await updateActionProgressAction(actionId, value);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    [actionId, disabled],
  );

  function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    setProgress(Number(e.target.value));
  }

  function handleSliderCommit(e: React.MouseEvent | React.TouchEvent) {
    save(progress);
  }

  return (
    <div className="space-y-4">
      {/* Progress bar visual */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Completion</span>
          <div className="flex items-center gap-1.5">
            {saving && (
              <span className="text-xs text-gray-400 animate-pulse">
                Saving...
              </span>
            )}
            {saved && !saving && (
              <span className="text-xs text-green-600">Saved</span>
            )}
            <span className="text-2xl font-semibold text-gray-900 tabular-nums">
              {progress}%
            </span>
          </div>
        </div>
        <div className="h-2 bg-gray-100">
          <div
            className={cn(
              "h-2 transition-all duration-300",
              progress === 100 ? "bg-green-500" : "bg-gray-900",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Slider */}
      {!disabled && (
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={progress}
            onChange={handleSliderChange}
            onMouseUp={handleSliderCommit}
            onTouchEnd={handleSliderCommit}
            disabled={disabled}
            className="w-full h-1.5 accent-gray-900 cursor-pointer"
          />

          {/* Quick set buttons */}
          <div className="flex gap-1.5">
            {QUICK_VALUES.map((v) => (
              <button
                key={v}
                onClick={() => {
                  setProgress(v);
                  save(v);
                }}
                disabled={disabled || saving}
                className={cn(
                  "flex-1 border py-1 text-xs font-medium transition-colors",
                  progress === v
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-300",
                )}
              >
                {v}%
              </button>
            ))}
          </div>
        </div>
      )}

      {disabled && (
        <p className="text-xs text-gray-400">
          {progress === 100
            ? "This action is complete."
            : "You don't have permission to update progress."}
        </p>
      )}
    </div>
  );
}
