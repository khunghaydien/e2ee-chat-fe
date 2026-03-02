"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TokenStorage } from "@/libs/ultils/tokenStorage";

/** Redirect to /gateway-auth if no tokens (use on protected pages like /) */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    const hasToken =
      !!TokenStorage.getAccessToken() && !!TokenStorage.getRefreshToken();
    if (!hasToken) {
      router.replace("/gateway-auth");
    }
  }, [router]);
  return <>{children}</>;
}

/** Redirect to / if already has tokens (use on login page) */
export function GuestOnlyGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    const hasToken =
      !!TokenStorage.getAccessToken() && !!TokenStorage.getRefreshToken();
    if (hasToken) {
      router.replace("/");
    }
  }, [router]);
  return <>{children}</>;
}
