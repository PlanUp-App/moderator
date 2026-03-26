import { createFileRoute } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useGetUserById } from "../-queries";
import { ProfileAvatar } from "@/components/PreviewImage";
import type {
  ModerationActionType,
  ReportCategory,
} from "../../reports/-queries";
import {
  MdCalendarToday,
  MdChevronLeft,
  MdLockOutline,
  MdMailOutline,
  MdOutlineAccessTime,
  MdOutlineLanguage,
  MdVerified,
} from "react-icons/md";
import SectionCard from "@/components/SectionCard";
import ReportStatusBadge, { fmt, UserStatusBadge } from "@/components/Badge";

export const Route = createFileRoute("/_authenticated/users/$userId/")({
  component: RouteComponent,
});

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl border border-neutral-100 bg-white px-5 py-4 shadow-sm">
      <span className="text-2xl font-bold text-neutral-black">{value}</span>
      <span className="text-xs text-neutral-400">{label}</span>
    </div>
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
    label: "Permanent ban",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  CONTENT_REMOVED: {
    label: "Content removed",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
};

const categoryLabels: Record<ReportCategory, string> = {
  SPAM: "Spam",
  HARASSMENT: "Harassment",
  INAPPROPRIATE_CONTENT: "Inappropriate content",
  FAKE_PROFILE: "Fake profile",
  OTHER: "Other",
};

function RouteComponent() {
  const { userId } = useParams({ from: "/_authenticated/users/$userId/" });

  const { data: user, isLoading } = useGetUserById(userId);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-primary-orange" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col gap-6">
        {/* Back */}
        <Link
          to="/users"
          className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-black transition-colors w-fit"
        >
          <MdChevronLeft size={16} />
          Back to users
        </Link>

        {/* Profile header */}
        <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
          {/* Cover */}
          <div
            className="h-32 w-full bg-neutral-100"
            style={
              user.coverImage
                ? {
                    backgroundImage: `url(${user.coverImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {}
            }
          />

          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-8 mb-4">
              <ProfileAvatar
                src={user.profilePicture}
                alt={user.name}
                size="lg"
              />
            </div>

            <div className="flex gap-2">
              <h1 className="pup-heading-three text-neutral-black">
                {user.name}
              </h1>
              <UserStatusBadge
                user={{
                  suspendedTill: user.suspendedTill,
                }}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 text-sm text-neutral-400">
                <MdMailOutline size={13} />
                {user.email}
                {user.verifiedAt && (
                  <MdVerified size={12} className="text-dark-blue" />
                )}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-neutral-400">
                <MdCalendarToday size={13} />
                Joined {fmt(user.createdAt)}
              </span>
            </div>

            {user.bio && (
              <p className="mt-3 text-sm text-neutral-500 max-w-xl">
                {user.bio}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard
            label="Reports received"
            value={user._count.reportsReceived}
          />
          <StatCard label="Reports filed" value={user._count.reportsFiled} />
          <StatCard
            label="Plan memberships"
            value={user._count.planMemberships}
          />
          <StatCard label="Tasks created" value={user._count.createdTasks} />
          <StatCard label="Bills created" value={user._count.billsCreated} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Reports received */}
          <SectionCard
            title={`Reports received (${user._count.reportsReceived})`}
          >
            {user.reportsReceived.length === 0 ? (
              <p className="text-sm text-neutral-300 py-2">
                No reports received
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {user.reportsReceived.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-xl border border-neutral-100 p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ProfileAvatar
                          src={report.reporter.profilePicture}
                          alt={report.reporter.name}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-medium text-neutral-black">
                            {report.reporter.name}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {fmt(report.createdAt)}
                          </p>
                        </div>
                      </div>
                      <ReportStatusBadge reportStatus={report.status} />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600">
                        {categoryLabels[report.category]}
                      </span>
                    </div>

                    {report.description && (
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        {report.description}
                      </p>
                    )}

                    {/* Actions taken on this report */}
                    {report.actions.length > 0 && (
                      <div className="border-t border-neutral-50 pt-3 flex flex-col gap-2">
                        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                          Actions taken
                        </p>
                        {report.actions.map((action) => (
                          <div
                            key={action.id}
                            className="flex items-start gap-2"
                          >
                            <span
                              className={cn(
                                "text-xs font-medium rounded-full border px-2.5 py-1 shrink-0",
                                actionConfig[action.actionType].className,
                              )}
                            >
                              {actionConfig[action.actionType].label}
                            </span>
                            <div className="flex flex-col gap-0.5">
                              {action.note && (
                                <p className="text-xs text-neutral-500">
                                  {action.note}
                                </p>
                              )}
                              <p className="text-xs text-neutral-300">
                                {action.moderator?.name ?? "System"} ·{" "}
                                {fmt(action.createdAt)}
                                {action.expiresAt &&
                                  ` · until ${fmt(action.expiresAt)}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <div className="flex flex-col gap-6">
            {/* Reports filed */}
            <SectionCard title={`Reports filed (${user._count.reportsFiled})`}>
              {user.reportsFiled.length === 0 ? (
                <p className="text-sm text-neutral-300 py-2">
                  No reports filed
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {user.reportsFiled.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-neutral-100 p-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <ProfileAvatar
                          src={report.reportedUser.profilePicture}
                          alt={report.reportedUser.name}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-neutral-black truncate">
                            {report.reportedUser.name}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {categoryLabels[report.category]}
                          </p>
                        </div>
                      </div>
                      <ReportStatusBadge reportStatus={report.status} />
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Plan memberships */}
            <SectionCard title={`Plans (${user._count.planMemberships})`}>
              {user.planMemberships.length === 0 ? (
                <p className="text-sm text-neutral-300 py-2">
                  No plan memberships
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {user.planMemberships.map((membership, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 rounded-xl border border-neutral-100 p-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={
                            membership.plan.coverImage ||
                            "https://res.cloudinary.com/dxu7hcg4g/image/upload/v1764864772/Placeholder_Plan_pohwic.png"
                          }
                          alt={membership.plan.name}
                          className="h-8 w-8 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex gap-2">
                            <p className="text-sm font-medium text-neutral-black truncate">
                              {membership.plan.name}
                            </p>
                            {membership.plan.visibility === "PUBLIC" ? (
                              <MdOutlineLanguage className="text-neutral-dark-grey" />
                            ) : (
                              <MdLockOutline className="text-neutral-dark-grey" />
                            )}
                          </div>
                          <p className="text-xs text-neutral-400 flex items-center gap-1">
                            <MdOutlineAccessTime size={10} />
                            {fmt(membership.joinedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="pup-body-sm-400 text-neutral-dark-grey">
                          {membership.role.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
