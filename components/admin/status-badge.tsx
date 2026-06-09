import { Badge } from "@/components/ui/badge";
import type { IncidentStatus } from "@/types/domain";

type StatusBadgeVariant = "outline" | "secondary" | "warning" | "success" | "neutral";

const statusMap: Record<IncidentStatus, { label: string; variant: StatusBadgeVariant }> = {
  open: { label: "פתוח", variant: "outline" },
  acknowledged: { label: "התקבל", variant: "secondary" },
  in_progress: { label: "בטיפול", variant: "warning" },
  resolved: { label: "נסגר", variant: "success" },
  dismissed: { label: "נדחה", variant: "neutral" },
};

export function StatusBadge({ status }: { status: IncidentStatus }) {
  const config = statusMap[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
