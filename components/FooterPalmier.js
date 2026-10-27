import Image from "next/image";

export default function FooterPalmier() {
  return (
    <div className="palmier_palmier__B3mjd footer_palmier__V7OiI">
      <div
        style={{
          translate: "none",
          rotate: "none",
          scale: "none",
          transform: "translate(0px, 22%)",
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
