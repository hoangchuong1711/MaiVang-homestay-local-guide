"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Languages, MessageCircle, X } from "lucide-react";
import { homestay } from "@/lib/config";
import { MaiFlower } from "./place-art";
import SiteHeader from "./site-header";
import Postcard, { postcards } from "./postcard";
import PhraseList from "./phrase-list";

export default function PostcardsPage() {
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
    catch { setCopied("Could not copy. You can show this card to someone instead."); }
  }

  return <>
    <a className="skip-link" href="#postcards">Skip to postcards</a>
    <SiteHeader onPhrases={() => setModal("phrases")} onContact={() => setModal("contact")} />
    <main id="postcards" className="postcards-page">
      <div className="postcards-intro"><p className="eyebrow"><span className="eyebrow-dot" /> NOTES FROM YOUR HOST</p><h1>A few postcards, just for you.</h1><p>Little notes from your host, to keep you company in Bến Tre.</p></div>
      <div className="postcards-list">{postcards.map((postcard) => <Postcard key={postcard.id} postcard={postcard} />)}</div>
    </main>
    <footer className="site-footer"><div className="site-footer-inner"><span className="footer-brand"><MaiFlower size={18} className="footer-flower-svg" /><span>Made for slow days in Bến Tre.</span></span><small>{homestay.name} · Local Guide</small></div></footer>
    <dialog ref={dialog} className="guide-dialog" aria-labelledby="dialog-title" onCancel={() => setModal(null)} onClose={() => setModal(null)} onClick={(event) => { if (event.target === dialog.current) setModal(null); }}>
      <div className="dialog-inner"><span className="dialog-handle" aria-hidden="true" /><button type="button" className="dialog-close" aria-label="Close dialog" onClick={() => setModal(null)}><X size={20} /></button>
        {modal === "phrases" && <div className="dialog-content phrases-content"><span className="eyebrow"><Languages size={13} /> SPEAK LIKE A NEIGHBOR</span><h2 id="dialog-title">A little Vietnamese.</h2><p className="detail-description">Tap a phrase to copy it and hear it spoken, or show your screen to someone nearby.</p><PhraseList copied={copied} onChoose={copyPhrase} /><p className="detail-note" role="status">{copied ? copied.startsWith("Could not") ? copied : "Copied to clipboard — ready to share or show." : "Tap any phrase to copy text & play audio."}</p></div>}
        {modal === "contact" && <div className="dialog-content contact-content"><span className="contact-flower" aria-hidden="true"><MaiFlower size={46} /></span><span className="eyebrow">ALWAYS HAPPY TO HELP</span><h2 id="dialog-title">Ask your host.</h2><p className="detail-description">Need a recommendation, a bicycle or boat ride, or help finding your way back? Reach out to Mai Vàng anytime.</p><div className="contact-actions"><a className="primary-button" href={homestay.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={18} /><span>Message on WhatsApp</span><ArrowUpRight size={17} /></a><a className="secondary-button" href={homestay.instagram} target="_blank" rel="noreferrer"><span>Connect on Instagram (@maivanghomestay)</span><ArrowUpRight size={17} /></a></div><a className="phone-link" href={`tel:${homestay.phone}`}>Or call directly: +84 372 237 278</a></div>}
      </div>
    </dialog>
  </>;
}
