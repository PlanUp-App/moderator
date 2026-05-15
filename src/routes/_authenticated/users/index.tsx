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
import { ProfileAvatar } from "@/components/PreviewImage";
import { format } from "date-fns";
import { useGetAllClients, type UserStatus } from "./-queries";
import { SearchInput } from "@/components/CustomInput/search-input";
import { UserStatusBadge } from "@/components/Badge";

export const Route = createFileRoute("/_authenticated/users/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetAllClients({
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
    limit: 20,
  });

  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="pup-heading-three text-neutral-black">Users</h1>
            <p className="pup-body-sm-400 text-neutral-dark-grey">
              {data?.total ?? 0} total users
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex items-center gap-3">
          {/* Search */}

          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
          />

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as UserStatus | "all")
            }
          >
            <SelectTrigger className="w-44 min-h-12 cursor-pointer px-4 flex-1 pup-body-md-400 rounded-xl border border-neutral-light-grey hover:border-neutral-300 hover:shadow-sm">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value={"all"}
                className="pup-body-md-400 h-12 px-4 cursor-pointer"
              >
                All statuses
              </SelectItem>
              <SelectItem
                value="ACTIVE"
                className="pup-body-md-400 h-12 px-4 cursor-pointer"
              >
                Active
              </SelectItem>
              <SelectItem
                value="SUSPENDED"
                className="pup-body-md-400 h-12 px-4 cursor-pointer"
              >
                Suspended
              </SelectItem>
              <SelectItem
                value="UNVERIFIED"
                className="pup-body-md-400 h-12 px-4 cursor-pointer"
              >
                Unverified
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
                User
              </TableHead>
              <TableHead className="pup-body-sm-500 text-neutral-dark-grey">
                Status
              </TableHead>
              <TableHead className="pup-body-sm-500 text-neutral-dark-grey">
                Plan Memberships
              </TableHead>
              <TableHead className="pup-body-sm-500 text-neutral-dark-grey">
                Reports Received
              </TableHead>
              <TableHead className="pup-body-sm-500 text-neutral-dark-grey">
                Date Joined
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-8 w-24 animate-pulse rounded bg-neutral-100" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24">
                  <div className="flex flex-col items-center py-12 text-center gap-2">
                    <MdOutlineSearch className="size-8 text-neutral-300" />
                    <p className="pup-body-sm-400 text-neutral-dark-grey">
                      No users found
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.users.map((user) => {
                return (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer hover:bg-neutral-50 py-4"
                    onClick={() =>
                      navigate({
                        to: "/users/$userId",
                        params: { userId: user.id },
                      })
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ProfileAvatar
                          alt={user.name}
                          src={user.profilePicture}
                        />
                        <div>
                          <p className="pup-body-md-500 text-neutral-dark-grey">
                            {user.name}
                          </p>
                          <p className="text-xs text-neutral-500 pup-body-sm-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <UserStatusBadge
                        user={{
                          suspendedTill: user.suspendedTill,
                          verifiedAt: user.verifiedAt,
                        }}
                        className="w-fit"
                      />
                    </TableCell>
                    <TableCell className="pup-body-sm-500 font-medium text-neutral-black">
                      {user._count.planMemberships}
                    </TableCell>
                    <TableCell className="pup-body-sm-500 font-medium text-neutral-black">
                      {user._count.reportsReceived}
                    </TableCell>
                    <TableCell className="pup-body-sm-400 text-neutral-dark-grey">
                      {format(new Date(user.createdAt), "MMM dd, yyyy")}
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
              className="rounded-xl border-2 border-neutral-200 px-4 py-2 pup-body-sm-400 text-neutral-dark-grey hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-xl border-2 border-neutral-200 px-4 py-2 pup-body-sm-400 text-neutral-dark-grey hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
