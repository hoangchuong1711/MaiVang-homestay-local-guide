import { Heart } from "lucide-react";
import LogoMark from "./logo-mark";
import { useLocale } from "@/lib/i18n";

export type PostcardData = {
  id: string;
  title: string;
  paragraphs: string[];
  signoff: string;
  signature: string;
  coordinates?: string;
};

export const postcards: PostcardData[] = [
  {
    id: "01",
    title: "A note for your stay",
    paragraphs: ["“Welcome to our little corner of coconut country. Take a bicycle, follow the river breeze, and enjoy the slow days.”"],
    signoff: "With love,",
    signature: "Mai Vàng family",
    coordinates: "10.2289° N · 106.3675° E",
  },
  {
    id: "02",
    title: "A little guide, from afar",
    paragraphs: [
      "Hello there,",
      "I’m currently at university in Ho Chi Minh city, so I can’t be at Mai Vàng every day to welcome you and share a few local favourites in person.",
      "I made this little guide to leave you the suggestions I’d share if we had a chance to sit down and chat: somewhere to eat, a café to pause at, or a place to discover around Bến Tre.",
      "I hope these notes help you feel a little more at home here, even while I’m away. Take your time, follow your curiosity, and make the days your own.",
    ],
    signoff: "Hope to see you at Mai Vàng,",
    signature: "May",
  },
];

export default function Postcard({ postcard }: { postcard: PostcardData }) {
  const { t } = useLocale();
  const first = postcard.id === "01";
  const title = first ? t("postcard1Title") : t("postcard2Title");
  const paragraphs = first ? [t("postcard1Body")] : [t("postcard2P1"), t("postcard2P2"), t("postcard2P3"), t("postcard2P4")];
  return (
    <article className="host-postcard postcard-entry" aria-labelledby={`postcard-${postcard.id}`}>
      <div className="postcard-inner">
        <div className="postcard-header">
          <div className="postcard-title-group">
            <span className="postcard-label">{t("postcardLabel")} · {postcard.id}</span>
            <h2 className="postcard-sub" id={`postcard-${postcard.id}`}>{title}</h2>
          </div>
          <div className="postage-stamp" aria-hidden="true"><LogoMark size={25} /><span>VIỆT NAM</span></div>
        </div>
        <div className="postcard-message">{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        <div className="postcard-footer">
          <span className="postcard-sig"><Heart size={13} /><span>{first ? t("postcard1Signoff") : t("postcard2Signoff")}<br />{first ? t("postcard1Signature") : postcard.signature}</span></span>
          {postcard.coordinates && <span className="postcard-coords">{postcard.coordinates}</span>}
        </div>
      </div>
    </article>
  );
}
