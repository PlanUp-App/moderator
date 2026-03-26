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
import { useState } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { type ReportCategory, useGetReports } from "./-queries";
import { ProfileAvatar } from "@/components/PreviewImage";
import { formatDistanceToNow } from "date-fns";
import ReportStatusBadge from "@/components/Badge";

export const Route = createFileRoute("/_authenticated/reports/")({
  component: RouteComponent,
});

const categoryLabels: Record<ReportCategory, string> = {
  SPAM: "Spam",
  HARASSMENT: "Harassment",
  INAPPROPRIATE_CONTENT: "Inappropriate content",
  FAKE_PROFILE: "Fake profile",
  OTHER: "Other",
};

function RouteComponent() {
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
            <SelectTrigger className="w-44 min-h-12 cursor-pointer px-4 flex-1 pup-body-md-400 rounded-xl border-2 border-neutral-200 hover:border-neutral-300 hover:shadow-sm">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="pup-body-md-400 h-12 px-4 cursor-pointer"
              >
                All statuses
              </SelectItem>
              <SelectItem
                value="PENDING"
                className="pup-body-md-400 h-12 px-4 cursor-pointer"
              >
                Pending
              </SelectItem>
              <SelectItem
                value="UNDER_REVIEW"
                className="pup-body-md-400 h-12 px-4 cursor-pointer"
              >
                Under review
              </SelectItem>
              <SelectItem
                value="RESOLVED"
                className="pup-body-md-400 h-12 px-4 cursor-pointer"
              >
                Resolved
              </SelectItem>
              <SelectItem
                value="DISMISSED"
                className="pup-body-md-400 h-12 px-4 cursor-pointer"
              >
                Dismissed
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-56 min-h-12 cursor-pointer px-4 flex-1 pup-body-md-400 rounded-xl border-2 border-neutral-200 hover:border-neutral-300 hover:shadow-sm">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="pup-body-md-400 h-12 px-4 cursor-pointer"
              >
                All categories
              </SelectItem>
              <SelectItem
                value="SPAM"
                className="pup-body-md-400 h-12 px-4 cursor-pointer"
              >
                Spam
              </SelectItem>
              <SelectItem
                value="HARASSMENT"
                className="pup-body-md-400 h-12 px-4 cursor-pointer"
              >
                Harassment
              </SelectItem>
              <SelectItem
                value="INAPPROPRIATE_CONTENT"
                className="pup-body-md-400 h-12 px-4 cursor-pointer"
              >
                Inappropriate content
              </SelectItem>
              <SelectItem
                value="FAKE_PROFILE"
                className="pup-body-md-400 h-12 px-4 cursor-pointer"
              >
                Fake profile
              </SelectItem>
              <SelectItem
                value="OTHER"
                className="pup-body-md-400 h-12 px-4 cursor-pointer"
              >
                Other
              </SelectItem>
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
                      <div className="h-8 w-24 animate-pulse rounded bg-neutral-100" />
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
                  className="cursor-pointer hover:bg-neutral-50 py-4"
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
                        <p className="pup-body-md-500 text-neutral-dark-grey">
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
                      <span className="pup-body-md-500 text-neutral-dark-grey">
                        {report.reporter.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="rounded-full bg-neutral-100 px-4 py-1 pup-body-lg-500 text-neutral-dark-grey">
                      {categoryLabels[report.category]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ReportStatusBadge reportStatus={report.status} />
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
