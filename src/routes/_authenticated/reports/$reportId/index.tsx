import { createFileRoute, Link } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

import {
  type ModerationActionType,
  useUpdateStatus,
  useTakeAction,
  useGetReportById,
  type ReportStatus,
} from "@/routes/_authenticated/reports/-queries";

import { ProfileAvatar } from "@/components/PreviewImage";
import { PrimaryButton } from "@/components/Button/primary-filled";
import { OutlineButton } from "@/components/Button/outline";
import { DatePicker } from "@/components/DatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MdChevronLeft } from "react-icons/md";
import SectionCard from "@/components/SectionCard";
import ReportStatusBadge, { UserStatusBadge } from "@/components/Badge";

export const Route = createFileRoute("/_authenticated/reports/$reportId/")({
  component: ReportDetailPage,
});

const categoryLabels = {
  SPAM: "Spam",
  HARASSMENT: "Harassment",
  INAPPROPRIATE_CONTENT: "Inappropriate content",
  FAKE_PROFILE: "Fake profile",
  OTHER: "Other",
};

const actionLabels = {
  WARNING: "Warning",
  TEMP_BAN: "Temporary ban",
  PERMANENT_BAN: "Permanent ban",
};

function ReportDetailPage() {
  const { reportId } = useParams({ from: Route.id });

  const { data: report, isLoading } = useGetReportById(reportId);

  const statusMutation = useUpdateStatus(reportId);
  const actionMutation = useTakeAction(reportId);

  const [actionType, setActionType] = useState<ModerationActionType>("WARNING");
  const [note, setNote] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  if (isLoading) return <div className="p-8">Loading report...</div>;
  if (!report) return <div className="p-8">Report not found</div>;

  const handleAction = () => {
    actionMutation.mutate({
      actionType,
      note: note.trim() || undefined,
      expiresAt: actionType === "TEMP_BAN" ? expiresAt : undefined,
    });
  };

  const handleStatusChange = (newStatus: ReportStatus) => {
    statusMutation.mutate(newStatus);
  };

  return (
    <div className="p-8 flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <Link
        to="/users"
        className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-black transition-colors w-fit"
      >
        <MdChevronLeft size={16} />
        Back to users
      </Link>
      <div className="flex items-center gap-1">
        <div>
          <h1 className="pup-heading-three text-neutral-black">
            Report #{reportId}
          </h1>
          <p className="pup-body-sm-400 text-neutral-dark-grey">
            {formatDistanceToNow(new Date(report.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>

      {/* Category + status */}
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-neutral-100 px-4 py-1 pup-body-lg-500 text-neutral-dark-grey">
          {categoryLabels[report.category]}
        </span>
        <ReportStatusBadge reportStatus={report.status} />
      </div>

      {/* Users */}
      <div className="grid grid-cols-2 gap-3">
        <SectionCard title="Reported User">
          <Link to={`/users/${report.reportedUser.id}`}>
            <div className="flex items-center gap-2">
              <ProfileAvatar
                alt={report.reportedUser.name}
                src={report.reportedUser.profilePicture}
              />
              <p className="pup-body-sm-500 text-neutral-black">
                {report.reportedUser.name}
              </p>
              <UserStatusBadge
                user={{
                  suspendedTill: report.reportedUser.suspendedTill || null,
                }}
              />
            </div>
          </Link>
        </SectionCard>
        <SectionCard title="Reported By">
          <Link to={`/users/${report.reporter.id}`}>
            <div className="flex items-center gap-2">
              <ProfileAvatar
                alt={report.reporter.name}
                src={report.reporter.profilePicture}
              />
              <span className="pup-body-sm-500 text-neutral-black truncate">
                {report.reporter.name}
              </span>
              <UserStatusBadge
                user={{
                  suspendedTill: report.reporter.suspendedTill || null,
                }}
              />
            </div>
          </Link>
        </SectionCard>
      </div>

      {/* Description */}
      {report.description && (
        <SectionCard title="Description" className="w-[50%]">
          <p className="pup-body-md-400 text-neutral-black">
            {report.description}
          </p>
        </SectionCard>
      )}

      {/* Past actions */}
      {report.actions.length > 0 && (
        <div className="w-[50%]">
          <p className="pup-body-sm-400 text-neutral-dark-grey mb-3">
            Moderator Action
          </p>
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
                    <p className="mt-4 pup-body-sm-400 text-neutral-black">
                      {action.note}
                    </p>
                  )}
                </div>
                <p className="pup-body-sm-400 text-neutral-dark-grey">
                  {`${formatDistanceToNow(new Date(action.createdAt), {
                    addSuffix: true,
                  })} by ${action.moderator?.name || "System"}`}
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
        <div className="flex flex-col gap-4 w-[50%]">
          <p className="pup-body-lg-500 text-neutral-black">Take action</p>

          {report.status === "PENDING" ? (
            <div>
              <PrimaryButton
                onClick={() => handleStatusChange("UNDER_REVIEW")}
                title="Start Review"
                isLoading={statusMutation.isPending}
              />
            </div>
          ) : (
            <>
              <div className="flex gap-3">
                <Select
                  value={actionType}
                  onValueChange={(v) =>
                    setActionType(v as ModerationActionType)
                  }
                >
                  <SelectTrigger className=" flex-1 pup-body-md-400 min-h-12 cursor-pointer w-full px-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="WARNING"
                      className="pup-body-md-400 h-12 px-4 cursor-pointer"
                    >
                      {actionLabels.WARNING}
                    </SelectItem>
                    <SelectItem
                      value="TEMP_BAN"
                      className="pup-body-md-400 h-12 px-4 cursor-pointer"
                    >
                      {actionLabels.TEMP_BAN}
                    </SelectItem>
                    <SelectItem
                      value="PERMANENT_BAN"
                      className="pup-body-md-400 h-12 px-4 cursor-pointer"
                    >
                      {actionLabels.PERMANENT_BAN}
                    </SelectItem>
                  </SelectContent>
                </Select>

                {actionType === "TEMP_BAN" && (
                  <>
                    <div className="shrink py-2">until</div>
                    <DatePicker setDate={setExpiresAt} className="flex-1" />
                  </>
                )}
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note to be sent in user's email"
                className="w-full rounded-xl border-2 border-neutral-200 px-3 py-2"
              />
              <div className="flex gap-2">
                <PrimaryButton
                  onClick={handleAction}
                  title="Submit Action"
                  isLoading={actionMutation.isPending}
                  className="w-fit"
                />

                <OutlineButton
                  title="Dismiss"
                  onClick={() => handleStatusChange("DISMISSED")}
                  className="border border-primary-orange text-primary-orange"
                  isLoading={statusMutation.isPending}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
