"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";
const HomePage = dynamic(() => import("@/pages/home"), { ssr: false });
export default function AppPage() {
    return (
        <Suspense>
            <HomePage />
        </Suspense>
    );
}