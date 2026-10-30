import SimpleHeader from "@/components/SimpleHeader";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Credits & mythology" };
export default function Credits() {
  return (
    <>
      <SimpleHeader />
      <main className="credits-page">
        <span className="eyebrow">BEHIND THE ATELIER</span>
        <h1>
          Old myths.
          <br />
          New possibilities.
        </h1>
        <p>
          HEPHAESTUS is an independent design and development experiment by JBX
          Web Studio. It imagines a divine workshop still open to the world, and
          invites you to become its next maker.
        </p>
        <h2>Where mythology ends, imagination begins</h2>
        <p>
          Hephaestus is the Greek god associated with fire and metalworking.
          Ancient stories describe him making remarkable objects for gods and
          heroes. That tradition is our starting point.
        </p>
        <p>
          This atelier, its three relic designs, and their inscriptions are
          original fiction. Aegis, Pyr, and Nostos are artistic interpretations
          of protection, beginning, and return. They are not replicas of ancient
          artifacts or objects for sale.
        </p>
        <p>
          <a
            href="https://www.theoi.com/Olympios/Hephaistos.html"
            target="_blank"
            rel="noreferrer"
          >
            Theoi: Hephaestus and the ancient source collection ↗
          </a>
        </p>
        <h2>The visual world</h2>
        <p>
          The imagined statue, workshop, and collection studies were created
          with generative imagery and directed as a single visual world. The
          forge uses original interactive 3D geometry. Collection images are
          artistic studies; the live object and downloadable illustrated print
          are distinct interpretations of the same intention.
        </p>
        <p>
          Marcellus and Manrope are self-hosted under the SIL Open Font License.
          Motion is built with GSAP; the interactive objects use Three.js.
        </p>
        <ul>
          <li>
            <a href="/fonts/MARCELLUS-LICENSE.txt">Marcellus font license</a>
          </li>
          <li>
            <a href="/fonts/MANROPE-LICENSE.txt">Manrope font license</a>
          </li>
        </ul>
        <h2>What happens when you forge</h2>
        <p>
          The server creates a record of your intention, material, mark, and
          creation time. Your share link contains that record, so it can be
          reopened on another device. The link is not a certificate of
          authenticity, a blockchain asset, or proof of ownership. Anyone with
          the link can view the relic.
        </p>
        <p>
          The archival download is an original SVG illustration of your choices.
          It can be opened in a browser, printed, or used as a digital keepsake.
        </p>
        <h2>Your privacy and your collection</h2>
        <p>
          No account, name, email, or payment is required. We do not maintain a
          database of your relics. Your collection, limited to twelve recent
          objects, and your motion preference are stored in this browser.
          Clearing browser storage removes that local collection; saved share
          links still work.
        </p>
        <p>
          Ordinary hosting request logs may be processed by Vercel to operate
          the site. This experience adds no advertising trackers or analytics
          cookies. Avoid treating share links as private information.
        </p>
        <h2>Made by JBX Web Studio</h2>
        <p>
          This is a portfolio concept demonstrating art direction, storytelling,
          motion, interactive 3D, and working web services. All objects are
          digital; there is no physical manufacturing or fulfillment.
        </p>
        <a className="text-link" href="/#forge">
          Make something of your own <span aria-hidden="true">↗</span>
        </a>
      </main>
    </>
  );
}
