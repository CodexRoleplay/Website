import styles from "./legal.module.css";

export default function SalesFallback() {
  return (
    <article className={styles.article}>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>Informations légales</span>
        <h1>Conditions de vente</h1>
        <p>
          Ces conditions décrivent l’achat des contenus numériques proposés sur la boutique Codex RP.
          Elles s’affichent tant que la page n’a pas été réécrite dans l’administration.
        </p>
      </header>

      <section>
        <h2>Paiement</h2>
        <p>
          Le paiement est opéré par Tebex Limited. Tebex encaisse, facture, délivre les achats et traite les
          demandes de remboursement. Les conditions de Tebex s’appliquent à cette étape.
        </p>
        <p>
          <a href="https://checkout.tebex.io/terms" rel="noopener noreferrer" target="_blank">Conditions Tebex</a>
          {" · "}
          <a href="https://checkout.tebex.io/privacy" rel="noopener noreferrer" target="_blank">Confidentialité Tebex</a>
          {" · "}
          <a href="https://checkout.tebex.io/impressum" rel="noopener noreferrer" target="_blank">Impressum Tebex</a>
        </p>
      </section>

      <section>
        <h2>Livraison</h2>
        <p>
          Les produits sont des contenus numériques liés au compte FiveM utilisé pour la commande. La livraison
          est faite par Tebex après confirmation du paiement.
        </p>
      </section>

      <section>
        <h2>Abonnements</h2>
        <p>
          Un abonnement se renouvelle automatiquement jusqu’à son annulation. Le moyen de paiement enregistré
          pour la commande est débité aux échéances suivantes. L’annulation se fait depuis le lien reçu par
          e-mail, ou depuis l’espace de paiement Tebex.
        </p>
        <p>
          Un code promo éventuel ne concerne que le premier paiement. Il n’est pas reconduit aux renouvellements.
        </p>
      </section>

      <section>
        <h2>Offrir un produit</h2>
        <p>
          Offrir un produit le livre au pseudo FiveM indiqué, pas au pseudo Discord. Un abonnement offert se
          renouvelle comme un abonnement normal : c’est le moyen de paiement de la commande qui est débité,
          pas le joueur qui reçoit le grade.
        </p>
      </section>

      <section>
        <h2>Rétractation</h2>
        <p>
          Les demandes liées à un achat numérique, y compris le droit de rétractation lorsqu’il s’applique,
          sont traitées par Tebex selon ses propres conditions.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          L’identité de l’éditeur et l’adresse de contact figurent dans les <a href="/mentions-legales">mentions légales</a>.
        </p>
      </section>
    </article>
  );
}
