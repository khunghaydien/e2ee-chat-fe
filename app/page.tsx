"use client";

import { useState } from "react";
import { Header } from "@/components/chat/Header";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { ConversationListSocketSync } from "@/components/chat/ConversationListSocketSync";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function Home() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    null,
  );

  return (
    <AuthGuard>
      <ConversationListSocketSync />
      <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
        <Header
          selectedConversationId={selectedConversationId}
          onBackToList={() => setSelectedConversationId(null)}
        />
        {/* Desktop / tablet: luôn hiện cả sidebar + chat */}
        <main className="hidden md:flex flex-1 overflow-hidden min-h-0 bg-chat-bg">
          <Sidebar
            selectedConversationId={selectedConversationId}
            setSelectedConversationId={setSelectedConversationId}
          />
          <ChatArea selectedConversationId={selectedConversationId} />
        </main>
        {/* Mobile: chỉ hiện một trong hai */}
        <main className="flex md:hidden flex-1 overflow-hidden min-h-0 bg-chat-bg">
          {!selectedConversationId && (
            <Sidebar
              selectedConversationId={selectedConversationId}
              setSelectedConversationId={setSelectedConversationId}
            />
          )}
          {selectedConversationId && (
            <ChatArea selectedConversationId={selectedConversationId} />
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
