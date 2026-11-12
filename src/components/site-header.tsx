"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Compass, Home, Languages, Mail, MessageCircle } from "lucide-react";
import { directionsUrl, homestay } from "@/lib/config";
import { languageNames, useLocale, type Locale } from "@/lib/i18n";
import LogoMark from "./logo-mark";

export default function SiteHeader({ onPhrases, onContact }: { onPhrases: () => void; onContact: () => void }) {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLocale();
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/" aria-label={`${homestay.name} · ${t("localGuide")}`}>
          <LogoMark className="brand-emblem" />
          <span className="brand-text"><strong>Mai Vàng<span className="brand-dot">.</span></strong><small>HOMESTAY · BẾN TRE</small></span>
        </Link>
        <nav aria-label="Main navigation">
          <Link className={pathname === "/" ? "nav-active" : ""} aria-current={pathname === "/" ? "page" : undefined} href="/#explorer-section"><Compass size={15} /><span>{t("explore")}</span></Link>
          <Link className={pathname === "/postcards" ? "nav-active" : ""} aria-current={pathname === "/postcards" ? "page" : undefined} href="/postcards"><Mail size={15} /><span>{t("postcards")}</span></Link>
          <button type="button" onClick={onPhrases}><Languages size={15} /><span>{t("vietnamese")}</span></button>
          <a href={directionsUrl(homestay)} target="_blank" rel="noreferrer"><Home size={15} /><span>{t("wayHome")}</span></a>
        </nav>
        <div className="header-actions">
          <label className="locale-picker" title={t("language")}>
            <span className="locale-picker-face" aria-hidden="true"><Languages size={16} /><span>{locale.toUpperCase()}</span><ChevronDown size={13} /></span>
            <select aria-label={t("language")} value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>{(Object.keys(languageNames) as Locale[]).map((code) => <option key={code} value={code}>{languageNames[code]}</option>)}</select>
          </label>
          <button type="button" className="host-button" aria-label={t("askHost")} onClick={onContact}><MessageCircle size={15} /><span>{t("askHost")}</span></button>
        </div>
      </div>
    </header>
  );
}
