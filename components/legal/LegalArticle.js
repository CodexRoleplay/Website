import Link from "next/link";
import { applyLegalTokens, parseLegalCopy, privacyContactEmail } from "@/lib/legal/content";
import styles from "./legal.module.css";

function text(value) {
  return String(value ?? "").trim();
}

function Inline({ value }) {
  const source = String(value ?? "");
  const pattern = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match = pattern.exec(source);

  while (match) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: source.slice(lastIndex, match.index) });
    }

    parts.push({ type: "link", label: match[1], href: match[2] });
    lastIndex = match.index + match[0].length;
    match = pattern.exec(source);
  }

  if (lastIndex < source.length) {
    parts.push({ type: "text", value: source.slice(lastIndex) });
  }

  return parts.map((part, index) => {
    if (part.type === "text") {
      return <span key={`${index}-${part.value}`}>{part.value}</span>;
    }

    const external = /^https?:\/\//i.test(part.href);

    return (
      <a href={part.href} key={`${index}-${part.href}`} rel={external ? "noopener noreferrer" : undefined} target={external ? "_blank" : undefined}>
        {part.label}
      </a>
    );
  });
}

function Copy({ value, document }) {
  const blocks = parseLegalCopy(applyLegalTokens(value, document));

  if (!blocks.length) {
    return null;
  }

  return blocks.map((block, index) => {
    if (block.type === "list") {
      return (
        <ul key={`list-${index}`}>
          {block.items.map((item) => (
            <li key={`${index}-${item}`}>
              <Inline value={item} />
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={`paragraph-${index}`}>
        <Inline value={block.text} />
      </p>
    );
  });
}

function Fact({ label, value, href }) {
  const cleaned = text(value);

  if (!cleaned) {
    return null;
  }

  const external = href && /^https?:\/\//i.test(href);

  return (
    <p>
      <strong>{label}</strong>
      {href ? (
        <a href={href} rel={external ? "noopener noreferrer" : undefined} target={external ? "_blank" : undefined}>
          {cleaned}
        </a>
      ) : (
        <span>{cleaned}</span>
      )}
    </p>
  );
}

function Heading({ value }) {
  if (!text(value)) {
    return null;
  }

  return <h2>{value}</h2>;
}

function formatUpdatedAt(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

export default function LegalArticle({ kind, document }) {
  const legal = document ?? {};
  const updated = formatUpdatedAt(legal.updatedAt);
  const contactEmail = privacyContactEmail(legal);
  const isMentions = kind === "mentions";
  const hasIdentity = ["editorName", "editorForm", "shareCapital", "address", "email", "phone", "siret", "rcs", "vatNumber"].some((key) => text(legal[key]));

  return (
    <article className={styles.article}>
      <header className={styles.hero}>
        {text(legal.legalEyebrow) ? <span className={styles.eyebrow}>{legal.legalEyebrow}</span> : null}
        <h1>{isMentions ? legal.mentionsTitle : legal.privacyTitle}</h1>
        <Copy document={legal} value={isMentions ? legal.mentionsIntro : legal.privacyIntro} />
        {updated ? <p className={styles.updated}>Mis à jour le {updated}.</p> : null}
      </header>

      {isMentions ? (
        <>
          <section>
            <Heading value={legal.mentionsEditorTitle} />
            {hasIdentity ? (
              <>
                <Fact label="Éditeur" value={legal.editorName} />
                <Fact label="Forme" value={legal.editorForm} />
                <Fact label="Capital" value={legal.shareCapital} />
                <Fact label="Adresse" value={legal.address} />
                <Fact label="E-mail" value={legal.email} href={text(legal.email) ? `mailto:${text(legal.email)}` : ""} />
                <Fact label="Téléphone" value={legal.phone} href={text(legal.phone) ? `tel:${text(legal.phone).replace(/\s+/g, "")}` : ""} />
                <Fact label="SIRET" value={legal.siret} />
                <Fact label="RCS" value={legal.rcs} />
                <Fact label="TVA" value={legal.vatNumber} />
              </>
            ) : (
              <Copy document={legal} value={legal.mentionsEditorEmpty} />
            )}
          </section>

          <section>
            <Heading value={legal.mentionsDirectorTitle} />
            {text(legal.publicationDirector) ? (
              <Fact label="Directeur" value={legal.publicationDirector} />
            ) : (
              <Copy document={legal} value={legal.mentionsDirectorEmpty} />
            )}
          </section>

          <section>
            <Heading value={legal.mentionsHostTitle} />
            <Fact label="Hébergeur" value={legal.hostName} />
            <Fact label="Adresse" value={legal.hostAddress} />
            <Fact label="Téléphone" value={legal.hostPhone} href={text(legal.hostPhone) ? `tel:${text(legal.hostPhone).replace(/\s+/g, "")}` : ""} />
            <Fact label="Site" value={legal.hostWebsite} href={text(legal.hostWebsite)} />
          </section>

          <section>
            <Heading value={legal.mentionsShopTitle} />
            <Copy document={legal} value={legal.mentionsShopBody} />
          </section>

          <section>
            <Heading value={legal.mentionsIpTitle} />
            <Copy document={legal} value={legal.mentionsIpBody} />
          </section>

          <section>
            <Heading value={legal.mentionsContactTitle} />
            {text(legal.email) ? (
              <Fact label="E-mail" value={legal.email} href={`mailto:${text(legal.email)}`} />
            ) : (
              <Copy document={legal} value={legal.mentionsContactEmpty} />
            )}
            <Copy document={legal} value={legal.mentionsNote} />
          </section>
        </>
      ) : (
        <>
          <section>
            <Heading value={legal.privacyControllerTitle} />
            {text(legal.editorName) ? <Fact label="Responsable" value={legal.editorName} /> : null}
            <Fact label="Adresse" value={legal.address} />
            {contactEmail ? (
              <Fact label="Contact" value={contactEmail} href={`mailto:${contactEmail}`} />
            ) : (
              <Copy document={legal} value={legal.privacyControllerEmpty} />
            )}
            {text(legal.dpoName) || text(legal.dpoEmail) ? (
              <>
                <Fact label="Délégué" value={legal.dpoName} />
                <Fact label="E-mail du délégué" value={legal.dpoEmail} href={text(legal.dpoEmail) ? `mailto:${text(legal.dpoEmail)}` : ""} />
              </>
            ) : (
              <Copy document={legal} value={legal.privacyNoDpo} />
            )}
          </section>

          <section>
            <Heading value={legal.privacyDataTitle} />
            <Copy document={legal} value={legal.privacyDataBody} />
          </section>

          <section>
            <Heading value={legal.privacyWhyTitle} />
            <Copy document={legal} value={legal.privacyWhyBody} />
          </section>

          <section>
            <Heading value={legal.privacyRecipientsTitle} />
            <Copy document={legal} value={legal.privacyRecipientsBody} />
          </section>

          <section>
            <Heading value={legal.privacyRetentionTitle} />
            <Fact label={legal.retentionShopLabel || "Achats"} value={legal.retentionShop} />
            <Fact label={legal.retentionBrowserLabel || "Navigateur"} value={legal.retentionBrowser} />
            <Fact label={legal.retentionAdminLabel || "Administration"} value={legal.retentionAdmin} />
          </section>

          <section>
            <Heading value={legal.privacyStorageTitle} />
            <Copy document={legal} value={legal.privacyStorageBody} />
          </section>

          <section>
            <Heading value={legal.privacyRightsTitle} />
            <Copy document={legal} value={legal.privacyRightsBody} />
            {contactEmail ? <Copy document={legal} value={legal.privacyRightsContact} /> : null}
            <Copy document={legal} value={legal.privacyRightsCnil} />
            <Copy document={legal} value={legal.privacyNote} />
          </section>
        </>
      )}

      <p className={styles.switch}>
        <Link href={isMentions ? "/confidentialite" : "/mentions-legales"}>
          {isMentions ? legal.mentionsSwitch : legal.privacySwitch}
        </Link>
      </p>
    </article>
  );
}
