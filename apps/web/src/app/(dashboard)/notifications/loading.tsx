import { SkeletonTable } from "@/components/loading";

export default function NotificationsLoading() {
  return <SkeletonTable rows={8} cols={3} />;
}
