import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

import {
  type ModerationActionType,
  useUpdateStatus,
  useTakeAction,
  useGetReportById,
} from "@/routes/_authenticated/reports/-queries";

import { ProfileAvatar } from "@/components/PreviewImage";
import { PrimaryButton } from "@/components/Button/primary-filled";
import { OutlineButton } from "@/components/Button/outline";
import { DatePicker } from "@/components/DatePicker";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/reports/$reportId/")({
  component: ReportDetailPage,
});

const statusConfig = {
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

const categoryLabels = {
  SPAM: "Spam",
  HARASSMENT: "Harassment",
  INAPPROPRIATE_CONTENT: "Inappropriate content",
  FAKE_PROFILE: "Fake profile",
  OTHER: "Other",
};

function ReportDetailPage() {
  const navigate = useNavigate();
  const { reportId } = useParams({ from: Route.id });

  const { data: report, isLoading } = useGetReportById(reportId);

  const statusMutation = useUpdateStatus(reportId);
  const actionMutation = useTakeAction(reportId);

  const [actionType, setActionType] = useState<ModerationActionType>("WARNING");
  const [note, setNote] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!report) return <div className="p-8">Report not found</div>;

  const isBanned =
    report.reportedUser.suspendedTill &&
    new Date(report.reportedUser.suspendedTill) > new Date();

  const handleAction = () => {
    actionMutation.mutate({
      actionType,
      note: note.trim() || undefined,
      expiresAt: actionType === "TEMP_BAN" ? expiresAt : undefined,
    });
  };

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <OutlineButton
          onClick={() => navigate({ to: "/reports" })}
          className=" text-neutral-dark-grey"
          title="<"
        />
        <div>
          <h1 className="pup-heading-three text-neutral-black">
            Report details
          </h1>
          <p className="pup-body-sm-400 text-neutral-dark-grey">
            {formatDistanceToNow(new Date(report.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>

      {/* Users */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
          <p className="text-xs text-neutral-400 mb-2">Reported by</p>
          <div className="flex items-center gap-2">
            <ProfileAvatar
              alt={report.reporter.name}
              src={report.reporter.profilePicture}
            />
            <span className="pup-body-sm-500 text-neutral-black truncate">
              {report.reporter.name}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
          <p className="text-xs text-neutral-400 mb-2">Reported user</p>
          <div className="flex items-center gap-2">
            <ProfileAvatar
              alt={report.reportedUser.name}
              src={report.reportedUser.profilePicture}
            />
            <div>
              <p className="pup-body-sm-500 text-neutral-black">
                {report.reportedUser.name}
              </p>
              {isBanned && <p className="text-xs text-red-500">Suspended</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Category + status */}
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-md font-medium text-neutral-600">
          {categoryLabels[report.category]}
        </span>
        <Badge
          variant="outline"
          className={cn("text-md", statusConfig[report.status].className)}
        >
          {statusConfig[report.status].label}
        </Badge>
      </div>

      {/* Description */}
      {report.description && (
        <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
          <p className="text-xs text-neutral-400 mb-1">Description</p>
          <p className="pup-body-sm-400 text-neutral-black">
            {report.description}
          </p>
        </div>
      )}

      {/* Past actions */}
      {report.actions.length > 0 && (
        <div>
          <p className="text-xs text-neutral-400 mb-2">Past actions</p>
          <div className="flex flex-col gap-2">
            {report.actions.map((action) => (
              <div
                key={action.id}
                className="flex justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2"
              >
                <div>
                  <p className="pup-body-sm-500 capitalize">
                    {action.actionType.replace("_", " ").toLowerCase()}
                  </p>
                  {action.note && (
                    <p className="text-xs text-neutral-dark-grey">
                      {action.note}
                    </p>
                  )}
                </div>
                <p className="text-xs text-neutral-400">
                  {formatDistanceToNow(new Date(action.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-neutral-100" />

      {/* Take action */}
      {report.status !== "RESOLVED" && report.status !== "DISMISSED" && (
        <div className="flex flex-col gap-3">
          <p className="pup-body-sm-500">Take action</p>

          <div className="grid grid-cols-2 gap-3">
            <Select
              value={actionType}
              onValueChange={(v) => setActionType(v as ModerationActionType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WARNING">Warning</SelectItem>
                <SelectItem value="TEMP_BAN">Temp ban</SelectItem>
                <SelectItem value="PERMANENT_BAN">Permanent ban</SelectItem>
              </SelectContent>
            </Select>

            {actionType === "TEMP_BAN" && <DatePicker setDate={setExpiresAt} />}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Internal note..."
            className="w-full rounded-xl border-2 border-neutral-200 px-3 py-2"
          />

          <div className="flex gap-2">
            <PrimaryButton
              onClick={handleAction}
              title="Submit Action"
              isLoading={actionMutation.isPending}
              className="flex-1"
            />

            <OutlineButton
              title="Dismiss"
              onClick={() => statusMutation.mutate("DISMISSED")}
              isLoading={statusMutation.isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
}
