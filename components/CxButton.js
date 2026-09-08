export default function CxButton({ children, href, accent = "cyan", ...props }) {
  return (
    <a className={`cxbtn cxbtn--${accent}`} href={href} {...props}>
      <span className="cxbtn__glass" aria-hidden="true" />
      <span className="cxbtn__edge cxbtn__edge--top" aria-hidden="true" />
      <span className="cxbtn__edge cxbtn__edge--bottom" aria-hidden="true" />
      <svg
        className="cxbtn__tip cxbtn__tip--left"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polyline points="99.5,0.5 0.5,50 99.5,99.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <svg
        className="cxbtn__tip cxbtn__tip--right"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polyline points="0.5,0.5 99.5,50 0.5,99.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="cxbtn__label" data-text={children}>
        <span>{children}</span>
      </span>
    </a>
  );
}
