import ContentBlocks from "@/components/reglement/ContentBlocks";
import styles from "./legal.module.css";

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

export default function LegalBlocksArticle({ title, blocks, updatedAt }) {
  const updated = formatUpdatedAt(updatedAt);

  return (
    <article className={styles.article}>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>Informations légales</span>
        <h1>{title}</h1>
        {updated ? <p className={styles.updated}>Mis à jour le {updated}.</p> : null}
      </header>
      <ContentBlocks blocks={blocks} prose variant="legal" />
    </article>
  );
}
