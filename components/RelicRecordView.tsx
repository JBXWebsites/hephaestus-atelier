"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  getIntention,
  getMark,
  getMaterial,
  type RelicRecord,
} from "@/lib/relics";
const RelicScene = dynamic(() => import("./RelicScene"), {
  ssr: false,
  loading: () => <div className="scene-loading">Opening your relic…</div>,
});
export default function RelicRecordView({ record }: { record: RelicRecord }) {
  const [copy, setCopy] = useState("Copy share link"),
    [fallback, setFallback] = useState(""),
    [reduced, setReduced] = useState(false);
  const { recipe, token } = record,
    intention = getIntention(recipe.intention);
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      let stored = false;
      try {
        stored = localStorage.getItem("hephaestus.motion") === "off";
      } catch {}
      setReduced(q.matches || stored);
    };
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);
  async function share() {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopy("Link copied");
    } catch {
      setFallback(location.href);
      setCopy("Your link is shown below");
    }
  }
  return (
    <div className="record-grid">
      <div>
        <RelicScene {...recipe} forged reducedMotion={reduced} />
        <p className="object-inscription">“{intention.inscription}”</p>
        <noscript>
          <img
            src={`/api/relics/${token}/print`}
            alt={`${intention.name}, an archival drawing of your relic`}
            width="600"
            height="800"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </noscript>
      </div>
      <div className="record-copy">
        <span className="eyebrow">AN OBJECT OF YOUR OWN</span>
        <h1 className="record-name">{intention.name}</h1>
        <p>{intention.description}</p>
        <dl className="record-choices">
          <div>
            <dt>Intention</dt>
            <dd>{intention.label}</dd>
          </div>
          <div>
            <dt>Material</dt>
            <dd>{getMaterial(recipe.material).name}</dd>
          </div>
          <div>
            <dt>Mark</dt>
            <dd>{getMark(recipe.mark).name}</dd>
          </div>
        </dl>
        <p>
          A small reminder, given form by your choices. This is your digital
          relic and its record.
        </p>
        <p className="record-meta">
          {record.id}
          <br />
          Forged{" "}
          {new Date(recipe.createdAt)
            .toISOString()
            .replace("T", " · ")
            .slice(0, 21)}{" "}
          UTC
        </p>
        <div className="record-actions">
          <a className="button" href={`/api/relics/${token}/print`} download>
            Download archival print <span aria-hidden="true">↓</span>
          </a>
          <button className="text-link" onClick={share}>
            {copy}
            <span aria-hidden="true">↗</span>
          </button>
        </div>
        <p aria-live="polite" className="copy-address">
          {fallback ||
            (copy === "Link copied"
              ? "Your share link is on the clipboard."
              : "")}
        </p>
        <p className="record-note">
          An original fictional object. No account needed to keep it.
          <br />
          Anyone with this link can view the relic.
        </p>
        <a className="text-link" href="/#forge">
          Create another <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}
