import Link from "next/link";
import { privacyContactEmail } from "@/lib/legal/content";
import styles from "./legal.module.css";

function text(value) {
  const cleaned = String(value ?? "").trim();
  return cleaned || "";
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

function Note({ value }) {
  const cleaned = text(value);

  if (!cleaned) {
    return null;
  }

  return cleaned.split("\n").filter(Boolean).map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>);
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
        <span className={styles.eyebrow}>Informations légales</span>
        <h1>{isMentions ? "Mentions légales" : "Politique de confidentialité"}</h1>
        <p>
          {isMentions
            ? "Informations exigées pour l'édition du site Codex RP et pour la boutique."
            : "Informations sur les données utilisées par le site Codex RP, la boutique et le panel admin."}
        </p>
        {updated ? <p className={styles.updated}>Mis à jour le {updated}.</p> : null}
      </header>

      {isMentions ? (
        <>
          <section>
            <h2>Éditeur du site</h2>
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
              <p>L&apos;identité de l&apos;éditeur sera publiée dès qu&apos;elle aura été renseignée.</p>
            )}
          </section>

          <section>
            <h2>Directeur de la publication</h2>
            {text(legal.publicationDirector) ? (
              <Fact label="Directeur" value={legal.publicationDirector} />
            ) : (
              <p>Le directeur de la publication sera nommé dès que cette information aura été renseignée.</p>
            )}
          </section>

          <section>
            <h2>Hébergement</h2>
            <Fact label="Hébergeur" value={legal.hostName} />
            <Fact label="Adresse" value={legal.hostAddress} />
            <Fact label="Téléphone" value={legal.hostPhone} href={text(legal.hostPhone) ? `tel:${text(legal.hostPhone).replace(/\s+/g, "")}` : ""} />
            <Fact label="Site" value={legal.hostWebsite} href={text(legal.hostWebsite)} />
          </section>

          <section>
            <h2>Boutique et paiement</h2>
            <p>
              Le paiement de la boutique est opéré par Tebex Limited. Tebex assure l&apos;encaissement,
              la facturation, la délivrance des achats et les demandes de remboursement. Les conditions
              de Tebex s&apos;appliquent à cette étape.
            </p>
            <p>
              <a href="https://checkout.tebex.io/terms" rel="noopener noreferrer" target="_blank">Conditions Tebex</a>
              <span aria-hidden="true"> · </span>
              <a href="https://checkout.tebex.io/privacy" rel="noopener noreferrer" target="_blank">Confidentialité Tebex</a>
              <span aria-hidden="true"> · </span>
              <a href="https://checkout.tebex.io/impressum" rel="noopener noreferrer" target="_blank">Impressum Tebex</a>
            </p>
          </section>

          <section>
            <h2>Propriété intellectuelle</h2>
            <p>
              Les textes, visuels et éléments propres à Codex RP sont protégés. Toute réutilisation
              demande une autorisation préalable de l&apos;éditeur, en dehors des courtes citations
              accompagnées de leur source.
            </p>
            <p>
              Codex RP est un serveur roleplay indépendant. Il n&apos;est ni approuvé, ni sponsorisé,
              ni affilié à Rockstar Games ou Take-Two Interactive.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            {text(legal.email) ? (
              <Fact label="E-mail" value={legal.email} href={`mailto:${text(legal.email)}`} />
            ) : (
              <p>L&apos;adresse de contact sera publiée avec l&apos;identité de l&apos;éditeur.</p>
            )}
            <Note value={legal.mentionsNote} />
          </section>
        </>
      ) : (
        <>
          <section>
            <h2>Responsable du traitement</h2>
            {text(legal.editorName) ? <Fact label="Responsable" value={legal.editorName} /> : null}
            <Fact label="Adresse" value={legal.address} />
            {contactEmail ? (
              <Fact label="Contact" value={contactEmail} href={`mailto:${contactEmail}`} />
            ) : (
              <p>L&apos;adresse pour exercer tes droits sera publiée avec l&apos;identité de l&apos;éditeur.</p>
            )}
            {text(legal.dpoName) || text(legal.dpoEmail) ? (
              <>
                <Fact label="Délégué" value={legal.dpoName} />
                <Fact label="E-mail du délégué" value={legal.dpoEmail} href={text(legal.dpoEmail) ? `mailto:${text(legal.dpoEmail)}` : ""} />
              </>
            ) : (
              <p>Aucun délégué à la protection des données n&apos;est désigné.</p>
            )}
          </section>

          <section>
            <h2>Données utilisées</h2>
            <ul>
              <li>Le pseudo FiveM et l&apos;identifiant Discord, lorsque tu relies ces comptes pour acheter.</li>
              <li>L&apos;identifiant du panier Tebex, conservé dans le navigateur pour retrouver ta commande.</li>
              <li>L&apos;e-mail et l&apos;identifiant des comptes autorisés à ouvrir le panel admin.</li>
              <li>Les messages techniques nécessaires à la sécurité du site et du paiement.</li>
            </ul>
            <p>Le site ne demande pas de créer un compte joueur et n&apos;utilise pas de mesure d&apos;audience.</p>
          </section>

          <section>
            <h2>Pourquoi ces données</h2>
            <ul>
              <li>Relier un achat au bon compte FiveM et Discord, pour exécuter la commande.</li>
              <li>Afficher le panier et rouvrir la fenêtre de paiement Tebex.</li>
              <li>Limiter le panel d&apos;administration aux personnes autorisées.</li>
              <li>Répondre à une demande envoyée à l&apos;adresse de contact.</li>
            </ul>
          </section>

          <section>
            <h2>Qui les reçoit</h2>
            <ul>
              <li>Tebex Limited, pour le paiement, la facturation et la délivrance des achats.</li>
              <li>Discord, lorsque tu choisis de relier ton compte à la boutique.</li>
              <li>Google Firebase, pour les comptes autorisés à administrer le site.</li>
              <li>{text(legal.hostName) || "L'hébergeur du site"}, pour l'affichage des pages.</li>
            </ul>
            <p>
              Tebex, l&apos;hébergeur et Firebase peuvent traiter certaines données hors de l&apos;Union
              européenne. Le paiement reste soumis à la politique de confidentialité de Tebex.
            </p>
          </section>

          <section>
            <h2>Durées de conservation</h2>
            <Fact label="Achats" value={legal.retentionShop} />
            <Fact label="Navigateur" value={legal.retentionBrowser} />
            <Fact label="Administration" value={legal.retentionAdmin} />
          </section>

          <section>
            <h2>Stockage dans le navigateur</h2>
            <p>
              Le site enregistre dans ton navigateur l&apos;identifiant de panier, le compte Discord
              relié et la position de lecture de certaines pages. Ces données servent uniquement à
              faire fonctionner la boutique et la navigation. Aucun cookie publicitaire n&apos;est déposé
              par Codex RP.
            </p>
            <p>
              La fenêtre de paiement Tebex peut déposer ses propres cookies. Ils sont décrits par Tebex.
            </p>
          </section>

          <section>
            <h2>Tes droits</h2>
            <p>
              Tu peux demander l&apos;accès à tes données, leur rectification, leur effacement, la
              limitation de leur utilisation, ou t&apos;opposer à un traitement fondé sur l&apos;intérêt
              légitime. Tu peux aussi récupérer les données que tu as fournies, lorsque ce droit
              s&apos;applique.
            </p>
            {contactEmail ? (
              <p>
                Écris à <a href={`mailto:${contactEmail}`}>{contactEmail}</a> en précisant ta demande.
                Une réponse est apportée dans un délai d&apos;un mois.
              </p>
            ) : null}
            <p>
              Tu peux aussi saisir la CNIL :{" "}
              <a href="https://www.cnil.fr" rel="noopener noreferrer" target="_blank">www.cnil.fr</a>.
            </p>
            <Note value={legal.privacyNote} />
          </section>
        </>
      )}

      <p className={styles.switch}>
        <Link href={isMentions ? "/confidentialite" : "/mentions-legales"}>
          {isMentions ? "Lire la politique de confidentialité" : "Lire les mentions légales"}
        </Link>
      </p>
    </article>
  );
}
