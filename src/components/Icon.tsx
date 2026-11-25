/** The brand mark: three connected nodes, drawn as a stroke icon. Decorative only. */
export function NodeIcon() {
  return (
    <svg
      className="brand-icon"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 6h7M7.1 8.2l3.8 7.6M16.9 8.2l-3.8 7.6" />
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="12" cy="18" r="2.5" />
    </svg>
  )
}
