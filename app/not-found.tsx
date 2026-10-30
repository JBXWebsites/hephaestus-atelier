import SimpleHeader from "@/components/SimpleHeader";
export default function NotFound() {
  return (
    <>
      <SimpleHeader />
      <main className="empty-page">
        <span className="eyebrow">A FRAGMENT LOST / 404</span>
        <h1>
          Even myths
          <br />
          have missing pieces.
        </h1>
        <p>
          This path or relic could not be found. If you followed a share link,
          check that the whole address was copied.
        </p>
        <a className="button" href="/">
          Return to the atelier <span aria-hidden="true">↗</span>
        </a>
      </main>
    </>
  );
}
