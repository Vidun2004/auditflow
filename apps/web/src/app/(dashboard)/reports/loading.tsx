import { SkeletonCard } from "@/components/loading";

export default function ReportsLoading() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
