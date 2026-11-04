/**
 * Original illustrations for ResearchLink. Colours come from CSS variables
 * (see .art-* classes in index.css) so they follow light and dark mode.
 * No university logos, crests or wordmarks: the campus building and skyline are
 * generic shapes.
 */

/**
 * Hero: a lab bench with the helper robot, in front of a St. George campus skyline.
 * Silhouettes are simplified and loosely inspired by (left to right) Soldiers' Tower,
 * University College, Convocation Hall, Robarts Library and the Schwartz Reisman
 * Innovation Campus (home of the Vector Institute), with the CN Tower behind.
 * Drawn for the navy hero band; colours come from CSS variables set on .hero-band.
 */
export function HeroArt() {
  return (
    <svg className="art hero-art" viewBox="0 22 760 278" role="img" aria-labelledby="hero-art-title">
      <title id="hero-art-title">
        A small robot at a lab bench with a microscope, flasks and a chart, in front of a skyline of University of Toronto
        campus buildings and the CN Tower
      </title>

      {/* far layer: city and CN Tower */}
      <g className="art-sky-far">
        <rect x="604" y="196" width="26" height="54" />
        <rect x="686" y="182" width="30" height="68" />
        <rect x="720" y="204" width="36" height="46" />
        <path d="M700 250 L704 92 L702 92 L703.5 30 L705 92 L703 92 L707 250z" transform="translate(-2 0)" />
        <ellipse cx="703" cy="108" rx="12" ry="6.5" />
        <rect x="698" y="124" width="10" height="4" rx="2" />
      </g>

      {/* near layer: campus */}
      <g className="art-sky">
        {/* Soldiers' Tower */}
        <path d="M30 250V98h4v-10h5v10h6v-6h4v6h6v-10h5v10h4V250z" />
        {/* University College: wings, gables and central tower */}
        <path d="M76 250V186l14-12 14 12h44v-48h2l18-26 18 26h2v48h44l14-12 14 12V250z" />
        {/* Convocation Hall: drum, dome, lantern, portico */}
        <path d="M296 250V180h4a44 40 0 0 1 80 0h4V250z" />
        <rect x="335" y="128" width="10" height="14" rx="2" />
        <path d="M314 250V204l26-16 26 16V250z" />
        {/* Robarts Library */}
        <path d="M520 250 L534 176 L560 142 L586 176 L600 250z" />
        {/* Schwartz Reisman Innovation Campus (Vector Institute): faceted tower */}
        <path d="M614 250V114l30-10 32 10V250z" />
      </g>

      {/* window and detail cut-outs, drawn in the band colour */}
      <g className="art-sky-cut">
        <rect x="38" y="112" width="4" height="14" rx="2" />
        <rect x="46" y="112" width="4" height="14" rx="2" />
        <rect x="54" y="112" width="4" height="14" rx="2" />
        <path d="M86 230v-18a5 5 0 0 1 10 0v18z" />
        <path d="M108 230v-18a5 5 0 0 1 10 0v18z" />
        <path d="M130 230v-18a5 5 0 0 1 10 0v18z" />
        <path d="M162 250v-30a8 8 0 0 1 16 0v30z" />
        <rect x="166" y="150" width="8" height="14" rx="4" />
        <path d="M200 230v-18a5 5 0 0 1 10 0v18z" />
        <path d="M222 230v-18a5 5 0 0 1 10 0v18z" />
        <path d="M244 230v-18a5 5 0 0 1 10 0v18z" />
        <rect x="322" y="210" width="4" height="40" />
        <rect x="334" y="210" width="4" height="40" />
        <rect x="346" y="210" width="4" height="40" />
        <rect x="358" y="210" width="4" height="40" />
        <rect x="532" y="190" width="56" height="3" />
        <rect x="528" y="206" width="64" height="3" />
        <rect x="524" y="222" width="72" height="3" />
        {/* staggered "winter garden" bands */}
        <rect x="614" y="140" width="38" height="7" />
        <rect x="640" y="168" width="36" height="7" />
        <rect x="614" y="196" width="46" height="7" />
        <rect x="630" y="224" width="46" height="7" />
      </g>

      {/* bench */}
      <rect className="art-ink" x="16" y="250" width="728" height="8" rx="3" />
      <rect className="art-ink" x="56" y="258" width="7" height="42" />
      <rect className="art-ink" x="697" y="258" width="7" height="42" />

      {/* microscope */}
      <g className="art-line" transform="translate(66 180)">
        <path d="M6 70h44" />
        <path d="M18 70v-8h20v8" />
        <path d="M28 62V40" />
        <path d="M14 14l22 22" strokeWidth="9" strokeLinecap="round" />
        <path d="M10 6l8 8" />
        <path d="M22 48h20" />
        <path d="M40 30c10 6 12 20 6 32" />
      </g>

      {/* flasks */}
      <g transform="translate(150 198)">
        <path className="art-glass" d="M10 0h14v16l14 30a6 6 0 0 1-5 6H1a6 6 0 0 1-5-6l14-30z" />
        <path className="art-liquid-green" d="M3 36h28l5 10a4 4 0 0 1-3 5H1a4 4 0 0 1-3-5z" />
        <circle className="art-bubble" cx="14" cy="28" r="2.5" />
        <circle className="art-bubble" cx="20" cy="22" r="1.8" />
      </g>
      <g transform="translate(202 212)">
        <rect className="art-glass" x="0" y="0" width="12" height="38" rx="6" />
        <rect className="art-liquid-amber" x="2" y="18" width="8" height="18" rx="4" />
      </g>

      {/* notebook */}
      <g transform="translate(232 228)">
        <rect className="art-paper" x="0" y="8" width="56" height="14" rx="2" />
        <rect className="art-paper" x="4" y="0" width="56" height="12" rx="2" />
      </g>

      <Robot x={398} y={120} scale={1.12} pose="clipboard" />

      {/* monitor */}
      <g transform="translate(524 172)">
        <rect className="art-screen" x="0" y="0" width="112" height="70" rx="6" />
        <rect className="art-band-strong" x="16" y="36" width="12" height="22" rx="2" />
        <rect className="art-band-possible" x="36" y="22" width="12" height="36" rx="2" />
        <rect className="art-band-stretch" x="56" y="42" width="12" height="16" rx="2" />
        <rect className="art-band-strong" x="76" y="14" width="12" height="44" rx="2" />
        <rect className="art-ink" x="50" y="70" width="12" height="6" />
        <rect className="art-ink" x="36" y="74" width="40" height="4" rx="2" />
      </g>

      {/* plant */}
      <g transform="translate(664 208)">
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
