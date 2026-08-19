export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 340 340"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="InsuraGuard AI"
      className="shrink-0"
    >
      <g transform="translate(40,40)">
        <circle
          cx="130"
          cy="130"
          r="95"
          fill="none"
          stroke="#1D4ED8"
          strokeDasharray="447.7 149.2"
          strokeLinecap="round"
          strokeWidth="16"
        />
        <circle cx="130" cy="35" r="10" fill="#1D4ED8" />
        <path
          d="M62,130 L83,130 L99,89 L118,174 L137,102 L156,130 L200,130"
          fill="none"
          stroke="#0F172A"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="9"
        />
        <circle cx="225" cy="130" r="17" fill="#7C3AED" />
      </g>
    </svg>
  );
}
