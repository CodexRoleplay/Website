export const ruleCategories = [
  {
    id: "bases-rp",
    title: "Les bases du RP",
    icon: "book",
    summary: "Les notions essentielles pour jouer proprement sur Codex RP.",
    sections: [
      {
        id: "principes",
        icon: "book",
        title: "Principes fondamentaux du RP à connaître",
        rules: [
          {
            title: "Metagaming",
            icon: "search",
            description:
              "Se servir d'informations obtenues en dehors du jeu, que ce soit via Discord, des amis ou un stream, pour influencer votre comportement en jeu est interdit.",
          },
          {
            title: "Freekill",
            icon: "weapon",
            description:
              "Abattre un autre joueur sans motif légitime est formellement interdit. Les querelles ou insultes ne constituent pas une raison suffisante pour tuer quelqu'un.",
          },
          {
            title: "Force RP",
            icon: "handshake",
            description:
              "Ne pas obliger d'autres joueurs à s'engager dans une situation RP spécifique pendant longtemps, surtout si cela les met mal à l'aise.",
          },
          {
            title: "NoFear",
            icon: "alert",
            description:
              "Dans des situations où la peur devrait naturellement s'exprimer, comme face à une arme à feu, il est important de réagir de manière appropriée et réaliste.",
          },
        ],
      },
      {
        id: "actions-inappropriees",
        icon: "warning",
        title: "Actions inappropriées au sein du serveur",
        rules: [
          {
            title: "Powergaming",
            icon: "bolt",
            description:
              "Réaliser des actions irréalistes, impossibles ou abusives pour forcer l'issue d'une scène n'est pas autorisé.",
          },
          {
            title: "Retour sur zone",
            icon: "loop",
            description:
              "Après une scène terminée par une mort ou une évacuation, revenir immédiatement sur les lieux pour reprendre l'avantage est interdit.",
          },
        ],
      },
      {
        id: "armes-objets",
        icon: "case",
        title: "Arnaques, vols et prêts d'armes",
        rules: [
          {
            title: "Prêts encadrés",
            icon: "shield",
            description:
              "Les prêts d'armes, d'argent ou de véhicules doivent rester cohérents et assumés en RP. Les abus volontaires pourront être sanctionnés.",
          },
        ],
      },
      {
        id: "coma",
        icon: "stop",
        title: "Déconnexion et état de coma",
        rules: [
          {
            title: "Déconnexion en scène",
            icon: "power",
            description:
              "Quitter volontairement le serveur pour éviter une scène, une arrestation ou une perte est interdit. Prévenez le staff en cas de souci technique.",
          },
        ],
      },
      {
        id: "alterations",
        icon: "screen",
        title: "Modifications et altérations du jeu",
        rules: [
          {
            title: "Avantage logiciel",
            icon: "screen",
            description:
              "Tout logiciel, fichier ou réglage donnant un avantage injuste est interdit. Les modifications visuelles doivent rester purement cosmétiques.",
          },
        ],
      },
      {
        id: "otages",
        icon: "siren",
        title: "Règles pour les prises d'otages et rendez-vous",
        rules: [
          {
            title: "Scènes négociées",
            icon: "chat",
            description:
              "Les prises d'otages doivent créer du jeu pour tous les participants. Les demandes abusives ou impossibles seront refusées.",
          },
        ],
      },
      {
        id: "zones-safe",
        icon: "globe",
        title: "Comportement dans les zones safes",
        rules: [
          {
            title: "Respect des zones",
            icon: "pin",
            description:
              "Les zones safes ne doivent pas être utilisées pour fuir une scène active ou provoquer sans conséquence.",
          },
        ],
      },
    ],
  },
  {
    id: "reglement-legal",
    title: "Règlement légal",
    icon: "building",
    summary: "Cadre de jeu pour citoyens, institutions et scènes publiques.",
    sections: [
      {
        id: "citoyens",
        icon: "building",
        title: "Vie civile et interactions légales",
        rules: [
          {
            title: "Cohérence civile",
            icon: "document",
            description:
              "Votre identité, votre métier et vos actions doivent rester cohérents avec votre personnage et son évolution.",
          },
          {
            title: "Respect des scènes",
            icon: "handshake",
            description:
              "Les interactions légales doivent laisser une vraie place à la discussion, aux preuves et aux conséquences RP.",
          },
        ],
      },
      {
        id: "justice",
        icon: "shield",
        title: "Justice et procédures",
        rules: [
          {
            title: "Procédure lisible",
            icon: "case",
            description:
              "Les scènes de justice doivent être compréhensibles, documentées et ne pas se transformer en blocage hors RP.",
          },
        ],
      },
    ],
  },
  {
    id: "services-publics",
    title: "Gouvernement & Services publics",
    icon: "badge",
    summary: "Règles pour les services d'État, EMS, police et institutions.",
    sections: [
      {
        id: "services",
        icon: "badge",
        title: "Tenue des services publics",
        rules: [
          {
            title: "Neutralité",
            icon: "shield",
            description:
              "Les services publics doivent privilégier la cohérence, la neutralité et la continuité du jeu pour tous.",
          },
          {
            title: "Abus de fonction",
            icon: "warning",
            description:
              "Utiliser un poste public pour favoriser un groupe, obtenir un avantage personnel ou bloquer une scène est interdit.",
          },
        ],
      },
    ],
  },
  {
    id: "entreprises",
    title: "Entreprises",
    icon: "office",
    summary: "Création, gestion, recrutement et activité économique.",
    sections: [
      {
        id: "gestion",
        icon: "office",
        title: "Gestion d'entreprise",
        rules: [
          {
            title: "Activité réelle",
            icon: "document",
            description:
              "Une entreprise doit générer du jeu, recruter avec cohérence et maintenir une activité régulière.",
          },
          {
            title: "Comptabilité RP",
            icon: "case",
            description:
              "Les transactions importantes doivent pouvoir être justifiées dans un contexte RP crédible.",
          },
        ],
      },
    ],
  },
  {
    id: "reglement-illegal",
    title: "Règlement illégal",
    icon: "forbidden",
    summary: "Organisation, braquages, tensions et limites des scènes illégales.",
    sections: [
      {
        id: "organisations",
        icon: "forbidden",
        title: "Cadre des activités illégales",
        rules: [
          {
            title: "Progression",
            icon: "bolt",
            description:
              "Une organisation illégale doit construire son influence progressivement et éviter les actions sans préparation RP.",
          },
          {
            title: "Conflits",
            icon: "weapon",
            description:
              "Les conflits doivent avoir une origine lisible, des temps morts et des possibilités de négociation.",
          },
        ],
      },
    ],
  },
  {
    id: "convoi-illegal",
    title: "Convoi illégal",
    icon: "car",
    summary: "Règles de préparation, interception et poursuite des convois.",
    sections: [
      {
        id: "convois",
        icon: "car",
        title: "Organisation des convois",
        rules: [
          {
            title: "Préparation",
            icon: "pin",
            description:
              "Un convoi doit être annoncé ou préparé selon les règles staff en vigueur, avec un objectif RP clair.",
          },
          {
            title: "Interception",
            icon: "siren",
            description:
              "Les interceptions doivent laisser une chance de réaction et éviter les blocages impossibles à jouer.",
          },
        ],
      },
    ],
  },
  {
    id: "reglement-cayo",
    title: "Règlement Cayo",
    icon: "island",
    summary: "Règles propres aux scènes, groupes et activités sur Cayo.",
    sections: [
      {
        id: "cayo",
        icon: "island",
        title: "Activités sur Cayo",
        rules: [
          {
            title: "Accès et logique RP",
            icon: "globe",
            description:
              "Les déplacements vers Cayo doivent être justifiés et ne pas servir à contourner les règles du continent.",
          },
        ],
      },
    ],
  },
  {
    id: "creation-dossiers",
    title: "Création de dossiers",
    icon: "folder",
    summary: "Dossiers joueurs, organisations, entreprises et demandes staff.",
    sections: [
      {
        id: "dossiers",
        icon: "folder",
        title: "Dossiers et demandes",
        rules: [
          {
            title: "Clarté",
            icon: "document",
            description:
              "Un dossier doit présenter des objectifs simples, des responsables identifiés et une cohérence avec le serveur.",
          },
          {
            title: "Suivi",
            icon: "loop",
            description:
              "Les dossiers acceptés peuvent être réévalués si l'activité, le comportement ou la cohérence ne suivent plus.",
          },
        ],
      },
    ],
  },
  {
    id: "sanctions",
    title: "Avertissements et sanctions",
    icon: "sanction",
    summary: "Échelle des sanctions, contestations et suivi des avertissements.",
    sections: [
      {
        id: "avertissements",
        icon: "sanction",
        title: "Avertissements et sanctions",
        rules: [
          {
            title: "Progressivité",
            icon: "warning",
            description:
              "Les sanctions sont adaptées au contexte, à la gravité et à l'historique du joueur.",
          },
          {
            title: "Contestations",
            icon: "chat",
            description:
              "Une contestation doit rester calme, argumentée et passer par les canaux prévus par le staff.",
          },
        ],
      },
    ],
  },
];
