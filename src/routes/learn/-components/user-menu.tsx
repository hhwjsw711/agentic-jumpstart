import { Button, buttonVariants } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Home, LogOut, User } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "~/hooks/use-auth";
import { useProfile } from "~/hooks/use-profile";
import { ModeToggle } from "~/components/ModeToggle";

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className }: UserMenuProps) {
  const user = useAuth();
  const { data: profile } = useProfile();

  if (!user) {
    return (
      <div className={className}>
        <div className="flex gap-2 p-4 border-t space-y-3">
          <a
            href="/api/login/google"
            className={buttonVariants({ variant: "default" })}
          >
            <User className="mr-2 h-4 w-4" />
            Login
          </a>
          <ModeToggle />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="p-4 border-t space-y-3">
        {/* Navigation */}
        <div className="flex flex-col gap-2">
          <Link to="/">
            <Button
              variant="outline"
              className="text-center w-full justify-center"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <a
              href="/api/logout"
              className={buttonVariants({ variant: "default" })}
            >
              <LogOut className="mr-2 size-4" />
              Logout
            </a>
            <ModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
