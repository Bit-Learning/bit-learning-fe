import { useLocation, useNavigate } from "@tanstack/react-router";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAuthStore } from "@/shared/stores/auth-store";

interface SignOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuthStore();

  const handleSignOut = () => {
    auth.reset();
    const currentPath = location.href;
    navigate({
      to: "/sign-in",
      search: { redirect: currentPath },
      replace: true,
    });
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Đăng xuất"
      desc="Bạn có chắc chắn muốn đăng xuất không? Bạn sẽ cần đăng nhập lại để truy cập tài khoản."
      confirmText="Đăng xuất"
      handleConfirm={handleSignOut}
      className="sm:max-w-sm"
    />
  );
}
