"use client";

import { useRouter } from "next/navigation";
import { Avatar, Layout, Typography } from "antd";
import {
  ArrowLeftOutlined,
  LockOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";
import { useParticipants } from "@/hooks/useParticipants";
import { PrivateKeyStorage } from "@/libs/ultils/privateKeyStorage";

const { Text } = Typography;
const { Header: AntHeader } = Layout;

interface HeaderProps {
  selectedConversationId?: string | null;
  onBackToList?: () => void;
}

export function Header({
  selectedConversationId = null,
  onBackToList,
}: HeaderProps) {
  const t = useTranslations();
  const tChat = useTranslations("chat");
  const router = useRouter();
  const { user } = useAuth();
  const { data: participants } = useParticipants(selectedConversationId ?? null);
  const otherParticipant = participants?.find((p) => p.id !== user?.id);
  const otherName = otherParticipant?.userName ?? tChat("unknownParticipant");

  const handleLogout = () => {
    PrivateKeyStorage.clear();
    authService.logout();
    router.replace("/sign-in");
    router.refresh();
  };

  return (
    <AntHeader
      className="flex items-center justify-between !px-4 md:!px-6 !py-3 !bg-background shrink-0"
      style={{
        borderBottom: "1px solid var(--header-border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {selectedConversationId ? (
          <>
            {onBackToList && (
              <button
                type="button"
                onClick={onBackToList}
                className="mr-1 flex h-8 w-8 items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.06)] border border-transparent md:hidden"
              >
                <ArrowLeftOutlined style={{ color: "var(--text-muted)" }} />
              </button>
            )}
            <Avatar
              size={40}
              icon={<UserOutlined />}
              style={{
                backgroundColor: "var(--avatar-bg)",
                color: "var(--avatar-text)",
              }}
            />
            <div className="flex-1 min-w-0">
              <Text strong className="block text-foreground truncate">
                {otherName}
              </Text>
              <Text
                className="text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <LockOutlined className="mr-1" />
                {tChat("e2eeLabel")}
              </Text>
            </div>
          </>
        ) : (
          <>
            <LockOutlined style={{ color: "var(--primary)" }} />
            <Text strong>{t("app_title")}</Text>
          </>
        )}
      </div>
      <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center">
          <ThemeToggle />
          <LanguageToggle />
        </div>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={handleLogout}
        >
          <LogoutOutlined style={{ color: "var(--text-muted)" }} />
          <Text>{user?.userName ?? "User"}</Text>
        </div>
      </div>
    </AntHeader>
  );
}
