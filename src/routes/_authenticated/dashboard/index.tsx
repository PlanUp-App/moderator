import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  useDashboardStats,
  useRecentReports,
  useRecentActions,
} from "./-queries";
import SectionCard from "@/components/SectionCard";
import { Users, Flag, ShieldAlert, Map, TrendingUp, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import ReportStatusBadge, {
  ModerationActionBadge,
} from "@/components/Badge";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentReports, isLoading: reportsLoading } = useRecentReports(5);
  const { data: recentActions, isLoading: actionsLoading } = useRecentActions(5);

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-neutral-500">PlanUp Moderator</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.users.total}
          subtitle={`${stats?.users.newThisMonth ?? 0} new this month`}
          icon={Users}
          loading={statsLoading}
        />
        <StatCard
          title="Active Reports"
          value={(stats?.reports.pending ?? 0) + (stats?.reports.underReview ?? 0)}
          subtitle={`${stats?.reports.newThisWeek ?? 0} new this week`}
          icon={Flag}
          loading={statsLoading}
          variant="warning"
        />
        <StatCard
          title="Moderation Actions"
          value={stats?.moderationActions.total}
          subtitle="Total actions taken"
          icon={ShieldAlert}
          loading={statsLoading}
        />
        <StatCard
          title="Total Plans"
          value={stats?.plans.total}
          subtitle={`${stats?.plans.activeLastMonth ?? 0} active recently`}
          icon={Map}
          loading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Reports */}
        <SectionCard title="Recent Reports" icon={Flag}>
          {reportsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Reported User</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReports?.map((report) => (
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
                    <TableCell className="pup-body-md-500 text-neutral-dark-grey">{report.reporter.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="pup-body-md-500 text-neutral-dark-grey">
                          {report.reportedUser.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize text-sm text-neutral-600">
                        {report.category.toLowerCase().replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ReportStatusBadge reportStatus={report.status} />
                    </TableCell>
                  </TableRow>
                ))}
                {recentReports?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-neutral-400">
                      No recent reports
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </SectionCard>

        {/* Recent Actions */}
        <SectionCard title="Recent Actions" icon={Clock}>
          {actionsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Moderator</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActions?.map((action) => (
                  <TableRow
                    key={action.id}
                    className={cn(
                      action.report ? "cursor-pointer hover:bg-neutral-50" : "",
                    )}
                    onClick={() => {
                      if (action.report) {
                        navigate({
                          to: "/reports/$reportId",
                          params: { reportId: action.report.id },
                        });
                      }
                    }}
                  >
                    <TableCell>
                      <ModerationActionBadge type={action.actionType} />
                    </TableCell>
                    <TableCell className="pup-body-md-500 text-neutral-dark-grey">{action.report?.reportedUser.name ?? "N/A"}</TableCell>
                    <TableCell className="pup-body-md-500 text-neutral-dark-grey">{action.moderator.name}</TableCell>
                    <TableCell className="text-neutral-500">
                      {format(new Date(action.createdAt), "MMM d, HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
                {recentActions?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-neutral-400">
                      No recent actions
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  loading,
  variant = "default",
}: {
  title: string;
  value?: number;
  subtitle: string;
  icon: any;
  loading: boolean;
  variant?: "default" | "warning";
}) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "p-2 rounded-xl",
            variant === "warning"
              ? "bg-orange-50 text-orange-600"
              : "bg-blue-50 text-blue-600",
          )}
        >
          <Icon size={20} />
        </div>
        <TrendingUp size={16} className="text-neutral-300" />
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-neutral-500">{title}</p>
        {loading ? (
          <Skeleton className="h-8 w-20 mt-1" />
        ) : (
          <h2 className="text-3xl font-bold mt-1 text-neutral-black">
            {value?.toLocaleString()}
          </h2>
        )}
        <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}
