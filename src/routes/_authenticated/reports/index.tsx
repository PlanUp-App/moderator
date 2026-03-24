import { createFileRoute, useNavigate } from "@tanstack/react-router";
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

export default function RouteComponent() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

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
                  onClick={() =>
                    navigate({
                      to: "/reports/$reportId",
                      params: { reportId: report.id },
                    })
                  }
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
    </div>
  );
}
