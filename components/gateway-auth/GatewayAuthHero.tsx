"use client";

import { useTranslations } from "next-intl";

export function GatewayAuthHero() {
  const t = useTranslations("gatewayAuth");

  return (
    <div className="p-8 sm:p-10 text-center lg:text-left border-b border-[var(--border)] bg-[var(--surface-muted)]/50">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        {t("enterpriseBadge")}
      </div>
      <h1 className="text-[var(--text)] text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
        {t("title")}
      </h1>
      <p className="text-[var(--text-muted)] text-base max-w-2xl font-medium mx-auto lg:mx-0">
        {t("subtitle")}
      </p>
    </div>
  );
}
