"use client";

import { useState } from "react";
import { Modal } from "antd";
import { SafetyCertificateOutlined, CopyOutlined, CheckOutlined } from "@ant-design/icons";

interface CopyPrivateKeyModalProps {
  open: boolean;
  /** Private key JWK string (nguyên bản) để user copy. */
  privateKeyJwk: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CopyPrivateKeyModal({
  open,
  privateKeyJwk,
  onConfirm,
  onCancel,
}: CopyPrivateKeyModalProps) {
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
          Sao chép Private Key (khóa bí mật)
        </span>
      }
      open={open}
      onCancel={onCancel}
      onOk={onConfirm}
      okButtonProps={{ disabled: !checked }}
      okText="Tôi đã lưu, tiếp tục"
      cancelButtonProps={{ style: { display: "none" } }}
      width={560}
      closable={false}
    >
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
        Đây là private key của bạn (dạng JWK). Lưu lại ở nơi an toàn. Ứng dụng không lưu key này — mỗi lần đăng nhập thiết bị khác bạn cần dán key này vào ô phía trên chat để giải mã tin nhắn.
      </p>
      <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 mb-4 max-h-40 overflow-y-auto">
        <pre className="text-xs font-mono text-[var(--text)] whitespace-pre-wrap break-all">
          {privateKeyJwk}
        </pre>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-2 text-sm text-primary hover:underline mb-4"
      >
        {copied ? <CheckOutlined /> : <CopyOutlined />}
        {copied ? "Đã copy" : "Copy private key"}
      </button>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="rounded"
        />
        <span className="text-sm">
          Tôi đã lưu private key an toàn và hiểu rằng mất key sẽ không đọc được tin nhắn mã hóa
        </span>
      </label>
    </Modal>
  );
}
