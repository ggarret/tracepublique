"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

type CandidatePortraitProps = {
  name: string;
  accent: string;
  portraitUrl?: string;
  portraitSource?: string;
  size?: "avatar" | "card" | "large";
};

export function CandidatePortrait({ name, accent, portraitUrl, portraitSource, size = "card" }: CandidatePortraitProps) {
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2);

  return (
    <div className={`candidate-portrait candidate-portrait-${size}`} style={{ "--candidate-accent": accent } as CSSProperties}>
      <span className="portrait-initials" aria-hidden="true">{initials}</span>
      {portraitUrl && !imageUnavailable ? (
        <img
          className={imageLoaded ? "is-loaded" : ""}
          src={portraitUrl}
          alt={`Portrait public de ${name}`}
          loading={size === "large" ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageUnavailable(true)}
        />
      ) : null}
      {size !== "avatar" && portraitSource && portraitUrl && imageLoaded && !imageUnavailable ? <small>Photo : {portraitSource}</small> : null}
    </div>
  );
}
