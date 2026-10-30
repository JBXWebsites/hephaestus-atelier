import Link from "next/link";
import Emblem from "./Emblem";
export default function SimpleHeader() {
  return (
    <header className="simple-header">
      <Link className="brand" href="/">
        <Emblem />
        <span>
          HEPHAESTUS<small>THE DIVINE ATELIER</small>
        </span>
      </Link>
      <Link href="/#forge">Enter the forge ↗</Link>
    </header>
  );
}
