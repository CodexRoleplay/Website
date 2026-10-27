import Image from "next/image";

export default function HeroPalmier() {
  return (
    <div className="palmier_palmier__B3mjd hero_palmier__mPz2Q">
      <div
        style={{
          translate: "none",
          rotate: "none",
          scale: "none",
          transform: "translate3d(0px, 9.2807%, 0px)",
        }}
      >
        <Image
          src="/img/palmier-right.webp"
          alt="Palmier"
          width={1124}
          height={1851}
          sizes="(max-width: 900px) 62vw, 55vw"
          draggable={false}
          unoptimized
          style={{ color: "transparent" }}
        />
      </div>
    </div>
  );
}
