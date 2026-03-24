import { useRouter } from "@tanstack/react-router";
import { useAuth } from "../../auth/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MdOutlineLogout } from "react-icons/md";
import { ProfileAvatar } from "../PreviewImage";

export default function UserMenu() {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.navigate({ to: "/login" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <ProfileAvatar
          showBorder={true}
          size="md"
          alt={user?.name || "PlanUp"}
          className="cursor-pointer"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="pup-body-sm-500 text-neutral-black">
            {user?.name}
          </span>
          <span className="text-xs text-neutral-dark-grey font-normal">
            {user?.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 focus:text-red-500 focus:bg-red-50 cursor-pointer"
        >
          <MdOutlineLogout className="size-4" />
          <span className="pup-body-sm-400">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
