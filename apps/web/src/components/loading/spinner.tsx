import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-3 w-3 border",
  md: "h-5 w-5 border-2",
  lg: "h-8 w-8 border-2",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin border-gray-300 border-t-gray-900",
        sizes[size],
        className,
      )}
      style={{ borderRadius: "9999px" }} // spinner is the ONE circle exception
      role="status"
      aria-label="Loading"
    />
  );
}
