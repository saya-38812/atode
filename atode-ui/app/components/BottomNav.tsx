"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/", label: "今日" },
  { href: "/stock", label: "ストック" },
  { href: "/like", label: "Like" },
  { href: "/settings", label: "設定" },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex justify-around items-center h-16 z-50">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex flex-col items-center text-xs ${
            pathname === item.href
              ? "text-primary font-semibold"
              : "text-slate-400"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
