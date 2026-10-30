export default function Emblem({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M13 7v34M35 7v34M13 24h22M9 7h8M31 7h8M9 41h8M31 41h8"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="m24 12 5 12-5 12-5-12Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}
