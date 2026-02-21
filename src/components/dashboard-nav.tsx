
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  FileText,
  ShieldAlert,
  Settings,
  LogOut
} from "lucide-react"
import { useAuth } from "@/firebase"
import { signOut } from "firebase/auth"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "AI Chatbot",
    href: "/dashboard/chatbot",
    icon: MessageSquare,
  },
  {
    title: "Leave Management",
    href: "/dashboard/leaves",
    icon: Calendar,
  },
  {
    title: "Resume Builder",
    href: "/dashboard/resume",
    icon: FileText,
  },
  {
    title: "Admin Panel",
    href: "/dashboard/admin",
    icon: ShieldAlert,
  },
]

export function DashboardNav() {
  const pathname = usePathname()
  const auth = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  }

  return (
    <nav className="flex flex-col gap-2 p-4 h-full">
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              pathname === item.href
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
      <div className="mt-auto pt-4 border-t space-y-1">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-all hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </nav>
  )
}
