"use client";

import { GuestOnlyGuard } from "@/components/auth/AuthGuard";
import { GatewayAuthHeader } from "./GatewayAuthHeader";
import { GatewayAuthHero } from "./GatewayAuthHero";
import { GatewayAuthIdentityForm } from "./GatewayAuthIdentityForm";
import { GatewayAuthKeyRestoration } from "./GatewayAuthKeyRestoration";
import { GatewayAuthTrustBadges } from "./GatewayAuthTrustBadges";

export function GatewayAuthView() {
  return (
    <GuestOnlyGuard>
    <main className="min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center p-6 lg:p-12">
      <div className="w-full max-w-7xl rounded-2xl shadow-lg border border-[var(--border)] overflow-hidden">
        <GatewayAuthHero />
        <div className="flex flex-col lg:flex-row">
          <GatewayAuthIdentityForm />
          <GatewayAuthKeyRestoration />
        </div>
      </div>
      <GatewayAuthTrustBadges />
    </main>
    </GuestOnlyGuard>
  );
}
