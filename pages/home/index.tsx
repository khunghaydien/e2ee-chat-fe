"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { ChatProvider } from "@/contexts/ChatContext";
import { Header } from "@/components/chat/Header";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatArea } from "@/components/chat/ChatArea";

export default function HomePage() {
  return (
    <AuthGuard>
      <ChatProvider>
        <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
          <Header />
          <main className="flex flex-1 overflow-hidden min-h-0">
            <Sidebar />
            <ChatArea />
          </main>
        </div>
      </ChatProvider>
    </AuthGuard>
  );
}
