import { SkeletonTable } from "@/components/loading";

export default function ComplianceLoading() {
  return <SkeletonTable rows={4} cols={3} />;
}
