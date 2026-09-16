"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { CandidatePortrait } from "@/components/candidate-portrait";
import { PartyMark } from "@/components/party-mark";
import type { Candidate } from "@/lib/types";

type CandidateWithCount = Candidate & { proposalCount: number };

type Props = {
  candidates: CandidateWithCount[];
};

function surname(name: string) {
  return name.trim().split(/\s+/).at(-1) ?? name;
}

function alphabeticalOrder(candidates: CandidateWithCount[]) {
  return [...candidates].sort((left, right) =>
    surname(left.name).localeCompare(surname(right.name), "fr", { sensitivity: "base" }),
  );
}

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function dailyOrder(candidates: CandidateWithCount[]) {
  const day = new Date().toISOString().slice(0, 10);
  const ordered = alphabeticalOrder(candidates);
  const random = seededRandom(hashSeed(`trace-publique:${day}`));

  for (let index = ordered.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
  }

  return ordered;
}

export function CandidateDirectory({ candidates }: Props) {
  // L'ordre initial reste alphabétique pour le HTML statique et sans JavaScript.
  const [orderedCandidates, setOrderedCandidates] = useState(() => alphabeticalOrder(candidates));

  useEffect(() => {
    setOrderedCandidates(dailyOrder(candidates));
  }, [candidates]);

  return (
    <div className="directory-grid candidate-directory">
      {orderedCandidates.map((candidate) => (
        <article
          className="directory-card"
          key={candidate.id}
          style={{ "--candidate-accent": candidate.accent } as CSSProperties}
        >
          <CandidatePortrait {...candidate} />
          <div className="candidate-card-body">
            <div className="candidate-party-line">
              <PartyMark {...candidate} />
              <p className="eyebrow">{candidate.party}</p>
            </div>
            <p className="political-position">{candidate.politicalPosition}</p>
            <h2><Link href={`/candidats/${candidate.id}`}>{candidate.name}</Link></h2>
            <div className="candidate-card-footer">
              <span>{candidate.proposalCount} proposition{candidate.proposalCount !== 1 ? "s" : ""}</span>
              <Link href={`/candidats/${candidate.id}`}>Voir la fiche →</Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
