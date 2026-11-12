"use client";

import LogoMark from "@/components/logo-mark";
import { useLocale } from "@/lib/i18n";

export default function Loading() {
  const { t } = useLocale();
  return (
    <main className="loading-screen">
      <LogoMark size={54} />
      <h1>{t("loadingTitle")}</h1>
      <p>{t("loadingText")}</p>
    </main>
  );
}
