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
import { format } from "date-fns";
import { useGetAllPlans } from "./-queries";
import { SearchInput } from "@/components/CustomInput/search-input";
import { Badge } from "@/components/ui/badge";
import { RichTextParser } from "@/components/RichTextParser";

export const Route = createFileRoute("/_authenticated/plans/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "active" | "removed" | "flagged" | "all"
  >("active");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetAllPlans({
    search: search || undefined,
    filter,
    page,
    limit: 20,
  });

  const totalPages = data ? Math.ceil(data.meta.total / data.meta.limit) : 1;

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="pup-heading-three text-neutral-black">Public Plans</h1>
          <p className="pup-body-sm-400 text-neutral-dark-grey">
            {data?.meta.total ?? 0} plans total
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex items-center gap-3">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search plans..."
          />

          <Select
            value={filter}
            onValueChange={(value) => {
              setFilter(value as "active" | "removed" | "flagged" | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44 min-h-12 cursor-pointer px-4 flex-1 pup-body-md-400 rounded-xl border border-neutral-light-grey hover:border-neutral-300 hover:shadow-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="pup-body-md-400 h-12 px-4 cursor-pointer"
              >
                All Plans
              </SelectItem>
              <SelectItem
                value="active"
                className="pup-body-md-400 h-12 px-4 cursor-pointer"
              >
                Active
              </SelectItem>
              <SelectItem
                value="flagged"
                className="pup-body-md-400 h-12 px-4 cursor-pointer"
              >
                Flagged
              </SelectItem>
              <SelectItem
                value="removed"
                className="pup-body-md-400 h-12 px-4 cursor-pointer"
              >
                Removed
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-neutral-100 overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50 hover:bg-neutral-50">
              <TableHead className="pup-body-sm-500 text-neutral-dark-grey px-6 h-12">
                Plan
              </TableHead>
              <TableHead className="pup-body-sm-500 text-neutral-dark-grey px-6 h-12">
                Status
              </TableHead>
              <TableHead className="pup-body-sm-500 text-neutral-dark-grey px-6 h-12">
                Members
              </TableHead>
              <TableHead className="pup-body-sm-500 text-neutral-dark-grey px-6 h-12">
                Date Created
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <TableCell key={j} className="px-6 py-4">
                      <div className="h-8 w-24 animate-pulse rounded bg-neutral-100" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24">
                  <div className="flex flex-col items-center py-12 text-center gap-2">
                    <MdOutlineSearch className="size-8 text-neutral-300" />
                    <p className="pup-body-sm-400 text-neutral-dark-grey">
                      No plans found
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((plan) => {
                const isDeleted = plan.deletedAt !== null;
                return (
                  <TableRow
                    key={plan.id}
                    className="cursor-pointer hover:bg-neutral-50"
                    onClick={() =>
                      navigate({
                        to: "/plans/$planId",
                        params: { planId: plan.id },
                      })
                    }
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            plan.coverImage ||
                            "https://res.cloudinary.com/dxu7hcg4g/image/upload/v1764864772/Placeholder_Plan_pohwic.png"
                          }
                          alt={plan.name}
                          className="h-10 w-10 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0 max-w-[280px] md:max-w-md lg:max-w-xl">
                          <p className="pup-body-md-500 text-neutral-black truncate">
                            {plan.name}
                          </p>
                          <p className="text-xs text-neutral-400 pup-body-sm-400 truncate">
                            <RichTextParser html={plan.description} />
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isDeleted ? (
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
                        {!isDeleted && plan.isFlagged && (
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 font-medium px-2.5 py-0.5 flex gap-1 items-center"
                          >
                            Flagged ({plan.flaggedKeywords.join(", ")})
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 pup-body-sm-500 font-medium text-neutral-black">
                      {plan._count?.members ?? 0}
                    </TableCell>
                    <TableCell className="px-6 py-4 pup-body-sm-400 text-neutral-dark-grey">
                      {format(new Date(plan.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                  </TableRow>
                );
              })
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
              className="rounded-xl border-2 border-neutral-200 px-4 py-2 pup-body-sm-400 text-neutral-dark-grey hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-xl border-2 border-neutral-200 px-4 py-2 pup-body-sm-400 text-neutral-dark-grey hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
