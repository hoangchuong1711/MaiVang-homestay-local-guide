"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, Languages, Mail, MessageCircle } from "lucide-react";
import { directionsUrl, homestay } from "@/lib/config";
import { MaiFlower } from "./place-art";

export default function SiteHeader({ onPhrases, onContact }: { onPhrases: () => void; onContact: () => void }) {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/" aria-label={`${homestay.name} local guide home`}>
          <span className="brand-emblem" aria-hidden="true"><MaiFlower size={24} className="brand-flower-svg" /></span>
          <span className="brand-text"><strong>Mai Vàng<span className="brand-dot">.</span></strong><small>HOMESTAY · BẾN TRE</small></span>
        </Link>
        <nav aria-label="Main navigation">
          <Link className={pathname === "/" ? "nav-active" : ""} aria-current={pathname === "/" ? "page" : undefined} href="/#explorer-section"><Compass size={15} /><span>Explore</span></Link>
          <Link className={pathname === "/postcards" ? "nav-active" : ""} aria-current={pathname === "/postcards" ? "page" : undefined} href="/postcards"><Mail size={15} /><span>Postcards</span></Link>
          <button type="button" onClick={onPhrases}><Languages size={15} /><span>Vietnamese</span></button>
          <a href={directionsUrl(homestay)} target="_blank" rel="noreferrer"><Home size={15} /><span>Way Home</span></a>
        </nav>
        <button type="button" className="host-button" onClick={onContact}><MessageCircle size={15} /><span>Ask host</span></button>
      </div>
    </header>
  );
}
