import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { MdOutlineSearch } from "react-icons/md";
import { useForm } from "@mantine/form";
import { z } from "zod";
import { PrimaryButton } from "@/components/Button/primary-filled";
import { CustomInput } from "@/components/CustomInput/input";
import {
  useCreateModerator,
  useDeactivateModerator,
  useGetModerators,
  useReactivateModerator,
  useUpdateModerator,
  type Moderator,
} from "./-queries";
import { zod4Resolver } from "mantine-form-zod-resolver";

// ─── Schemas ────────────────────────────────────────────────────────────────

const createSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const editSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z
    .string()
    .refine((val) => val === "" || val.length >= 8, {
      message: "Password must be at least 8 characters",
    })
    .optional(),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

// ─── Route ───────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_authenticated/moderators/")({
  beforeLoad: ({ context }) => {
    if (context.auth.user?.role !== "ADMIN") {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: ModeratorsPage,
});

// ─── Modal ───────────────────────────────────────────────────────────────────

interface ModeratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moderator: Moderator | null;
}

function ModeratorModal({
  open,
  onOpenChange,
  moderator,
}: ModeratorModalProps) {
  const isEdit = moderator !== null;

  const createMutation = useCreateModerator();
  const updateMutation = useUpdateModerator();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const createForm = useForm<CreateValues>({
    initialValues: { name: "", email: "", password: "" },
    validate: zod4Resolver(createSchema),
    validateInputOnBlur: true,
  });

  const editForm = useForm<EditValues>({
    initialValues: { name: moderator?.name ?? "", password: "" },
    validate: zod4Resolver(editSchema),
    validateInputOnBlur: true,
  });

  useEffect(() => {
    if (moderator) {
      editForm.setValues({ name: moderator.name ?? "", password: "" });
      editForm.clearErrors();
    }
  }, [moderator]);

  // Reset and seed form whenever the modal opens
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      if (isEdit) {
        editForm.setValues({ name: moderator.name ?? "", password: "" });
        editForm.clearErrors();
      } else {
        createForm.reset();
      }
    }
    onOpenChange(nextOpen);
  };

  const handleCreate = createForm.onSubmit((values) => {
    createMutation.mutate(values, {
      onSuccess: () => onOpenChange(false),
    });
  });

  const handleEdit = editForm.onSubmit((values) => {
    const payload: { name: string; password?: string } = { name: values.name };
    if (values.password) payload.password = values.password;

    updateMutation.mutate(
      { id: moderator!.id, payload },
      { onSuccess: () => onOpenChange(false) },
    );
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Moderator" : "Create Moderator"}
          </DialogTitle>
        </DialogHeader>

        {isEdit ? (
          <form onSubmit={handleEdit} className="grid gap-3 mt-2">
            <CustomInput
              label="Name"
              inputProps={editForm.getInputProps("name")}
            />
            <CustomInput
              label="New Password (Leave blank to keep current)"
              inputProps={editForm.getInputProps("password")}
            />
            <DialogFooter>
              <PrimaryButton
                type="submit"
                className="w-full"
                title="Save Changes"
                disabled={isSubmitting}
              />
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleCreate} className="grid gap-3 mt-2">
            <CustomInput
              label="Name"
              inputProps={createForm.getInputProps("name")}
            />
            <CustomInput
              label="Email"
              inputProps={createForm.getInputProps("email")}
            />
            <CustomInput
              label="Password"
              inputProps={createForm.getInputProps("password")}
            />
            <DialogFooter>
              <PrimaryButton
                type="submit"
                className="w-full"
                title="Create Moderator"
                disabled={isSubmitting}
              />
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

function ModeratorsPage() {
  const { data: moderators, isLoading } = useGetModerators();
  const deactivateMutation = useDeactivateModerator();
  const reactivateMutation = useReactivateModerator();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingModerator, setEditingModerator] = useState<Moderator | null>(
    null,
  );

  const filteredModerators = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return moderators ?? [];
    return (moderators ?? []).filter(
      (m) =>
        m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
    );
  }, [moderators, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredModerators.length / PAGE_SIZE),
  );
  const paginatedModerators = filteredModerators.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const openCreate = () => {
    setEditingModerator(null);
    setModalOpen(true);
  };

  const openEdit = (moderator: Moderator) => {
    setEditingModerator(moderator);
    setModalOpen(true);
  };

  const toggleStatus = (moderator: Moderator) => {
    if (moderator.deactivatedAt) {
      reactivateMutation.mutate(moderator.id);
    } else {
      deactivateMutation.mutate(moderator.id);
    }
  };

  const isTogglingStatus =
    deactivateMutation.isPending || reactivateMutation.isPending;

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="pup-heading-three text-neutral-black">Moderators</h1>
          <p className="pup-body-sm-400 text-neutral-dark-grey">
            {filteredModerators.length} total moderators
          </p>
        </div>
        <PrimaryButton
          onClick={openCreate}
          className="h-11"
          title="Create Moderator"
        />
      </div>

      {/* Search */}
      <div className="w-full max-w-sm">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search moderators..."
          className="h-11"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-neutral-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50 hover:bg-neutral-50">
              {[
                "Moderator",
                "Status",
                "Must Change Password",
                "Created",
                "",
              ].map((col) => (
                <TableHead
                  key={col}
                  className="pup-body-sm-500 text-neutral-dark-grey"
                >
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <div className="h-8 w-24 animate-pulse rounded bg-neutral-100" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedModerators.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="flex flex-col items-center py-12 gap-2">
                    <MdOutlineSearch className="size-8 text-neutral-300" />
                    <p className="pup-body-sm-400 text-neutral-dark-grey">
                      No moderators found
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedModerators.map((moderator) => (
                <TableRow key={moderator.id} className="hover:bg-neutral-50">
                  <TableCell>
                    <p className="pup-body-md-500 text-neutral-dark-grey">
                      {moderator.name}
                    </p>
                    <p className="pup-body-sm-400 text-neutral-grey">
                      {moderator.email}
                    </p>
                  </TableCell>
                  <TableCell>
                    {moderator.deactivatedAt ? (
                      <span className="rounded-full bg-red-50 px-3 py-1 pup-body-sm-500 text-red-700">
                        Deactivated
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-50 px-3 py-1 pup-body-sm-500 text-green-700">
                        Active
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="pup-body-sm-400 text-neutral-dark-grey">
                    {moderator.mustChangePassword ? "Yes" : "No"}
                  </TableCell>
                  <TableCell className="pup-body-sm-400 text-neutral-dark-grey">
                    {formatDistanceToNow(new Date(moderator.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => openEdit(moderator)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant={
                          moderator.deactivatedAt ? "default" : "outline"
                        }
                        onClick={() => toggleStatus(moderator)}
                        disabled={isTogglingStatus}
                      >
                        {moderator.deactivatedAt ? "Reactivate" : "Deactivate"}
                      </Button>
                    </div>
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

      {/* Modal (rendered once, outside the header clutter) */}
      <ModeratorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        moderator={editingModerator}
      />
    </div>
  );
}
