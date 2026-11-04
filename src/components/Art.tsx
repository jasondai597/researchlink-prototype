/**
 * Original illustrations for ResearchLink. Colours come from CSS variables
 * (see .art-* classes in index.css) so they follow light and dark mode.
 * No university logos, crests or wordmarks: the campus building and skyline are
 * generic shapes.
 */

/** Hero: a lab bench with the helper robot, in front of a Toronto-style skyline. */
export function HeroArt() {
  return (
    <svg className="art hero-art" viewBox="0 0 720 230" role="img" aria-labelledby="hero-art-title">
      <title id="hero-art-title">A small robot at a lab bench with a microscope, flasks and a chart, in front of a campus and city skyline</title>

      {/* skyline */}
      <g className="art-sky">
        {/* collegiate building: two towers, gable, arched windows */}
        <path d="M28 160V96h22V78l6-8 6 8v18h40V86l16-14 16 14v10h40V78l6-8 6 8v18h22v64z" />
        <g className="art-sky-cut">
          <path d="M60 160v-30a8 8 0 0 1 16 0v30z" />
          <path d="M92 160v-30a8 8 0 0 1 16 0v30z" />
          <path d="M126 160v-42a12 12 0 0 1 24 0v42z" />
          <path d="M168 160v-30a8 8 0 0 1 16 0v30z" />
          <path d="M200 160v-30a8 8 0 0 1 16 0v30z" />
          <circle cx="138" cy="94" r="7" />
        </g>
        {/* city blocks */}
        <rect x="262" y="118" width="30" height="42" />
        <rect x="296" y="104" width="24" height="56" />
        <rect x="324" y="126" width="34" height="34" />
        <rect x="520" y="112" width="28" height="48" />
        <rect x="552" y="96" width="22" height="64" />
        <rect x="630" y="108" width="30" height="52" />
        <rect x="664" y="124" width="36" height="36" />
        {/* needle tower */}
        <path d="M603 160 L607 52 L605 52 L606 14 L607 52 L609 52 L613 160z" />
        <ellipse cx="608" cy="66" rx="11" ry="6" />
        <rect x="604" y="80" width="8" height="4" rx="2" />
      </g>

      {/* bench */}
      <rect className="art-ink" x="20" y="170" width="680" height="9" rx="3" />
      <rect className="art-ink" x="60" y="179" width="8" height="40" />
      <rect className="art-ink" x="652" y="179" width="8" height="40" />

      {/* microscope */}
      <g className="art-line" transform="translate(92 100)">
        <path d="M6 70h44" />
        <path d="M18 70v-8h20v8" />
        <path d="M28 62V40" />
        <path d="M14 14l22 22" strokeWidth="9" strokeLinecap="round" />
        <path d="M10 6l8 8" />
        <path d="M22 48h20" />
        <path d="M40 30c10 6 12 20 6 32" />
      </g>

      {/* flasks */}
      <g transform="translate(176 118)">
        <path className="art-glass" d="M10 0h14v16l14 30a6 6 0 0 1-5 6H1a6 6 0 0 1-5-6l14-30z" />
        <path className="art-liquid-green" d="M3 36h28l5 10a4 4 0 0 1-3 5H1a4 4 0 0 1-3-5z" />
        <circle className="art-bubble" cx="14" cy="28" r="2.5" />
        <circle className="art-bubble" cx="20" cy="22" r="1.8" />
      </g>
      <g transform="translate(226 132)">
        <rect className="art-glass" x="0" y="0" width="12" height="38" rx="6" />
        <rect className="art-liquid-amber" x="2" y="18" width="8" height="18" rx="4" />
      </g>

      {/* notebook + papers */}
      <g transform="translate(258 148)">
        <rect className="art-paper" x="0" y="8" width="56" height="14" rx="2" />
        <rect className="art-paper" x="4" y="0" width="56" height="12" rx="2" />
        <path className="art-line-thin" d="M12 6h30" />
      </g>

      {/* robot */}
      <Robot x={350} y={40} scale={1.12} pose="clipboard" />

      {/* monitor with chart */}
      <g transform="translate(484 92)">
        <rect className="art-screen" x="0" y="0" width="120" height="72" rx="6" />
        <rect className="art-band-strong" x="16" y="38" width="14" height="22" rx="2" />
        <rect className="art-band-possible" x="38" y="24" width="14" height="36" rx="2" />
        <rect className="art-band-stretch" x="60" y="44" width="14" height="16" rx="2" />
        <rect className="art-band-strong" x="82" y="16" width="14" height="44" rx="2" />
        <rect className="art-ink" x="54" y="72" width="12" height="6" />
        <rect className="art-ink" x="40" y="76" width="40" height="4" rx="2" />
      </g>

      {/* potted plant */}
      <g transform="translate(620 128)">
        <path className="art-leaf" d="M14 20C2 16 0 4 4 0c8 4 12 12 10 20z" />
        <path className="art-leaf" d="M16 20c8-8 18-8 22-4-4 8-14 10-22 4z" />
        <path className="art-pot" d="M4 20h28l-4 22H8z" />
      </g>
    </svg>
  )
}

