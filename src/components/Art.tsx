/**
 * Original illustrations for ResearchLink. Colours come from CSS variables
 * (see .art-* classes in index.css) so they follow light and dark mode.
 * No university logos, crests or wordmarks: the campus building and skyline are
 * generic shapes.
 */

/**
 * Full-width dusk skyline behind the hero. Silhouettes are simplified and loosely
 * inspired by (left to right) Soldiers' Tower, University College, Convocation Hall,
 * Robarts Library and the Schwartz Reisman Innovation Campus (home of the Vector
 * Institute), with the CN Tower in the distance. Lit windows stand in for detail.
 * Decorative: the hero text carries the meaning.
 */
export function SkylineArt() {
  return (
    <svg className="skyline" viewBox="0 0 1600 280" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      {/* distant city */}
      <g className="sky-far">
        <rect x="0" y="214" width="70" height="66" />
        <rect x="78" y="188" width="46" height="92" />
        <rect x="132" y="226" width="64" height="54" />
        <rect x="210" y="200" width="40" height="80" />
        <rect x="1120" y="196" width="52" height="84" />
        <rect x="1180" y="170" width="36" height="110" />
        <rect x="1290" y="186" width="58" height="94" />
        <rect x="1356" y="210" width="44" height="70" />
        <rect x="1410" y="176" width="40" height="104" />
        <rect x="1460" y="218" width="70" height="62" />
        <rect x="1540" y="196" width="60" height="84" />
        <path d="M1238 280 L1243 92 L1240.5 92 L1242.5 24 L1244.5 92 L1242 92 L1247 280z" />
        <ellipse cx="1242.5" cy="112" rx="15" ry="8" />
        <rect x="1236" y="132" width="13" height="5" rx="2.5" />
      </g>

      {/* campus */}
      <g className="sky-near">
        {/* framing blocks */}
        <rect x="262" y="232" width="70" height="48" />
        <rect x="340" y="218" width="54" height="62" />
        <rect x="1104" y="228" width="80" height="52" />
        {/* Soldiers' Tower */}
        <path d="M410 280V104h5v-12h6v12h7v-7h5v7h7v-12h6v12h5V280z" />
        {/* University College */}
        <path d="M466 280V206l18-14 18 14h56v-58h3l22-30 22 30h3v58h56l18-14 18 14V280z" />
        {/* Convocation Hall */}
        <path d="M728 280V208h6a52 46 0 0 1 104 0h6V280z" />
        <rect x="780" y="150" width="12" height="18" rx="3" />
        <path d="M752 280V232l34-20 34 20V280z" />
        {/* Robarts Library */}
        <path d="M880 280 L898 196 L930 156 L962 196 L980 280z" />
        {/* Schwartz Reisman Innovation Campus (Vector Institute) */}
        <path d="M1004 280V126l40-12 42 12V280z" />
      </g>

      {/* lit windows */}
      <g className="sky-window">
        <rect x="419" y="120" width="4" height="12" rx="2" />
        <rect x="428" y="120" width="4" height="12" rx="2" />
        <rect x="437" y="120" width="4" height="12" rx="2" />
        <path d="M480 262v-20a6 6 0 0 1 12 0v20z" />
        <path d="M508 262v-20a6 6 0 0 1 12 0v20z" />
        <path d="M536 262v-20a6 6 0 0 1 12 0v20z" />
        <path d="M572 280v-34a11 11 0 0 1 22 0v34z" opacity="0.55" />
        <rect x="578" y="166" width="10" height="16" rx="5" />
        <path d="M618 262v-20a6 6 0 0 1 12 0v20z" />
        <path d="M646 262v-20a6 6 0 0 1 12 0v20z" />
        <path d="M674 262v-20a6 6 0 0 1 12 0v20z" />
        <rect x="764" y="240" width="5" height="40" opacity="0.6" />
        <rect x="778" y="240" width="5" height="40" opacity="0.6" />
        <rect x="792" y="240" width="5" height="40" opacity="0.6" />
        <rect x="806" y="240" width="5" height="40" opacity="0.6" />
        <rect x="900" y="214" width="60" height="3" />
        <rect x="895" y="232" width="70" height="3" />
        <rect x="890" y="250" width="80" height="3" />
        <rect x="1004" y="156" width="50" height="7" opacity="0.7" />
        <rect x="1036" y="188" width="50" height="7" opacity="0.7" />
        <rect x="1004" y="220" width="60" height="7" opacity="0.7" />
        <rect x="1024" y="252" width="62" height="7" opacity="0.7" />
      </g>
    </svg>
  )
}

/** Hero foreground: the lab bench with the helper robot. Decorative. */
export function BenchArt() {
  return (
    <svg className="art bench-art" viewBox="0 110 760 190" aria-hidden="true">
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
