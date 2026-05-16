import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { PrimaryButton } from "../Button/primary-filled";
import { CustomInput } from "../CustomInput/input";
import { useAuth } from "@/auth/useAuth";
import { toast } from "sonner";

type ChangePasswordModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description?: string;
};

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),

    newPassword: z.string().min(8, "Password must be at least 8 characters"),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordModal({
  open,
  onOpenChange,
  description,
}: ChangePasswordModalProps) {
  const { changePasswordMutation } = useAuth();

  const form = useForm<ChangePasswordValues>({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: zod4Resolver(changePasswordSchema),
    validateInputOnBlur: false,
    validateInputOnChange: true,
  });

  const isSubmitting = changePasswordMutation.isPending;

  useEffect(() => {
    if (open) {
      form.reset();
      form.clearErrors();
    }
  }, [open]);

  const handleSubmit = form.onSubmit((values) => {
    changePasswordMutation.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          toast.success("Password changed successfully");
        },
      },
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        {
          <p className="pup-body-sm-400 text-neutral-dark-grey mt-2">
            {description || "Make sure your new password is strong and secure."}
          </p>
        }

        <form
          onSubmit={handleSubmit}
          className="grid gap-3 mt-2"
          autoComplete="off"
        >
          <CustomInput
            label="Current Password"
            type="password"
            inputProps={form.getInputProps("currentPassword")}
            autoComplete="current-password"
          />

          <CustomInput
            label="New Password"
            type="password"
            inputProps={form.getInputProps("newPassword")}
            autoComplete="new-password"
          />

          <CustomInput
            label="Confirm New Password"
            type="password"
            inputProps={form.getInputProps("confirmPassword")}
            autoComplete="new-password"
          />

          <DialogFooter>
            <PrimaryButton
              type="submit"
              className="w-full"
              title="Change Password"
              disabled={isSubmitting}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
