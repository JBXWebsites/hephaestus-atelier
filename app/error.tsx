"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="empty-page">
      <span className="eyebrow">THE FIRE WILL RETURN</span>
      <h1>A pause at the forge.</h1>
      <p>
        The atelier encountered a problem. Try again, or return to the
        beginning.
      </p>
      <button className="button" onClick={reset}>
        Try again <span aria-hidden="true">↗</span>
      </button>
      <a href="/">Return to the atelier</a>
    </main>
  );
}
