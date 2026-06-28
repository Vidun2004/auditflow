import { SkeletonTable } from "@/components/loading";

export default function AuditsLoading() {
  return <SkeletonTable rows={8} cols={7} />;
}
