"use client";

import { Check, Copy, Volume2 } from "lucide-react";

const phraseGroups = [
  {
    title: "Getting around",
    phrases: [
      ["Please take me to this address", "Làm ơn đưa tôi đến địa chỉ này."],
      ["Where is the restroom?", "Nhà vệ sinh ở đâu ạ?"],
      ["Is there a grocery store nearby?", "Có tiệm tạp hóa nào gần đây không?"],
    ],
  },
  {
    title: "Food & drink",
    phrases: [
      ["I’m vegetarian", "Tôi ăn chay."],
      ["May I have some more water?", "Cho tôi thêm nước được không?"],
      ["May I have the bill?", "Cho tôi xin hóa đơn."],
    ],
  },
  {
    title: "Shopping & etiquette",
    phrases: [
      ["How much is this?", "Cái này bao nhiêu tiền?"],
      ["Could you lower the price a little?", "Có thể giảm giá một chút không?"],
      ["May I smoke here?", "Tôi có được hút thuốc ở đây không?"],
    ],
  },
] as const;

export default function PhraseList({ copied, onChoose }: { copied: string; onChoose: (vietnamese: string) => void }) {
  return <div className="phrase-groups">
    {phraseGroups.map((group) => <section className="phrase-group" key={group.title} aria-label={group.title}>
      <h3>{group.title}</h3>
      <div className="phrase-list">
        {group.phrases.map(([english, vietnamese]) => {
          const isCopied = copied === vietnamese;
          return <button type="button" key={vietnamese} className={isCopied ? "is-copied" : ""} onClick={() => onChoose(vietnamese)} aria-label={`Copy and speak: ${vietnamese}`}>
            <span className="phrase-text"><small>{english}</small><strong lang="vi">{vietnamese}</strong></span>
            <span className="phrase-copy-badge">{isCopied ? <><Check size={16} /><span>Copied</span></> : <><Volume2 size={15} /><Copy size={15} /></>}</span>
          </button>;
        })}
      </div>
    </section>)}
  </div>;
}
