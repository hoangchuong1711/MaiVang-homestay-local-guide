"use client";
import { useLocale } from "@/lib/i18n";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const { t } = useLocale();
  return <main className="loading-screen"><h1>{t("errorTitle")}</h1><p>{t("errorText")}</p><button className="primary-button" onClick={reset}>{t("tryAgain")}</button></main>;
}
