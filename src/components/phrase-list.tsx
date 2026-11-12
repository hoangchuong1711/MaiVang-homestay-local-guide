"use client";

import { Check, Copy, Volume2 } from "lucide-react";
import { useLocale } from "@/lib/i18n";

const phraseGroups = [
  {
    title: "gettingAround",
    phrases: [
      ["takeAddress", "Làm ơn đưa tôi đến địa chỉ này."],
      ["restroom", "Nhà vệ sinh ở đâu ạ?"],
      ["grocery", "Có tiệm tạp hóa nào gần đây không?"],
    ],
  },
  {
    title: "foodDrink",
    phrases: [
      ["vegetarian", "Tôi ăn chay."],
      ["moreWater", "Cho tôi thêm nước được không?"],
      ["bill", "Cho tôi xin hóa đơn."],
    ],
  },
  {
    title: "shoppingEtiquette",
    phrases: [
      ["howMuch", "Cái này bao nhiêu tiền?"],
      ["discount", "Có thể giảm giá một chút không?"],
      ["smoke", "Tôi có được hút thuốc ở đây không?"],
    ],
  },
] as const;

export default function PhraseList({ copied, onChoose }: { copied: string; onChoose: (vietnamese: string) => void }) {
  const { t } = useLocale();
  return <div className="phrase-groups">
    {phraseGroups.map((group) => <section className="phrase-group" key={group.title} aria-label={t(group.title)}>
      <h3>{t(group.title)}</h3>
      <div className="phrase-list">
        {group.phrases.map(([english, vietnamese]) => {
          const isCopied = copied === vietnamese;
          return <button type="button" key={vietnamese} className={isCopied ? "is-copied" : ""} onClick={() => onChoose(vietnamese)} aria-label={`${t("copyAndSpeak")}: ${vietnamese}`}>
            <span className="phrase-text"><small>{t(english)}</small><strong lang="vi">{vietnamese}</strong></span>
            <span className="phrase-copy-badge">{isCopied ? <><Check size={16} /><span>{t("copied")}</span></> : <><Volume2 size={15} /><Copy size={15} /></>}</span>
          </button>;
        })}
      </div>
    </section>)}
  </div>;
}
