import Image from "next/image";
import type { CSSProperties } from "react";

export default function LogoMark({ size, className = "" }: { size?: number; className?: string }) {
  return <span className={`logo-mark ${className}`} style={size ? { "--logo-size": `${size}px` } as CSSProperties : undefined} aria-hidden="true">
    <Image src="/mai-vang-logo.png" alt="" width={90} height={90} className="logo-mark-image" unoptimized />
  </span>;
}
