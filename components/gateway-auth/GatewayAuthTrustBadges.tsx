"use client";

import { useTranslations } from "next-intl";

const SHIELD_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCav_-hrfI9Zyxx9hnY4e-Ll_G4wGUrA0adzt-Gr8PxS2w10kZa7gSS93NwHK5HHbGqeDczONY_hwQibS4syA-gWaG4JzbdPWqsVafep1eF2oE8VcK6Hp0iyAp1jv3-5k4aHFcck9UqILJp8UO1rqjT8kCiGQvQGgYMdtgT-QMSXVpJ9mJAUpVbIrFiJvOYJ3HS_obV24h22WnWsEKfJtuf_VfTZlqUd6AUoU2jliDMI2DeivBXi3qRglVr7TOs6M_mjBbSEQ9eUnE";
const BADGE_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDgbS4TtUNo3Ar8xizjzFTHES09TEGQi-t08zmicT2i7WyK7snY13X4drT9E-g6btQ6qwSLgi_8koaPeSa0pYJpWjrQ1MQ0WYYC5rrehIPnrSS8HI6kBNP4BWXs9wCi5wAfdLxoAIjcyQhaW3r4Mg1KCWFO0otqJguXklJmZXC_rKYw-qf65hahWQv_f_1JubKf3D0nu-J471gBVheptuEw016l3HRmYtNrzCSYZry4c0oZ-ZvO0U_npKpyivpScPTw5WN0XrbsjAo";

export function GatewayAuthTrustBadges() {
  const t = useTranslations("gatewayAuth");

  return (
    <div className="mt-10 sm:mt-12 flex flex-col items-center gap-6">
      <div className="flex items-center gap-6 sm:gap-8 px-6 sm:px-8 py-3 bg-[var(--surface)]/50 rounded-full border border-[var(--border)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Security Shield"
          className="h-5 opacity-40 grayscale hover:grayscale-0 transition-all cursor-pointer w-auto"
          src={SHIELD_SRC}
        />
        <div className="h-4 w-px bg-[var(--border)]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Privacy Badge"
          className="h-5 opacity-40 grayscale hover:grayscale-0 transition-all cursor-pointer w-auto"
          src={BADGE_SRC}
        />
      </div>
      <div className="text-center space-y-1">
        <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-[0.2em]">
          {t("militaryGrade")}
        </p>
        <p className="text-[var(--text-muted)] text-xs font-medium">
          {t("footerCopyright")}
        </p>
      </div>
    </div>
  );
}
