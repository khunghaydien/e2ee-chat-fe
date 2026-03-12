"use client";

import { useRouter } from "next/navigation";
import { Layout, Typography, theme } from "antd";
import { LockOutlined, LogoutOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";
import { PrivateKeyStorage } from "@/libs/ultils/privateKeyStorage";

const { Text } = Typography;
const { Header: AntHeader } = Layout;

export function Header() {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuth();
  const { token } = theme.useToken();

  const handleLogout = () => {
    PrivateKeyStorage.clear();
    authService.logout();
    router.replace("/sign-in");
    router.refresh();
  };

  return (
    <AntHeader
      className="flex items-center justify-between !px-6 !py-2 !bg-background"
    >
      <div className="flex items-center gap-2">
        <LockOutlined style={{ color: token.colorPrimary }} />
        <Text strong>{t("app_title")}</Text>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <ThemeToggle />
          <LanguageToggle />
        </div>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={handleLogout}
        >
          <LogoutOutlined style={{ color: token.colorTextSecondary }}/>
          <Text>{user?.userName ?? "User"}</Text>
        </div>
      </div>
    </AntHeader>
  );
}
