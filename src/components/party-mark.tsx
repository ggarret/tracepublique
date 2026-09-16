"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

type PartyMarkProps = {
  party: string;
  accent: string;
  partyShortName?: string;
  partyLogoUrl?: string;
  size?: "small" | "medium";
};

export function PartyMark({ party, accent, partyShortName, partyLogoUrl, size = "small" }: PartyMarkProps) {
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const fallback = partyShortName ?? party.split(" ").map((word) => word[0]).join("").slice(0, 3).toUpperCase();

  return (
    <span
      className={`party-mark party-mark-${size}`}
      style={{ "--party-accent": accent } as CSSProperties}
      title={party}
      aria-label={`Formation politique : ${party}`}
    >
      {partyLogoUrl && !imageUnavailable ? (
        <img src={partyLogoUrl} alt="" loading="lazy" decoding="async" onError={() => setImageUnavailable(true)} />
      ) : (
        <span aria-hidden="true">{fallback}</span>
      )}
    </span>
  );
}