type Pose = 'clipboard' | 'search' | 'calendar' | 'wave'

/** The helper robot. Rendered inside another SVG (x/y/scale) or standalone via RobotSpot. */
export function Robot({ x = 0, y = 0, scale = 1, pose = 'wave' }: { x?: number; y?: number; scale?: number; pose?: Pose }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* antenna */}
      <path className="art-line" d="M50 8v14" />
      <circle className="art-band-possible" cx="50" cy="6" r="6" />
      {/* head */}
      <rect className="art-robot" x="22" y="22" width="56" height="44" rx="14" />
      <rect className="art-face" x="30" y="32" width="40" height="24" rx="10" />
      <circle className="art-eye" cx="42" cy="44" r="4" />
      <circle className="art-eye" cx="58" cy="44" r="4" />
      <path className="art-smile" d="M44 51q6 4 12 0" />
      {/* body */}
      <rect className="art-robot" x="28" y="70" width="44" height="40" rx="10" />
      <circle className="art-band-strong" cx="50" cy="86" r="5" />
      {/* arms by pose */}
      {pose === 'clipboard' && (
        <>
          <path className="art-arm" d="M30 80c-12 4-16 14-14 22" />
          <g transform="translate(72 64) rotate(8)">
            <rect className="art-paper" x="0" y="0" width="34" height="44" rx="3" />
            <rect className="art-ink" x="11" y="-3" width="12" height="6" rx="2" />
            <path className="art-check" d="M6 13l3 3 6-6" />
            <path className="art-line-thin" d="M19 13h10" />
            <path className="art-check" d="M6 25l3 3 6-6" />
            <path className="art-line-thin" d="M19 25h10" />
            <circle className="art-gap" cx="10" cy="36" r="3.5" />
            <path className="art-line-thin" d="M19 36h10" />
          </g>
          <path className="art-arm" d="M70 80c6 2 8 4 8 8" />
        </>
      )}
      {pose === 'search' && (
        <>
          <path className="art-arm" d="M30 80c-12 4-16 14-14 22" />
          <path className="art-arm" d="M70 80c10-2 16-8 18-16" />
          <circle className="art-lens" cx="94" cy="50" r="13" />
          <path className="art-line" d="M85 60l-6 8" strokeWidth="5" />
        </>
      )}
      {pose === 'calendar' && (
        <>
          <path className="art-arm" d="M30 80c-12 4-16 14-14 22" />
          <path className="art-arm" d="M70 82c8 0 12 4 14 10" />
          <g transform="translate(76 58)">
            <rect className="art-paper" x="0" y="6" width="34" height="32" rx="4" />
            <rect className="art-band-stretch" x="0" y="6" width="34" height="9" rx="3" />
            <rect className="art-ink" x="7" y="2" width="3" height="8" rx="1.5" />
            <rect className="art-ink" x="24" y="2" width="3" height="8" rx="1.5" />
            <path className="art-check" d="M10 26l4 4 9-9" />
          </g>
        </>
      )}
      {pose === 'wave' && (
        <>
          <path className="art-arm" d="M30 80c-12 4-16 14-14 22" />
          <path className="art-arm" d="M70 80c10-4 14-14 12-24" />
        </>
      )}
    </g>
  )
}

/** A small standalone robot for headers and empty states. Decorative. */
export function RobotSpot({ pose, className = '' }: { pose: Pose; className?: string }) {
  return (
    <svg className={`art robot-spot ${className}`} viewBox="0 0 120 116" aria-hidden="true">
      <Robot pose={pose} />
    </svg>
  )
}

/** Robot mark for the top bar. */
export function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
      <path className="art-line" d="M16 3v5" />
      <circle className="art-band-possible" cx="16" cy="3" r="2.6" />
      <rect className="art-robot" x="4" y="8" width="24" height="20" rx="7" />
      <rect className="art-face" x="8" y="12" width="16" height="11" rx="5" />
      <circle className="art-eye" cx="13" cy="17.5" r="1.8" />
      <circle className="art-eye" cx="19" cy="17.5" r="1.8" />
    </svg>
  )
}
