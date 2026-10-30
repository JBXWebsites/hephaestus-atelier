"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  intentions,
  materials,
  marks,
  getIntention,
  recipeTitle,
  type RecipeChoice,
  type RelicRecord,
  type Intention,
} from "@/lib/relics";
gsap.registerPlugin(useGSAP);
const RelicScene = dynamic(() => import("./RelicScene"), {
  ssr: false,
  loading: () => <div className="scene-loading">Preparing the workbench…</div>,
});
export const COLLECTION_KEY = "hephaestus.collection.v1";
const publicRequestErrors: Record<number, readonly string[]> = {
  400: [
    "Open the atelier on this site before forging a relic.",
    "Choose a valid intention, material and maker’s mark.",
    "Choose an intention, material and maker’s mark.",
    "The recipe could not be read. Please try again.",
    "The recipe could not be read. Send valid JSON with three choices.",
  ],
  413: ["The recipe is too large. Send only the three choices."],
  415: ["Send the three choices as JSON."],
};
class ForgeRequestError extends Error {}
function validRecord(
  value: unknown,
  choice: RecipeChoice,
): value is RelicRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<RelicRecord>;
  const recipe = record.recipe;
  return (
    typeof record.token === "string" &&
    /^[A-Za-z0-9_-]{38}$/.test(record.token) &&
    record.url === `/relic/${record.token}` &&
    !!recipe &&
    recipe.version === 1 &&
    recipe.intention === choice.intention &&
    recipe.material === choice.material &&
    recipe.mark === choice.mark &&
    typeof recipe.nonce === "string" &&
    /^[a-f0-9]{16}$/.test(recipe.nonce) &&
    record.id === `HPH-${recipe.nonce.toUpperCase()}` &&
    typeof recipe.createdAt === "string" &&
    Number.isFinite(Date.parse(recipe.createdAt))
  );
}
export function readCollection(): RelicRecord[] {
  try {
    const value = JSON.parse(localStorage.getItem(COLLECTION_KEY) || "[]");
    return Array.isArray(value)
      ? value
          .filter(
            (r) =>
              typeof r?.token === "string" &&
              /^[\w-]{38}$/.test(r.token) &&
              r?.recipe &&
              intentions.some((x) => x.id === r.recipe.intention) &&
              materials.some((x) => x.id === r.recipe.material) &&
              marks.some((x) => x.id === r.recipe.mark),
          )
          .slice(0, 12)
      : [];
  } catch {
    return [];
  }
}
export default function Forge({
  selectedIntention,
  selectionVersion,
  reducedMotion,
}: {
  selectedIntention: Intention;
  selectionVersion: number;
  reducedMotion: boolean;
}) {
  const root = useRef<HTMLElement>(null),
    resultRef = useRef<HTMLDivElement>(null),
    busy = useRef(false),
    activeRequest = useRef<AbortController | null>(null),
    requestVersion = useRef(0);
  const [choice, setChoice] = useState<RecipeChoice>({
    intention: selectedIntention,
    material: "bronze",
    mark: "sun",
  });
  const [ready, setReady] = useState(false),
    [pending, setPending] = useState(false),
    [result, setResult] = useState<RelicRecord | null>(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [copy, setCopy] = useState("Copy link"),
    [copyStatus, setCopyStatus] = useState(""),
    [shareAddress, setShareAddress] = useState("");
  useEffect(() => {
    requestVersion.current++;
    activeRequest.current?.abort();
    busy.current = false;
    setPending(false);
    setChoice((c) => ({ ...c, intention: selectedIntention }));
    setResult(null);
    setError("");
    setNotice("");
    setCopy("Copy link");
    setCopyStatus("");
    setShareAddress("");
  }, [selectedIntention, selectionVersion]);
  useEffect(
    () => () => {
      requestVersion.current++;
      activeRequest.current?.abort();
    },
    [],
  );
  useEffect(() => {
    const ob = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setReady(true);
          ob.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    if (root.current) ob.observe(root.current);
    return () => ob.disconnect();
  }, []);
  useGSAP(
    () => {
      if (result) {
        if (!reducedMotion)
          gsap.fromTo(
            resultRef.current,
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" },
          );
        resultRef.current?.focus({ preventScroll: true });
      }
    },
    { scope: root, dependencies: [result], revertOnUpdate: true },
  );
  function update(part: Partial<RecipeChoice>) {
    requestVersion.current++;
    setChoice((c) => ({ ...c, ...part }));
    setResult(null);
    setError("");
    setNotice("");
    setCopy("Copy link");
    setCopyStatus("");
    setShareAddress("");
  }
  async function forge() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    setNotice("");
    setCopy("Copy link");
    setCopyStatus("");
    setShareAddress("");
    let timedOut = false;
    const version = ++requestVersion.current,
      controller = new AbortController(),
      timeout = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, 15000);
    activeRequest.current = controller;
    try {
      const response = await fetch("/api/relics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(choice),
        signal: controller.signal,
      });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          data && typeof data === "object" && "error" in data
            ? data.error
            : null;
        const safeMessage =
          typeof message === "string" &&
          publicRequestErrors[response.status]?.includes(message)
            ? message
            : response.status >= 500
              ? "The forge is temporarily unavailable. Please try again."
              : "The forge could not complete your request. Please try again.";
        throw new ForgeRequestError(
          `${safeMessage} Your choices are still here.`,
        );
      }
      if (!validRecord(data, choice))
        throw new ForgeRequestError(
          "The forge returned an incomplete record. Your choices are still here. Please try again.",
        );
      if (version !== requestVersion.current) return;
      setResult(data);
      try {
        localStorage.setItem(
          COLLECTION_KEY,
          JSON.stringify([data, ...readCollection()].slice(0, 12)),
        );
        window.dispatchEvent(new Event("relic-created"));
      } catch {
        setNotice(
          "Your relic is ready. This browser could not save it locally; keep the link to return.",
        );
      }
    } catch (cause) {
      if (version === requestVersion.current)
        setError(
          timedOut
            ? "The forge took too long to respond. Your choices are still here. Please try again."
            : cause instanceof ForgeRequestError
              ? cause.message
              : "We couldn’t reach the forge. Your choices are still here. Check your connection and try again.",
        );
    } finally {
      clearTimeout(timeout);
      if (version === requestVersion.current) {
        busy.current = false;
        setPending(false);
        activeRequest.current = null;
      }
    }
  }
  async function copyLink() {
    if (!result) return;
    const version = requestVersion.current;
    const address = new URL(result.url, location.origin).href;
    try {
      await navigator.clipboard.writeText(address);
      if (version !== requestVersion.current) return;
      setCopy("Link copied");
      setCopyStatus("Your share link is on the clipboard.");
      setShareAddress("");
    } catch {
      if (version !== requestVersion.current) return;
      setShareAddress(address);
      setCopyStatus(
        "This browser could not copy the link. Select and copy the address below.",
      );
    }
  }
  const current = getIntention(choice.intention);
  return (
    <section
      id="forge"
      className="forge section"
      ref={root}
      aria-labelledby="forge-title"
      tabIndex={-1}
      data-sc-act="forge"
    >
      <div className="section-top">
        <span className="section-number">The forge / 03</span>
      </div>
      <div className="forge-intro">
        <h2 id="forge-title">
          What will <br />
          you carry?
        </h2>
        <p>
          Three choices. One object of your own.
          <br />
          The next story begins in your hands.
        </p>
      </div>
      <div className="workbench">
        <div className="forge-object">
          <div className="object-heading">
            <span>{current.name}</span>
            <span>{result ? "SEALED BY THE MAKER" : "LIVE OBJECT STUDY"}</span>
          </div>
          {ready ? (
            <RelicScene
              {...choice}
              forged={!!result}
              reducedMotion={reducedMotion}
            />
          ) : (
            <div className="scene-loading">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle
                  cx="50"
                  cy="50"
                  r="32"
                  fill="none"
                  stroke="currentColor"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="22"
                  fill="none"
                  stroke="currentColor"
                />
              </svg>
              <span>Your workbench awaits</span>
            </div>
          )}
          <p className="object-inscription">“{current.inscription}”</p>
        </div>
        <div className="forge-controls">
          <fieldset disabled={pending}>
            <legend>
              <span>01</span> An intention
            </legend>
            <div className="choices intentions">
              {intentions.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={
                    choice.intention === item.id ? "choice selected" : "choice"
                  }
                  aria-pressed={choice.intention === item.id}
                  onClick={() => update({ intention: item.id })}
                >
                  <span className="choice-dot" />
                  {item.label}
                </button>
              ))}
            </div>
            <p className="field-hint">{current.description}</p>
          </fieldset>
          <fieldset disabled={pending}>
            <legend>
              <span>02</span> A material
            </legend>
            <div className="choices">
              {materials.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={
                    choice.material === item.id ? "choice selected" : "choice"
                  }
                  aria-pressed={choice.material === item.id}
                  onClick={() => update({ material: item.id })}
                >
                  <span className={`material-swatch ${item.id}`} />
                  {item.name}
                </button>
              ))}
            </div>
            <p className="field-hint">
              {materials.find((m) => m.id === choice.material)?.description}
            </p>
          </fieldset>
          <fieldset disabled={pending}>
            <legend>
              <span>03</span> A maker’s mark
            </legend>
            <div className="choices marks">
              {marks.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={
                    choice.mark === item.id ? "choice selected" : "choice"
                  }
                  aria-pressed={choice.mark === item.id}
                  onClick={() => update({ mark: item.id })}
                >
                  <svg viewBox="0 0 100 100" aria-hidden="true">
                    <path
                      d={item.path}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item.name}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="forge-summary">
            <span>YOUR OBJECT</span>
            <p>{recipeTitle(choice)}</p>
          </div>
          {!result ? (
            <>
              <button
                className="button forge-button"
                type="button"
                disabled={pending}
                onClick={forge}
              >
                {pending
                  ? "Forging your relic…"
                  : error
                    ? "Try the forge again"
                    : "Forge my relic"}
                <span aria-hidden="true">↗</span>
              </button>
              <p className="fine-print">
                A digital object. Yours to keep. No account required.
              </p>
            </>
          ) : (
            <div className="forge-result" ref={resultRef} tabIndex={-1}>
              <span className="result-label">YOUR RELIC IS READY</span>
              <h3>{current.name}, made yours.</h3>
              <p>Your choices are sealed into a shareable digital record.</p>
              <a className="button" href={result.url}>
                View your relic<span aria-hidden="true">↗</span>
              </a>
              <div className="result-actions">
                <a href={`/api/relics/${result.token}/print`} download>
                  Download print ↓
                </a>
                <button onClick={copyLink} type="button">
                  {copy}
                </button>
              </div>
              <p
                className="fine-print"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {copyStatus}
              </p>
              {shareAddress && (
                <label className="fine-print" style={{ display: "block" }}>
                  Your relic’s share link
                  <input
                    type="text"
                    readOnly
                    value={shareAddress}
                    onFocus={(event) => event.currentTarget.select()}
                    onClick={(event) => event.currentTarget.select()}
                    style={{
                      display: "block",
                      width: "100%",
                      minWidth: 0,
                      minHeight: 44,
                      marginTop: 8,
                      padding: "10px 12px",
                      color: "inherit",
                      background: "transparent",
                      border: "1px solid currentColor",
                      font: "inherit",
                    }}
                  />
                </label>
              )}
            </div>
          )}
          <p className={error ? "status error" : "status"} aria-live="polite">
            {error ||
              notice ||
              (pending
                ? "Creating your record."
                : result
                  ? "Relic created. Your share link and archival print are ready."
                  : "")}
          </p>
        </div>
      </div>
      <noscript>
        <style>{`.forge-controls,.forge-object{display:none}`}</style>
        <p>
          The interactive forge needs JavaScript. You can still explore the
          atelier and read about its three relic studies above.
        </p>
      </noscript>
    </section>
  );
}
