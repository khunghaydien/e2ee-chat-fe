"use client";

import { useTranslations } from "next-intl";
import {
  KeyOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  UploadOutlined,
  CheckOutlined,
} from "@ant-design/icons";

export function GatewayAuthKeyRestoration() {
  const t = useTranslations("gatewayAuth");

  return (
    <div className="flex-1 p-8 sm:p-10 lg:p-12 bg-[var(--surface-muted)]/30">
      <div className="flex items-center gap-4 mb-8 sm:mb-10 h-16">
        <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/10">
          <KeyOutlined className="text-2xl font-semibold" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--text)] leading-none">
            {t("step2Title")}
          </h2>
          <p className="text-xs text-primary font-bold mt-1.5 uppercase tracking-wider">
            {t("step2Subtitle")}
          </p>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 flex gap-4 shadow-sm min-h-[96px]">
          <div className="flex-shrink-0 size-10 rounded-full bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center">
            <ReloadOutlined className="text-amber-500 dark:text-amber-400 text-xl" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[var(--text)] font-bold">
              {t("e2eRequiredTitle")}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed font-medium">
              {t("e2eRequiredDesc")}
            </p>
          </div>
        </div>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[var(--text)] uppercase tracking-wide">
              {t("secretPhraseLabel")}
            </label>
            <textarea
              className="w-full p-4 rounded-xl border border-[var(--border)] focus:ring-4 focus:ring-primary/10 focus:border-primary bg-[var(--surface)] transition-all text-xs font-mono leading-relaxed resize-none text-[var(--text)] placeholder:text-[var(--text-muted)]"
              placeholder={t("secretPhrasePlaceholder")}
              rows={4}
              aria-label={t("secretPhraseLabel")}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 py-4 bg-[var(--foreground)] text-[var(--background)] font-bold rounded-xl hover:opacity-90 transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <SafetyCertificateOutlined className="text-xl" />
              {t("initializeKeys")}
            </button>
            <button
              type="button"
              className="aspect-square w-14 flex items-center justify-center border-2 border-[var(--border)] rounded-xl hover:border-primary hover:text-primary transition-all text-[var(--text-muted)] group"
              title={t("uploadKeyfileTitle")}
            >
              <UploadOutlined className="text-xl group-hover:scale-110 transition-transform" />
            </button>
          </div>
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center mt-0.5">
                <input
                  type="checkbox"
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-[var(--border)] bg-[var(--surface)] transition-all checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <CheckOutlined className="absolute text-white opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none text-base" />
              </div>
              <span className="text-xs font-medium text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">
                {t("storeSessionLabel")}
              </span>
            </label>
          </div>
        </form>
      </div>
    </div>
  );
}
