"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";

export function GatewayAuthHeader() {
  const t = useTranslations("gatewayAuth");

  return (
    <header className="flex items-center justify-between whitespace-nowrap bg-[var(--surface)]/80 dark:bg-[var(--surface)]/90 backdrop-blur-md sticky top-0 z-50 px-6 sm:px-8 py-4 border-b border-[var(--border)]">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-9 bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
          <SafetyCertificateOutlined className="text-xl" />
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-[var(--text)]">
          {t("brandName")}
          <span className="text-primary">{t("brandSuffix")}</span>
        </h2>
      </div>
      <div className="flex flex-1 justify-end gap-4 sm:gap-6 items-center">
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>
        <nav className="hidden lg:flex items-center gap-6 sm:gap-8">
          <Link
            className="text-[var(--text-muted)] text-sm font-semibold hover:text-primary transition-colors"
            href="#"
          >
            {t("navArchitecture")}
          </Link>
          <Link
            className="text-[var(--text-muted)] text-sm font-semibold hover:text-primary transition-colors"
            href="#"
          >
            {t("navCompliance")}
          </Link>
          <Link
            className="text-[var(--text-muted)] text-sm font-semibold hover:text-primary transition-colors"
            href="#"
          >
            {t("navDocs")}
          </Link>
        </nav>
        <button
          type="button"
          className="flex min-w-[140px] cursor-pointer items-center justify-center rounded-full h-10 px-6 bg-[var(--foreground)] text-[var(--background)] text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-md"
        >
          {t("contactSecurity")}
        </button>
      </div>
    </header>
  );
}
