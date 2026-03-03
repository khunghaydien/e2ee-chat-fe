"use client";

import { useState } from "react";
import { Modal, Checkbox, Typography, Input } from "antd";
import { SafetyCertificateOutlined, CopyOutlined, CheckOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";

interface PrivateKeyModalProps {
  open: boolean;
  privateKeyJwk: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PrivateKeyModal({
  open,
  privateKeyJwk,
  onConfirm,
  onCancel,
}: PrivateKeyModalProps) {
  const t = useTranslations("authentication");
  const [copied, setCopied] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(privateKeyJwk);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      title={
        <span className="flex items-center gap-2">
          <SafetyCertificateOutlined className="text-primary" />
          {t("copyPrivateKeyModalTitle")}
        </span>
      }
      open={open}
      onCancel={onCancel}
      onOk={onConfirm}
      okButtonProps={{ disabled: !checked }}
      okText={t("copyPrivateKeyModalConfirmButton")}
      cancelButtonProps={{ style: { display: "none" } }}
      width={560}
    >
      <div className="space-y-2">
        <Typography.Paragraph type="secondary">
          {t("copyPrivateKeyModalDescription")}
        </Typography.Paragraph>
        <Input.TextArea
          value={privateKeyJwk}
          readOnly
          autoSize={{ minRows: 4, maxRows: 8 }}
        />
        <div
          onClick={handleCopy}
          className="flex items-center text-blue-500 cursor-pointer mt-2 gap-2"
        >
          {copied ? <CheckOutlined /> : <CopyOutlined />}
          {copied ? t("copied") : t("copyPrivateKeyButton")}
        </div>
        <Checkbox
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        >
          <span>
            {t("copyPrivateKeyModalCheckboxDescription")}
          </span>
        </Checkbox>
      </div>
    </Modal>
  );
}
