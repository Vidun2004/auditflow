import { SkeletonTable } from "@/components/loading";

export default function FindingsLoading() {
  return <SkeletonTable rows={8} cols={8} />;
}
