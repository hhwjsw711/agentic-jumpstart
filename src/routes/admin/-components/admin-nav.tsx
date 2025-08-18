import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "~/lib/utils";
import {
  BarChart3,
  Users,
  MessageSquare,
  Mail,
  Target,
  UserCheck,
} from "lucide-react";

const navigation = [
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Conversions",
    href: "/admin/conversions",
    icon: Target,
  },
  {
    name: "Affiliates",
    href: "/admin/affiliates",
    icon: UserCheck,
  },
  {
    name: "Comments",
    href: "/admin/comments",
    icon: MessageSquare,
  },
  {
    name: "Emails",
    href: "/admin/emails",
    icon: Mail,
  },
];

export function AdminNav() {
  const location = useLocation();

  return (
    <nav className="w-64 bg-card border-r border-border">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Admin Panel
        </h2>
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}