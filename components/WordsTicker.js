const words =
  "IMMERSION RÉALISME CARRIÈRE ENTREPRISE JUSTICE ÉCONOMIE COMMUNAUTÉ LOS ANGELES AMBITION HISTOIRE";

function MarqueeLine({ direction }) {
  const isLeft = direction === "left";
  const className = [
    "marquee_marquee__lngSP",
    "words_line__jgq9y",
    "words-ribbon",
    isLeft ? "words_left__tOxob" : "words_right__34B_u",
    isLeft ? "words-ribbon--pink" : "words-ribbon--green",
    isLeft ? "marquee_left__4O2NL" : "marquee_right__CG07l",
  ].join(" ");

  return (
    <div className={className}>
      <div
        className={`marquee_content__iSk20 words-ribbon__track ${
          isLeft ? "words-ribbon__track--left" : "words-ribbon__track--right"
        }`}
      >
        <span>{words}&nbsp;</span>
        <span aria-hidden="true">{words}&nbsp;</span>
      </div>
    </div>
  );
}

export default function WordsTicker() {
  return (
    <div className="words_wrapper__y1PQG">
      <div className="words_words__lqh1s">
        <MarqueeLine direction="left" />
        <MarqueeLine direction="right" />
      </div>
    </div>
  );
}
