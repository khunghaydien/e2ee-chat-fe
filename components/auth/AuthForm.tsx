"use client";

import { useTranslations } from "next-intl";
import { Form, Input } from "antd";
import {
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { ReactNode } from "react";

type AuthFormProps = {
  userName: string;
  password: string;
  error?: string;
  onSubmit: (e: React.FormEvent) => void;
  onUserNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  children?: ReactNode;
};

export function AuthForm({
  userName,
  password,
  error,
  onSubmit,
  onUserNameChange,
  onPasswordChange,
  children,
}: AuthFormProps) {
  const t = useTranslations("authentication");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80">
      <div className="w-full max-w-2xl rounded-2xl shadow-xl shadow-primary/20 p-8 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-primary/30 mx-6">
        <Form
          layout="vertical"
          className="space-y-6"
          onSubmitCapture={onSubmit}
        >
          <Form.Item
            label={t("userName")}
            name="userName"
            rules={[{ required: true, message: t("userNameRequired") }]}
          >
            <Input
              size="large"
              placeholder={t("userNamePlaceholder")}
              value={userName}
              onChange={(e) => onUserNameChange(e.target.value)}
              prefix={<UserOutlined />}
            />
          </Form.Item>

          <Form.Item
            label={t("password")}
            name="password"
            rules={[{ required: true, message: t("passwordRequired") }]}
          >
            <Input.Password
              size="large"
              placeholder={t("passwordPlaceholder")}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              prefix={<LockOutlined />}
            />
          </Form.Item>

          {error && (
            <p className="text-sm text-red-500 font-medium">{error}</p>
          )}
          {children}
        </Form>
      </div>
    </div>
  );
}
