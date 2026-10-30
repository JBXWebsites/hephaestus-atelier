"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import {
  intentions,
  type Intention,
  type RelicRecord,
  recipeTitle,
} from "@/lib/relics";
import Emblem from "./Emblem";
import Forge, { readCollection, COLLECTION_KEY } from "./Forge";
gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin, ScrollSmoother);
const studies = [
  {
    id: "protect" as const,
    name: "Aegis",
    meaning: "To protect",
    image: "aegis",
    caption: "A boundary for what matters.",
    story:
      "For the things you refuse to lose. A quiet orbit around a steadfast center, holding what is precious within reach.",
    material: "BRONZE / SUN",
  },
  {
    id: "begin" as const,
    name: "Pyr",
    meaning: "To begin",
    image: "pyr",
    caption: "A spark for the unfinished.",
    story:
      "For the first step, taken before certainty. An angular heart holds a small fire: the possibility of something not yet made.",
    material: "OBSIDIAN / SUN",
  },
  {
    id: "return" as const,
    name: "Nostos",
    meaning: "To return",
    image: "nostos",
    caption: "A reminder of the way back.",
    story:
      "For every journey that changes you. An open orbit and a guiding star, reminding you that a way home can be carried.",
    material: "SILVER / WAVE",
  },
];
export default function Experience() {
  const root = useRef<HTMLDivElement>(null),
    galleryRef = useRef<HTMLDivElement>(null),
    smoother = useRef<ScrollSmoother | null>(null);
  const [selected, setSelected] = useState(0),
    [intention, setIntention] = useState<Intention>("protect"),
    [selectionVersion, setSelectionVersion] = useState(0),
    [scrolled, setScrolled] = useState(false),
    [menu, setMenu] = useState(false),
    [paused, setPaused] = useState(false),
    [osReduced, setOsReduced] = useState(false),
    [collection, setCollection] = useState<RelicRecord[]>([]),
    [collectionOpen, setCollectionOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const reducedMotion = paused || osReduced;
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setOsReduced(q.matches);
    change();
    q.addEventListener("change", change);
    try {
      setPaused(localStorage.getItem("hephaestus.motion") === "off");
    } catch {}
    const sync = () => setCollection(readCollection());
    sync();
    window.addEventListener("relic-created", sync);
    window.addEventListener("storage", sync);
    return () => {
      q.removeEventListener("change", change);
      window.removeEventListener("relic-created", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop: "(min-width: 1024px) and (pointer: fine)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          if (!ctx.conditions?.motion || reducedMotion) return;
          if (ctx.conditions.desktop)
            smoother.current = ScrollSmoother.create({
              wrapper: "#smooth-wrapper",
              content: "#smooth-content",
              smooth: 0.8,
              smoothTouch: 0,
              effects: false,
              onFocusIn: (_self, event) => {
                if (
                  (event.target as HTMLElement).matches(
                    'section[tabindex="-1"],main[tabindex="-1"]',
                  )
                )
                  return false;
              },
            });
          const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
          intro
            .from(
              ".hero-line span",
              { yPercent: 110, duration: 1.1, stagger: 0.12 },
              0.08,
            )
            .from(
              ".hero-detail",
              { autoAlpha: 0, y: 18, duration: 0.8, stagger: 0.1 },
              0.6,
            )
            .from(".hero-art", { scale: 1.06, duration: 1.5 }, 0);
          gsap.to(".hero-art", {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: ".hero",
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          });
          gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) =>
            gsap.from(el, {
              y: 36,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 91%", once: true },
            }),
          );
          gsap.fromTo(
            ".maker-image img",
            { yPercent: -6 },
            {
              yPercent: 6,
              ease: "none",
              scrollTrigger: {
                trigger: ".maker-image",
                start: "top bottom",
                end: "bottom top",
                scrub: 0.5,
              },
            },
          );
          gsap.from(".invocation-line span", {
            yPercent: 105,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: {
              trigger: ".invocation",
              start: "top 80%",
              end: "center 65%",
              scrub: 0.5,
            },
          });
          gsap.fromTo(
            ".invocation-emblem",
            { rotation: -25, scale: 0.85 },
            {
              rotation: 25,
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: ".invocation",
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            },
          );
          const hoverEls =
            root.current?.querySelectorAll<HTMLElement>(".button");
          const listeners: Array<() => void> = [];
          hoverEls?.forEach((el) => {
            const enter = () =>
                gsap.to(el, { y: -2, duration: 0.18, overwrite: "auto" }),
              leave = () =>
                gsap.to(el, { y: 0, duration: 0.18, overwrite: "auto" });
            el.addEventListener("pointerenter", enter);
            el.addEventListener("pointerleave", leave);
            listeners.push(() => {
              el.removeEventListener("pointerenter", enter);
              el.removeEventListener("pointerleave", leave);
              gsap.killTweensOf(el);
            });
          });
          return () => {
            listeners.forEach((fn) => fn());
            smoother.current?.kill();
            smoother.current = null;
          };
        },
      );
      return () => {
        mm.revert();
      };
    },
    { scope: root, dependencies: [reducedMotion], revertOnUpdate: true },
  );
  const { contextSafe } = useGSAP({ scope: root });
  const changeStudy = contextSafe((index: number) => {
    setSelected(index);
    if (!reducedMotion)
      gsap.fromTo(
        galleryRef.current,
        { autoAlpha: 0.3, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          ease: "power3.out",
          overwrite: true,
        },
      );
  });
  const navigate = contextSafe((event: React.MouseEvent<HTMLDivElement>) => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>(
      'a[href^="#"]',
    );
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;
    const target = document.querySelector<HTMLElement>(hash);
    if (!target) return;
    event.preventDefault();
    setMenu(false);
    if (reducedMotion) {
      target.scrollIntoView();
      target.focus({ preventScroll: true });
    } else if (smoother.current) {
      smoother.current.scrollTo(target, true, "top 84px");
      target.focus({ preventScroll: true });
    } else
      gsap.to(window, {
        scrollTo: { y: target, offsetY: 75, autoKill: true },
        duration: 1,
        ease: "power3.inOut",
        onComplete: () => target.focus({ preventScroll: true }),
      });
    history.replaceState(null, "", hash);
  });
  function toggleMotion() {
    setPaused((p) => {
      try {
        localStorage.setItem("hephaestus.motion", p ? "on" : "off");
      } catch {}
      return !p;
    });
  }
  function remove(token: string) {
    const remaining = collection.filter((r) => r.token !== token);
    try {
      localStorage.setItem(COLLECTION_KEY, JSON.stringify(remaining));
      setCollection(remaining);
    } catch {}
  }
  const study = studies[selected];
  return (
    <div
      ref={root}
      onClick={navigate}
      className={`experience${scrolled ? " has-scrolled" : ""}`}
    >
      <noscript>
        <style>{`.menu-toggle,.study-buttons{display:none!important}.site-header .header-cta{display:flex!important}.nojs-studies{margin-top:32px}.nojs-studies p{margin:20px 0}`}</style>
      </noscript>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Link className="brand" href="/">
          <Emblem />
          <span>
            HEPHAESTUS<small>THE DIVINE ATELIER</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#atelier">The atelier</a>
          <a href="#collection">The collection</a>
        </nav>
        <a href="#forge" className="header-cta">
          Enter the forge <span aria-hidden="true">↗</span>
        </a>
        <button
          className="menu-toggle"
          onClick={() => setMenu(!menu)}
          aria-expanded={menu}
          aria-controls="mobile-menu"
        >
          {menu ? "Close" : "Menu"}
        </button>
        {menu && (
          <nav
            id="mobile-menu"
            aria-label="Mobile navigation"
            onKeyDown={(e) => {
              if (e.key === "Escape") setMenu(false);
            }}
          >
            <a href="#atelier">The atelier</a>
            <a href="#collection">The collection</a>
            <a href="#forge">Enter the forge</a>
          </nav>
        )}
      </header>
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main id="main" tabIndex={-1}>
            <section
              className="hero"
              aria-labelledby="hero-title"
              data-sc-act="hero"
            >
              <div className="hero-art">
                <picture>
                  <source
                    media="(max-width: 600px)"
                    srcSet="/images/hero-mobile.webp"
                  />
                  <Image
                    src="/images/hero.webp"
                    alt="Imagined limestone sculpture of Hephaestus, lit by the warm glow of his forge"
                    fill
                    sizes="100vw"
                    fetchPriority="high"
                    loading="eager"
                  />
                </picture>
              </div>
              <div className="hero-shade" />
              <div className="hero-content">
                <p className="eyebrow hero-detail">
                  <span className="tiny-spark">✦</span> AN EXPLORATION OF MYTH &
                  MAKING
                </p>
                <h1 id="hero-title">
                  <span className="hero-line">
                    <span>FORGED</span>
                  </span>
                  <span className="hero-line">
                    <span>FOR THE</span>
                  </span>
                  <span className="hero-line">
                    <span>ETERNAL.</span>
                  </span>
                </h1>
                <div className="hero-detail hero-bottom-copy">
                  <p>
                    A workshop beyond Olympus.
                    <br />
                    Objects shaped by myth, made meaningful by you.
                  </p>
                  <a href="#forge" className="text-link">
                    Become the maker <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
              <div className="hero-footer hero-detail">
                <a href="#atelier" className="scroll-cue">
                  <span aria-hidden="true">↓</span> DISCOVER THE ATELIER
                </a>
                <p>
                  HEPHAESTUS<span>God of fire & craft</span>
                </p>
                <span className="hero-edition">
                  A JBX WEB STUDIO EXPERIMENT / 001
                </span>
              </div>
            </section>
            <section
              id="atelier"
              className="maker section"
              aria-labelledby="maker-title"
              tabIndex={-1}
              data-sc-act="maker"
            >
              <div className="section-top">
                <span className="section-number">I / THE MAKER</span>
                <span>OLYMPUS HAD ITS GODS. THEY HAD THEIR MAKER.</span>
              </div>
              <div className="maker-grid">
                <div className="maker-image" data-reveal>
                  <Image
                    src="/images/workshop.webp"
                    alt="An imagined volcanic workshop, with a tall ember-lit doorway and a bronze object on a stone workbench"
                    fill
                    sizes="(max-width: 700px) 90vw, 44vw"
                  />
                  <span className="image-caption">
                    A WORKSHOP OUTSIDE OF TIME
                  </span>
                </div>
                <div className="maker-copy">
                  <span className="small-star" aria-hidden="true">
                    ✳
                  </span>
                  <h2 id="maker-title" data-reveal>
                    The gods
                    <br />
                    had power.
                    <br />
                    <span>
                      One had
                      <br />a craft.
                    </span>
                  </h2>
                  <div data-reveal>
                    <p>
                      Hephaestus was the maker among the immortals. A god of
                      fire, metal, and the patient work of turning possibility
                      into form.
                    </p>
                    <p>
                      We imagined his atelier still open. A place where the
                      extraordinary begins with something simple: an intention.
                    </p>
                    <details
                      className="myth-note"
                      onToggle={() => ScrollTrigger.refresh()}
                    >
                      <summary>
                        Behind the myth <span aria-hidden="true">+</span>
                      </summary>
                      <p>
                        Ancient Greek stories place Hephaestus at the forge,
                        making wondrous objects for gods and heroes. This
                        atelier and its relics are our own contemporary fiction,
                        inspired by that tradition.
                      </p>
                      <a
                        href="https://www.theoi.com/Olympios/Hephaistos.html"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Explore the ancient sources ↗
                      </a>
                    </details>
                  </div>
                </div>
              </div>
              <p className="maker-footnote">
                NOT EVERY LEGEND BEGINS WITH A VICTORY.{" "}
                <span>SOME BEGIN WITH THE DECISION TO MAKE SOMETHING.</span>
              </p>
            </section>
            <section
              id="collection"
              className="collection section"
              aria-labelledby="collection-title"
              tabIndex={-1}
              data-sc-act="collection"
            >
              <div className="section-top">
                <span className="section-number">
                  II / OBJECTS OF INTENTION
                </span>
                <span>THREE STUDIES. COUNTLESS STORIES.</span>
              </div>
              <div className="collection-heading">
                <h2 id="collection-title" data-reveal>
                  Not ornaments.
                  <br />
                  Reminders.
                </h2>
                <p data-reveal>
                  Some objects hold more than their shape.
                  <br />
                  Find the intention that belongs to you.
                </p>
              </div>
              <div className="gallery-grid">
                <div className="gallery-art" ref={galleryRef}>
                  <Image
                    key={study.image}
                    src={`/images/${study.image}.webp`}
                    alt={`${study.name}: ${study.caption} An imagined sculptural relic, shown as an artistic study.`}
                    fill
                    sizes="(max-width: 700px) 90vw, 52vw"
                  />
                  <span className="gallery-art-label">
                    STUDY 0{selected + 1} / {study.material}
                  </span>
                </div>
                <div className="gallery-index">
                  <div
                    className="study-buttons"
                    role="group"
                    aria-label="Choose a relic study"
                  >
                    {studies.map((item, i) => (
                      <button
                        key={item.id}
                        onClick={() => changeStudy(i)}
                        className={
                          selected === i
                            ? "study-button active"
                            : "study-button"
                        }
                        aria-pressed={selected === i}
                      >
                        <span className="study-number">0{i + 1}</span>
                        <span className="study-name">
                          {item.name}
                          <small>{item.meaning}</small>
                        </span>
                        <span className="study-arrow" aria-hidden="true">
                          ↗
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="study-story" aria-live="polite">
                    <h3>{study.caption}</h3>
                    <p>{study.story}</p>
                  </div>
                  <a
                    href="#forge"
                    className="text-link"
                    onClick={() => {
                      setIntention(study.id);
                      setSelectionVersion((v) => v + 1);
                    }}
                  >
                    Make this your own <span aria-hidden="true">↗</span>
                  </a>
                  <noscript>
                    <div className="nojs-studies">
                      {studies.slice(1).map((item) => (
                        <p key={item.id}>
                          <strong>
                            {item.name} / {item.meaning}
                          </strong>
                          <br />
                          {item.story}
                        </p>
                      ))}
                    </div>
                  </noscript>
                  <p className="art-note">
                    Imagined studies. Your live object takes shape in the forge.
                  </p>
                </div>
              </div>
            </section>
            <section
              className="invocation"
              aria-label="The invitation to make"
              data-sc-act="invocation"
            >
              <div className="invocation-top">
                <span>III / THE INVITATION</span>
                <span>THE WORK IS NEVER FINISHED</span>
              </div>
              <Emblem className="invocation-emblem" />
              <p>
                <span className="invocation-line">
                  <span>A GOD MADE</span>
                </span>
                <span className="invocation-line">
                  <span>THE FIRST.</span>
                </span>
                <span className="invocation-line outlined">
                  <span>YOU MAKE</span>
                </span>
                <span className="invocation-line">
                  <span>THE NEXT.</span>
                </span>
              </p>
              <div className="invocation-bottom">
                <span>
                  Choose an intention.
                  <br />
                  Give it form.
                </span>
                <span aria-hidden="true">↓</span>
              </div>
            </section>
            <Forge
              selectedIntention={intention}
              selectionVersion={selectionVersion}
              reducedMotion={reducedMotion}
            />
            <section
              className="closing section"
              aria-labelledby="closing-title"
              data-sc-act="close"
            >
              <div className="closing-top">
                <Emblem />
                <span>THE ATELIER REMAINS OPEN</span>
              </div>
              <h2 id="closing-title" data-reveal>
                Nothing extraordinary
                <br />
                begins without a maker.
              </h2>
              <div className="closing-bottom">
                <p>
                  An exploration of ancient imagination
                  <br />
                  and what the web can become.
                </p>
                <button
                  className="text-link"
                  aria-expanded={collectionOpen}
                  aria-controls="saved-collection"
                  onClick={() => {
                    setCollectionOpen(!collectionOpen);
                    requestAnimationFrame(() => ScrollTrigger.refresh());
                  }}
                >
                  Your collection{" "}
                  <span>
                    ({collection.length.toString().padStart(2, "0")}){" "}
                    {collectionOpen ? "−" : "+"}
                  </span>
                </button>
              </div>
              {collectionOpen && (
                <div id="saved-collection" className="saved-collection">
                  <h3>Saved on this device</h3>
                  <p className="fine-print">
                    Keep a relic’s link to open it elsewhere. Removing it here
                    does not invalidate its link.
                  </p>
                  {collection.length === 0 ? (
                    <p>
                      You haven’t forged a relic yet.{" "}
                      <a href="#forge">Make your first ↗</a>
                    </p>
                  ) : (
                    <ul>
                      {collection.map((r) => (
                        <li key={r.token}>
                          <a href={`/relic/${r.token}`}>
                            {recipeTitle(r.recipe)}{" "}
                            <span aria-hidden="true">↗</span>
                          </a>
                          <button
                            onClick={() => remove(r.token)}
                            aria-label={`Remove ${recipeTitle(r.recipe)} from this device`}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </section>
          </main>
          <footer className="site-footer">
            <Link href="/" className="footer-wordmark">
              HEPHAESTUS
            </Link>
            <div className="footer-bottom">
              <span>DESIGNED & BUILT BY JBX WEB STUDIO</span>
              <div>
                <Link href="/credits">Credits & mythology ↗</Link>
                <button
                  type="button"
                  onClick={toggleMotion}
                  aria-pressed={reducedMotion}
                  disabled={osReduced}
                >
                  {reducedMotion ? "Motion off" : "Motion on"}{" "}
                  <span aria-hidden="true">◉</span>
                </button>
              </div>
              <span>A FICTIONAL ATELIER. A REAL EXPERIENCE.</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
