import type {
  ModerationActionType,
  ReportStatus,
} from "@/routes/_authenticated/reports/-queries";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { XCircle } from "lucide-react";
import { MdCheckCircleOutline } from "react-icons/md";

const statusConfig: Record<ReportStatus, { label: string; className: string }> =
  {
    PENDING: {
      label: "Pending",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    UNDER_REVIEW: {
      label: "Under review",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    RESOLVED: {
      label: "Resolved",
      className: "bg-green-50 text-green-700 border-green-200",
    },
    DISMISSED: {
      label: "Dismissed",
      className: "bg-neutral-100 text-neutral-500 border-neutral-200",
    },
  };

export default function ReportStatusBadge({
  reportStatus,
}: {
  reportStatus: ReportStatus;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "pup-body-md-500 h-8 px-4",
        statusConfig[reportStatus].className,
      )}
    >
      {statusConfig[reportStatus].label}
    </Badge>
  );
}

const actionConfig: Record<
  ModerationActionType,
  { label: string; className: string }
> = {
  WARNING: {
    label: "Warning",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  TEMP_BAN: {
    label: "Temp ban",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  PERMANENT_BAN: {
    label: "Perm ban",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  CONTENT_REMOVED: {
    label: "Removed",
    className: "bg-neutral-100 text-neutral-500 border-neutral-200",
  },
};

export function ModerationActionBadge({
  type,
}: {
  type: ModerationActionType;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("pup-body-md-500 h-8 px-4", actionConfig[type].className)}
    >
      {actionConfig[type].label}
    </Badge>
  );
}

interface UserStatusBadgeProps {
  user: {
    suspendedTill: string | null;
    verifiedAt?: string | null;
  };
  className?: string;
}

export function fmt(date: string) {
  return new Date(date).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function UserStatusBadge({ user, className }: UserStatusBadgeProps) {
  const isSuspended =
    user.suspendedTill && new Date(user.suspendedTill) > new Date();
  const isPermanent =
    user.suspendedTill && new Date(user.suspendedTill).getFullYear() === 9999;
  const isUnverified = user.verifiedAt === null;

  if (isSuspended) {
    return (
      <div
        className={cn(
          className,
          "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
          isPermanent
            ? "bg-red-50 text-red-600 border-red-200"
            : "bg-orange-50 text-orange-600 border-orange-200",
        )}
      >
        <XCircle size={13} />
        {isPermanent
          ? "Permanently banned"
          : `Suspended until ${fmt(user.suspendedTill!)}`}
      </div>
    );
  }

  if (isUnverified) {
    return (
      <div
        className={cn(
          className,
          "flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-600",
        )}
      >
        <MdCheckCircleOutline size={13} className="rotate-180" />
        Unverified
      </div>
    );
  }

  return (
    <div
      className={cn(
        className,
        "flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600",
      )}
    >
      <MdCheckCircleOutline size={13} />
      Active
    </div>
  );
}
