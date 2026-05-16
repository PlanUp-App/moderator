import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  MdCalendarToday,
  MdChevronLeft,
  MdLockOutline,
  MdOutlineAccessTime,
  MdOutlineLanguage,
  MdPeopleOutline,
  MdRemoveCircleOutline,
} from "react-icons/md";
import { useGetPlanById, useSoftDeletePlan } from "../-queries";
import { ProfileAvatar } from "@/components/PreviewImage";
import SectionCard from "@/components/SectionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { RichTextParser } from "@/components/RichTextParser";

export const Route = createFileRoute("/_authenticated/plans/$planId/")({
  component: RouteComponent,
});

export function fmt(date: string) {
  return new Date(date).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function RouteComponent() {
  const { planId } = useParams({ from: "/_authenticated/plans/$planId/" });
  const { data: plan, isLoading } = useGetPlanById(planId);
  const softDeleteMutation = useSoftDeletePlan(planId);

  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [note, setNote] = useState("");

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-primary-orange" />
      </div>
    );
  }

  if (!plan) return null;

  const isRemoved = plan.deletedAt !== null;

  const handleRemove = async () => {
    try {
      await softDeleteMutation.mutateAsync({ note: note.trim() || undefined });
      setIsRemoveOpen(false);
      setNote("");
    } catch {}
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col gap-6">
        {/* Back link */}
        <Link
          to="/plans"
          className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-black transition-colors w-fit"
        >
          <MdChevronLeft size={16} />
          Back to plans
        </Link>

        {/* Plan Header Card */}
        <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
          {/* Cover Image */}
          <div
            className="h-60 w-full bg-neutral-100"
            style={
              plan.coverImage
                ? {
                    backgroundImage: `url(${plan.coverImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {
                    backgroundImage: `url('https://res.cloudinary.com/dxu7hcg4g/image/upload/v1764864772/Placeholder_Plan_pohwic.png')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
            }
          />

          <div className="px-6 pb-6 pt-4 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="pup-heading-three text-neutral-black">
                    {plan.name}
                  </h1>
                  <div className="flex items-center gap-1.5">
                    {isRemoved ? (
                      <Badge
                        variant="outline"
                        className="bg-neutral-100 text-neutral-500 border-neutral-200 font-medium px-2.5 py-0.5"
                      >
                        Removed
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 font-medium px-2.5 py-0.5"
                      >
                        Active
                      </Badge>
                    )}
                    {!isRemoved && plan.isFlagged && (
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200 font-medium px-2.5 py-0.5"
                      >
                        Flagged
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    {plan.visibility === "PUBLIC" ? (
                      <>
                        <MdOutlineLanguage size={14} />
                        Public Plan
                      </>
                    ) : (
                      <>
                        <MdLockOutline size={14} />
                        Private Plan
                      </>
                    )}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MdCalendarToday size={13} />
                    Created {format(new Date(plan.createdAt), "MMM dd, yyyy")}
                  </span>
                </div>
              </div>

              {!isRemoved && (
                <Button
                  onClick={() => setIsRemoveOpen(true)}
                  variant="destructive"
                  className="rounded-xl flex gap-1.5 items-center px-4 py-2 cursor-pointer transition-all hover:opacity-90 font-medium shadow-sm bg-red-600 hover:bg-red-700 text-white border-0"
                >
                  <MdRemoveCircleOutline size={16} />
                  Remove Plan
                </Button>
              )}
            </div>

            {plan.description && (
              <div className="text-sm text-neutral-500 max-w-2xl leading-relaxed">
                <RichTextParser html={plan.description} />
              </div>
            )}

            {plan.isFlagged && !isRemoved && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-amber-800">
                  Flagged for Suspicious Keywords
                </span>
                <span className="text-xs text-amber-700">
                  This plan matches flagged keywords:{" "}
                  <strong className="underline">
                    {plan.flaggedKeywords.join(", ")}
                  </strong>
                  . Please review the plan details and members list below before
                  taking actions.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Members List (Left column - 2 cols span) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <SectionCard
              title={`Members (${plan.members.length})`}
              icon={MdPeopleOutline}
            >
              {plan.members.length === 0 ? (
                <p className="text-sm text-neutral-300 py-2">
                  No members in this plan
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {plan.members.map((member) => (
                    <Link
                      to={`/users/${member.user.id}`}
                      key={member.user.id}
                      className="flex items-center justify-between gap-3 border-b border-neutral-50 pb-3 last:border-b-0 last:pb-0 hover:bg-neutral-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ProfileAvatar
                          src={member.user.profilePicture}
                          alt={member.user.name}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-medium text-neutral-black">
                            {member.user.name}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {member.user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                          {member.role}
                        </span>
                        <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                          <MdOutlineAccessTime size={10} />
                          Joined{" "}
                          {format(new Date(member.joinedAt), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          {/* Moderation History (Right column - 1 col span) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <SectionCard title="Moderation History">
              {plan.moderationActions.length === 0 ? (
                <p className="text-sm text-neutral-300 py-2">
                  No moderation history recorded
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {plan.moderationActions.map((action) => (
                    <div
                      key={action.id}
                      className="rounded-xl border border-neutral-100 p-4 flex flex-col gap-2 bg-neutral-50/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                          {action.actionType.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {format(new Date(action.createdAt), "MMM dd, yyyy")}
                        </span>
                      </div>
                      {action.note && (
                        <p className="text-xs text-neutral-600 leading-normal font-medium mt-1">
                          {action.note}
                        </p>
                      )}
                      <div className="text-[10px] text-neutral-400 flex justify-between items-center mt-1 border-t border-neutral-100 pt-1.5">
                        <span>
                          Moderator: {action.moderator?.name ?? "System"}
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

      {/* Remove Plan Dialog */}
      <Dialog open={isRemoveOpen} onOpenChange={setIsRemoveOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-white border border-neutral-100 shadow-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-neutral-black">
              Remove Public Plan
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-400 leading-relaxed">
              This action will soft delete the public plan{" "}
              <strong>{plan.name}</strong> by setting its deletedAt timestamp
              and logging a CONTENT_REMOVED moderation action.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 my-4">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
              Reason / Note for removal
            </label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Suspicious keywords, spam contents, illegal activity..."
              className="rounded-xl border-neutral-200 focus:border-red-500 focus:ring-red-500 min-h-11 px-3"
            />
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              onClick={() => {
                setIsRemoveOpen(false);
                setNote("");
              }}
              variant="outline"
              className="rounded-xl border-neutral-200 px-4 py-2 hover:bg-neutral-50 font-medium text-neutral-600 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRemove}
              disabled={softDeleteMutation.isPending}
              variant="destructive"
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white border-0 font-medium px-4 py-2 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {softDeleteMutation.isPending ? "Removing..." : "Confirm Removal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
