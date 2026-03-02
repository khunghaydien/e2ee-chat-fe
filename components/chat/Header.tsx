"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LockOutlined,
  SafetyCertificateOutlined,
  BellOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";
import { useE2EE } from "@/contexts/E2EEContext";

const navKeys = [
  { key: "dashboard", href: "#", active: false },
  { key: "messages", href: "#", active: true },
  { key: "contacts", href: "#", active: false },
  { key: "vault", href: "#", active: false },
] as const;

export function Header() {
  const t = useTranslations("header");
  const router = useRouter();
  const { user } = useAuth();
  const { lock } = useE2EE();

  const handleLogout = () => {
    lock();
    authService.logout();
    router.replace("/gateway-auth");
    router.refresh();
  };

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-6 py-3 bg-white dark:bg-background-dark z-10">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 text-primary">
          <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <LockOutlined className="text-primary" />
          </div>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
            {t("brandName")} <span className="text-primary">{t("enterprise")}</span>
          </h2>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {navKeys.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                item.active
                  ? "text-primary font-semibold border-b-2 border-primary pb-1"
                  : "text-slate-600 dark:text-slate-400 hover:text-primary"
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
          style={{
            backgroundColor: "var(--success-bg)",
            borderColor: "var(--success-border)",
            color: "var(--success)",
          }}
        >
          <SafetyCertificateOutlined className="text-xs" />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            {t("systemSecure")}
          </span>
        </div>
        <button
          type="button"
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label={t("notifications")}
        >
          <BellOutlined />
        </button>
        <span className="flex items-center gap-1 [&_.ant-btn]:!p-2 [&_.ant-btn]:!min-h-9 [&_.ant-btn]:!text-slate-500 [&_.ant-btn]:hover:!text-primary [&_.ant-btn]:hover:!bg-slate-100 dark:[&_.ant-btn]:hover:!bg-slate-800 [&_.ant-btn]:!rounded-lg [&_.ant-btn]:!border-0">
          <ThemeToggle />
          <LanguageToggle />
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
          title="Đăng xuất"
        >
          <LogoutOutlined />
          <span className="text-xs font-medium hidden sm:inline">{user?.userName ?? "User"}</span>
        </button>
        <div
          className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBTSDGhajprtjSa-ZG4m11TBKjozGqAgsMPa6c3LJlnIWYeVlFjYYq-Gn5F6r0D_8bF0t4zvcvt-54eEQzJkIxLztG69N0yYWE1ZS6r6Z1iG0wFgpFAd9Lw0Ti2eC6fSqMWKiZ7Rdh2tmeXu-P0iabX0KJai-oN4cml1PmYfHYu5qt4p5OUT9uwB3C46IO7ZOY6eiB-pXaXWyDC8hKHIdkYLav8NwNqhanwuUryVHpFLyBckFEBB1G5Hym0thMoBM6EscE8SliuVLM")`,
          }}
          role="img"
          aria-label={t("profileAvatar")}
        />
      </div>
    </header>
  );
}
