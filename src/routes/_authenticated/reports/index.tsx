import { createFileRoute } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MdOutlineSearch } from "react-icons/md";
import {
  type ReportStatus,
  type ReportCategory,
  type ModerationActionType,
  useUpdateStatus,
  useTakeAction,
  useGetReports,
  type Report,
} from "./-queries";
import { ProfileAvatar } from "@/components/PreviewImage";
import { PrimaryButton } from "@/components/Button/primary-filled";
import { OutlineButton } from "@/components/Button/outline";
import { DatePicker } from "@/components/DatePicker";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/reports/")({
  component: RouteComponent,
});

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

const categoryLabels: Record<ReportCategory, string> = {
  SPAM: "Spam",
  HARASSMENT: "Harassment",
  INAPPROPRIATE_CONTENT: "Inappropriate content",
  FAKE_PROFILE: "Fake profile",
  OTHER: "Other",
};

// ── Report detail modal ───────────────────────────────────────────────────────

function ReportDetailModal({
  report,
  open,
  onOpenChange,
}: {
  report: Report;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [actionType, setActionType] = useState<ModerationActionType>("WARNING");
  const [note, setNote] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const statusMutation = useUpdateStatus(report.id);
  const actionMutation = useTakeAction(report.id);

  const handleAction = () => {
    actionMutation.mutate(
      {
        actionType,
        note: note.trim() || undefined,
        expiresAt: actionType === "TEMP_BAN" ? expiresAt : undefined,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  const isBanned =
    report.reportedUser.suspendedTill &&
    new Date(report.reportedUser.suspendedTill) > new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="mb-2">
          <h3 className="pup-heading-three">Report details</h3>
          <p className="pup-body-sm-400 text-neutral-dark-grey">
            {formatDistanceToNow(new Date(report.createdAt), {
              addSuffix: true,
            })}
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-4">
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
                <div className="min-w-0">
                  <p className="pup-body-sm-500 text-neutral-black truncate">
                    {report.reportedUser.name}
                  </p>
                  {isBanned && (
                    <p className="text-xs text-red-500">Suspended</p>
                  )}
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
                    className="flex items-start justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2"
                  >
                    <div>
                      <p className="pup-body-sm-500 text-neutral-black capitalize">
                        {action.actionType.replace("_", " ").toLowerCase()}
                      </p>
                      {action.note && (
                        <p className="text-xs text-neutral-dark-grey mt-0.5">
                          {action.note}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 shrink-0 ml-2">
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
              <p className="pup-body-sm-500 text-neutral-black">Take action</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 mb-1 block">
                    Action
                  </label>
                  <Select
                    value={actionType}
                    onValueChange={(v) =>
                      setActionType(v as ModerationActionType)
                    }
                  >
                    <SelectTrigger className="rounded-xl border-neutral-200 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WARNING">Warning</SelectItem>
                      <SelectItem value="TEMP_BAN">Temp ban</SelectItem>
                      <SelectItem value="PERMANENT_BAN">
                        Permanent ban
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {actionType === "TEMP_BAN" && (
                  <div>
                    <label className="text-xs text-neutral-400 mb-1 block">
                      Expires at
                    </label>
                    <DatePicker setDate={setExpiresAt} />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block">
                  Note (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Internal note about this action..."
                  rows={2}
                  className="w-full resize-none rounded-xl border-2 border-neutral-200 px-3 py-2 text-sm text-neutral-black placeholder:text-neutral-300 outline-none transition focus:border-primary-orange"
                />
              </div>

              <div className="flex gap-2">
                <PrimaryButton
                  onClick={handleAction}
                  title="Submit Action"
                  isLoading={actionMutation.isPending}
                  className="flex-1 h-10 rounded-xl text-white pup-body-sm-500"
                />
                <OutlineButton
                  title="Dismiss"
                  onClick={() =>
                    statusMutation.mutate("DISMISSED", {
                      onSuccess: () => onOpenChange(false),
                    })
                  }
                  isLoading={statusMutation.isPending}
                  className="h-10 px-4 rounded-xl border-2 pup-body-sm-500 border-neutral-dark-grey text-neutral-dark-grey"
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function RouteComponent() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const { data, isLoading } = useGetReports({
    status: statusFilter === "all" ? undefined : statusFilter,
    category: categoryFilter === "all" ? undefined : categoryFilter,
    page,
  });

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="pup-heading-three text-neutral-black">Reports</h1>
            <p className="pup-body-sm-400 text-neutral-dark-grey">
              {data?.total ?? 0} total reports
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 rounded-xl border-neutral-200 h-9 pup-body-sm-400">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under review</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="DISMISSED">Dismissed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44 rounded-xl border-neutral-200 h-9 pup-body-sm-400">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="SPAM">Spam</SelectItem>
              <SelectItem value="HARASSMENT">Harassment</SelectItem>
              <SelectItem value="INAPPROPRIATE_CONTENT">
                Inappropriate content
              </SelectItem>
              <SelectItem value="FAKE_PROFILE">Fake profile</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-neutral-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50 hover:bg-neutral-50">
              <TableHead className="pup-body-sm-500 text-neutral-dark-grey">
                Reported user
              </TableHead>
              <TableHead className="pup-body-sm-500 text-neutral-dark-grey">
                Reported by
              </TableHead>
              <TableHead className="pup-body-sm-500 text-neutral-dark-grey">
                Category
              </TableHead>
              <TableHead className="pup-body-sm-500 text-neutral-dark-grey">
                Status
              </TableHead>
              <TableHead className="pup-body-sm-500 text-neutral-dark-grey">
                Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-24 animate-pulse rounded bg-neutral-100" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center py-12 text-center gap-2">
                    <MdOutlineSearch className="size-8 text-neutral-300" />
                    <p className="pup-body-sm-400 text-neutral-dark-grey">
                      No reports found
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.reports.map((report) => (
                <TableRow
                  key={report.id}
                  className="cursor-pointer hover:bg-neutral-50"
                  onClick={() => setSelectedReport(report)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ProfileAvatar
                        alt={report.reportedUser.name}
                        src={report.reportedUser.profilePicture}
                      />
                      <div>
                        <p className="pup-body-sm-500 text-neutral-black">
                          {report.reportedUser.name}
                        </p>
                        {report.reportedUser.suspendedTill &&
                          new Date(report.reportedUser.suspendedTill) >
                            new Date() && (
                            <p className="text-xs text-red-500">Suspended</p>
                          )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ProfileAvatar
                        alt={report.reporter.name}
                        src={report.reporter.profilePicture}
                      />
                      <span className="pup-body-sm-400 text-neutral-dark-grey">
                        {report.reporter.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                      {categoryLabels[report.category]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-md",
                        statusConfig[report.status].className,
                      )}
                    >
                      {statusConfig[report.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="pup-body-sm-400 text-neutral-dark-grey">
                    {formatDistanceToNow(new Date(report.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="pup-body-sm-400 text-neutral-dark-grey">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-dark-grey transition hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-dark-grey transition hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          open={!!selectedReport}
          onOpenChange={(v) => !v && setSelectedReport(null)}
        />
      )}
    </div>
  );
}
