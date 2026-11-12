"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Languages, MessageCircle, X } from "lucide-react";
import { homestay } from "@/lib/config";
import LogoMark from "./logo-mark";
import SiteHeader from "./site-header";
import Postcard, { postcards } from "./postcard";
import PhraseList from "./phrase-list";
import { useLocale } from "@/lib/i18n";

export default function PostcardsPage() {
  const { t } = useLocale();
  const [modal, setModal] = useState<"phrases" | "contact" | null>(null);
  const [copied, setCopied] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (modal && !dialog.current?.open) dialog.current?.showModal();
    else if (!modal && dialog.current?.open) dialog.current.close();
    if (modal) {
      const before = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = before; };
    }
  }, [modal]);

  async function copyPhrase(value: string) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(value);
      utterance.lang = "vi-VN";
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
    }
    try { await navigator.clipboard.writeText(value); setCopied(value); }
    catch { setCopied("__copy_failed__"); }
  }

  return <>
    <a className="skip-link" href="#postcards">{t("skipPostcards")}</a>
    <SiteHeader onPhrases={() => setModal("phrases")} onContact={() => setModal("contact")} />
    <main id="postcards" className="postcards-page">
      <div className="postcards-intro"><p className="eyebrow"><span className="eyebrow-dot" /> {t("notesHost")}</p><h1>{t("postcardTitle")}</h1><p>{t("postcardIntro")}</p></div>
      <div className="postcards-list">{postcards.map((postcard) => <Postcard key={postcard.id} postcard={postcard} />)}</div>
    </main>
    <footer className="site-footer"><div className="site-footer-inner"><span className="footer-brand"><LogoMark size={20} /><span>{t("madeFor")}</span></span><small>{homestay.name} · {t("localGuide")}</small></div></footer>
    <dialog ref={dialog} className="guide-dialog" aria-labelledby="dialog-title" onCancel={() => setModal(null)} onClose={() => setModal(null)} onClick={(event) => { if (event.target === dialog.current) setModal(null); }}>
      <div className="dialog-inner"><span className="dialog-handle" aria-hidden="true" /><button type="button" className="dialog-close" aria-label={t("closeDialog")} onClick={() => setModal(null)}><X size={20} /></button>
        {modal === "phrases" && <div className="dialog-content phrases-content"><span className="eyebrow"><Languages size={13} /> {t("speakNeighbor")}</span><h2 id="dialog-title">{t("littleVietnamese")}</h2><p className="detail-description">{t("phraseIntro")}</p><PhraseList copied={copied} onChoose={copyPhrase} /><p className="detail-note" role="status">{copied ? copied === "__copy_failed__" ? t("copyFailed") : t("copyReady") : t("phraseHint")}</p></div>}
        {modal === "contact" && <div className="dialog-content contact-content"><span className="contact-flower" aria-hidden="true"><LogoMark size={48} /></span><span className="eyebrow">{t("happyHelp")}</span><h2 id="dialog-title">{t("askHostTitle")}</h2><p className="detail-description">{t("contactIntro")}</p><div className="contact-actions"><a className="primary-button" href={homestay.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={18} /><span>{t("whatsapp")}</span><ArrowUpRight size={17} /></a><a className="secondary-button" href={homestay.instagram} target="_blank" rel="noreferrer"><span>{t("instagram")}</span><ArrowUpRight size={17} /></a></div><a className="phone-link" href={`tel:${homestay.phone}`}>{t("call")}: +84 372 237 278</a></div>}
      </div>
    </dialog>
  </>;
}
