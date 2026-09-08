export default function CxLine({ accent = "cyan", className = "", delay = 0, style }) {
  const trace = "M0 138 H150 L234 54 H424";

  return (
    <svg
      className={`cxline cxline--${accent}${className ? ` ${className}` : ""}`}
      style={{ "--cxline-delay": `${delay}s`, ...style }}
      viewBox="0 0 460 189"
      aria-hidden="true"
    >
      {/* trace fantome parallele, en retrait */}
      <path
        className="cxline__ghost"
        d="M0 168 H118 L202 84 H332"
        vectorEffect="non-scaling-stroke"
      />
      {/* trace principale */}
      <path className="cxline__base" d={trace} vectorEffect="non-scaling-stroke" />
      {/* impulsion lumineuse qui parcourt la trace */}
      <path
        className="cxline__pulse"
        d={trace}
        pathLength="100"
        vectorEffect="non-scaling-stroke"
      />
      {/* marqueurs de donnees apres le coude */}
      <g className="cxline__ticks">
        <rect x="252" y="50" width="3" height="9" />
        <rect x="264" y="50" width="3" height="9" />
        <rect x="276" y="50" width="3" height="9" />
      </g>
      {/* noeud losange en bout de trace */}
      <path className="cxline__node" d="M436 54 l9 -7 9 7 -9 7 z" />
    </svg>
  );
}
