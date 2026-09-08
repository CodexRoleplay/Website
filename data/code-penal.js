export const penalSections = [
  {
    "id": "livre-i-titre-1-principes-generaux",
    "title": "LIVRE I - TITRE 1 : PRINCIPES GÉNÉRAUX",
    "articles": [
      {
        "id": "101-1-categories-d-infractions",
        "article": "101-1",
        "name": "Catégories d'infractions",
        "description": "Classification en trois catégories : Contraventions (mineures), Délits (gravité intermédiaire), Crimes (infractions graves).",
        "fine": "---",
        "penalty": "Définition",
        "level": "contravention"
      },
      {
        "id": "101-2-intentionnalite",
        "article": "101-2",
        "name": "Intentionnalité",
        "description": "L'infraction est constituée par la volonté de commettre l'acte ou par une négligence/imprudence punissable.",
        "fine": "---",
        "penalty": "Définition",
        "level": "contravention"
      },
      {
        "id": "101-3-elements-constitutifs",
        "article": "101-3",
        "name": "Éléments constitutifs",
        "description": "Réunion de trois éléments : Matériel (l'acte), Moral (l'intention), Légal (l'existence d'une loi).",
        "fine": "---",
        "penalty": "Définition",
        "level": "contravention"
      },
      {
        "id": "101-4-non-retroactivite",
        "article": "101-4",
        "name": "Non-rétroactivité",
        "description": "Nul ne peut être poursuivi pour un acte qui n'était pas incriminé au moment de sa commission.",
        "fine": "---",
        "penalty": "Principe",
        "level": "contravention"
      },
      {
        "id": "101-5-delais-de-prescription",
        "article": "101-5",
        "name": "Délais de prescription",
        "description": "Seuls sont punissables les faits (crimes/délits) datant de moins de 5 mois à la date de commission.",
        "fine": "---",
        "penalty": "5 Mois",
        "level": "contravention"
      },
      {
        "id": "101-6-legalite-des-peines",
        "article": "101-6",
        "name": "Légalité des peines",
        "description": "Aucune sanction ne peut être appliquée sans texte de loi, règlement ou décret prévoyant la peine.",
        "fine": "---",
        "penalty": "Principe",
        "level": "contravention"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-i-chapitre-2-champ-d-application",
    "title": "LIVRE I - CHAPITRE 2 : CHAMP D'APPLICATION",
    "articles": [
      {
        "id": "102-1-territorialite",
        "article": "102-1",
        "name": "Territorialité",
        "description": "La loi pénale de San Andreas s'applique à toute infraction commise sur l'ensemble du territoire national.",
        "fine": "---",
        "penalty": "Territoire",
        "level": "contravention"
      }
    ],
    "notes": []
  },
  {
    "id": "titre-9-trafic-de-biens-et-substances",
    "title": "TITRE 9 : TRAFIC DE BIENS ET SUBSTANCES",
    "articles": [
      {
        "id": "225-2-exportation-illegale",
        "article": "225-2",
        "name": "Exportation illégale",
        "description": "Exportation de biens culturels sans autorisation. Saisie + Interdiction commerce d'art (3 ans).",
        "fine": "100 000 $",
        "penalty": "Casier",
        "level": "crime"
      },
      {
        "id": "225-3-importation-illicite",
        "article": "225-3",
        "name": "Importation illicite",
        "description": "Introduction de biens culturels volés ou frauduleux sur le territoire.",
        "fine": "100 000 $",
        "penalty": "60 PE",
        "level": "crime"
      },
      {
        "id": "225-4-falsification",
        "article": "225-4",
        "name": "Falsification",
        "description": "Tentative de reproduire, modifier ou vendre des œuvres sous fausse identité.",
        "fine": "100 000 $",
        "penalty": "60 PE",
        "level": "crime"
      },
      {
        "id": "225-5-possession-luxe",
        "article": "225-5",
        "name": "Possession Luxe",
        "description": "Or, Diamants, Argenterie sans justificatif. Bijoux(200$/u), Diamant(300$/u), Or/Argenterie(5000$/u).",
        "fine": "Variable",
        "penalty": "15 min GAV",
        "level": "delit"
      },
      {
        "id": "225-6-contrebande-organisee",
        "article": "225-6",
        "name": "Contrebande Organisée",
        "description": "Trafic de produits de luxe/pierres rares dans le cadre d'une bande organisée.",
        "fine": "60 000 $",
        "penalty": "50 PE",
        "level": "delit"
      }
    ],
    "notes": []
  },
  {
    "id": "titre-10-braquages-et-cambriolages",
    "title": "TITRE 10 : BRAQUAGES ET CAMBRIOLAGES",
    "articles": [
      {
        "id": "227-1-braquage-atm",
        "article": "227-1",
        "name": "Braquage ATM",
        "description": "Vol ou tentative sur distributeur de billets, avec ou sans effraction.",
        "fine": "4 000 $",
        "penalty": "15 min GAV",
        "level": "delit"
      },
      {
        "id": "228-2-braquage-de-banque",
        "article": "228-2",
        "name": "Braquage de Banque",
        "description": "Vol d'institution bancaire par effraction, menace ou usage d'armes.",
        "fine": "65 000 $",
        "penalty": "85 PE",
        "level": "crime"
      },
      {
        "id": "228-7-banque-pacific",
        "article": "228-7",
        "name": "Banque Pacific",
        "description": "Braquage de la banque Pacific. Usage de force ou moyens frauduleux majeurs.",
        "fine": "100 000 $",
        "penalty": "180 PE",
        "level": "crime"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-iii-aggravations-et-attenuations",
    "title": "LIVRE III : AGGRAVATIONS ET ATTÉNUATIONS",
    "articles": [
      {
        "id": "301-2-recidive-legale",
        "article": "301-2",
        "name": "Récidive Légale",
        "description": "Même type d'acte répété (1 mois pour crimes / 2 semaines pour délits).",
        "fine": "+30%",
        "penalty": "+30% PE",
        "level": "aggravante"
      },
      {
        "id": "303-9-auteur-service-public",
        "article": "303-9",
        "name": "Auteur : Service Public",
        "description": "L'auteur est un membre ou ex-membre des services publics (LSPD, GOUV, EMS, G6).",
        "fine": "AMENDE x2",
        "penalty": "+15% PE",
        "level": "aggravante"
      },
      {
        "id": "304-1-casier-vierge",
        "article": "304-1",
        "name": "Casier Vierge",
        "description": "Première infraction. Réduction possible de l'amende et de la peine.",
        "fine": "-50%",
        "penalty": "-50% PE",
        "level": "contravention"
      },
      {
        "id": "102-1-application-territoriale",
        "article": "102-1",
        "name": "Application Territoriale",
        "description": "S'applique aux infractions sur le territoire, aux faits partiels sur le territoire ou en zone transfrontalière.",
        "fine": "---",
        "penalty": "Territoire",
        "level": "contravention"
      },
      {
        "id": "102-2-infractions-a-l-etranger",
        "article": "102-2",
        "name": "Infractions à l'étranger",
        "description": "Poursuites possibles si l'acte porte atteinte aux intérêts du pays ou relève de conventions internationales.",
        "fine": "---",
        "penalty": "International",
        "level": "contravention"
      },
      {
        "id": "102-3-competence-universelle",
        "article": "102-3",
        "name": "Compétence universelle",
        "description": "Juridiction compétente pour crimes de guerre, crimes contre l'humanité et génocides.",
        "fine": "---",
        "penalty": "Droit Int.",
        "level": "contravention"
      },
      {
        "id": "102-4-immunite-diplomatique",
        "article": "102-4",
        "name": "Immunité Diplomatique",
        "description": "Les diplomates bénéficient d'une immunité sauf levée expresse par leur pays d'origine.",
        "fine": "---",
        "penalty": "Immunité",
        "level": "contravention"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-i-chapitre-3-droits-fondamentaux",
    "title": "LIVRE I - CHAPITRE 3 : DROITS FONDAMENTAUX",
    "articles": [
      {
        "id": "103-1-droit-a-un-avocat",
        "article": "103-1",
        "name": "Droit à un avocat",
        "description": "Droit d'être assisté par un avocat dès le début de l'enquête. Possibilité d'avocat commis d'office.",
        "fine": "---",
        "penalty": "Défense",
        "level": "contravention"
      },
      {
        "id": "103-2-presomption-d-innocence",
        "article": "103-2",
        "name": "Présomption d'innocence",
        "description": "Toute personne est présumée innocente jusqu'à preuve de sa culpabilité par décision judiciaire.",
        "fine": "---",
        "penalty": "Fondamental",
        "level": "contravention"
      },
      {
        "id": "103-3-acces-au-dossier",
        "article": "103-3",
        "name": "Accès au dossier",
        "description": "Le prévenu et son avocat accèdent au dossier (charge/décharge). Exception : protection des témoins.",
        "fine": "---",
        "penalty": "Procédure",
        "level": "contravention"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-i-article-103-4-classification-des-armes",
    "title": "LIVRE I - ARTICLE 103-4 : CLASSIFICATION DES ARMES",
    "articles": [
      {
        "id": "103-4-a-armes-legales",
        "article": "103-4-A",
        "name": "Armes Légales",
        "description": "Batte, Pied de biche, Lampe torche, Golf, Marteau, Clé anglaise, Queue billard, Hache, Couteau. Petit calibre (soumis PPA) : Pistolet 9mm.",
        "fine": "---",
        "penalty": "AUTORISÉ",
        "level": "contravention"
      },
      {
        "id": "103-4-b-armes-illegales",
        "article": "103-4-B",
        "name": "Armes Illégales",
        "description": "Blanches : Poing amér., Machette, Cran d’arrêt, Poignard. Incendiaires : Molotov, Flare gun. Petit Cal : Pétoire, Colt, Glock, Five-Seven. Moyen Cal : Uzi, Scorpion, Tec-9, Cal.50.",
        "fine": "Confiscation",
        "penalty": "CRIMINEL",
        "level": "crime"
      },
      {
        "id": "103-4-c-gros-calibre-guerre",
        "article": "103-4-C",
        "name": "Gros Calibre / Guerre",
        "description": "Fusils : SMG, HK UMP, AK-U, Gusenberg, ADP, AK-47, SCAR, M16, Galil, Famas. Pompes : Canon scié, Double coup, M870, Spas-12.",
        "fine": "Confiscation",
        "penalty": "CRIMINEL",
        "level": "crime"
      },
      {
        "id": "103-4-d-reserve-etat-lspd",
        "article": "103-4-D",
        "name": "Réservé État / LSPD",
        "description": "Matraque, Pompe électrique, Pepper spray, Taser, Pistolet Combat, Carabine M4, HK-416, AR-15, P90. Possession civile = Atteinte grave à l'État.",
        "fine": "Saisie + Poursuite",
        "penalty": "ÉTAT",
        "level": "responsabilite"
      },
      {
        "id": "103-5-silence-garde",
        "article": "103-5",
        "name": "Silence gardé",
        "description": "Droit de ne pas répondre aux questions sans que cela ne soit retenu contre soi.",
        "fine": "---",
        "penalty": "Droit Fondamental",
        "level": "contravention"
      },
      {
        "id": "103-6-proces-equitable",
        "article": "103-6",
        "name": "Procès équitable",
        "description": "Droit à un procès public, équitable et tenu dans un délai raisonnable (Tribunal).",
        "fine": "---",
        "penalty": "Garantie",
        "level": "contravention"
      },
      {
        "id": "103-7-traitement-digne",
        "article": "103-7",
        "name": "Traitement digne",
        "description": "Interdiction des traitements cruels, inhumains ou dégradants durant la procédure.",
        "fine": "---",
        "penalty": "Éthique",
        "level": "contravention"
      },
      {
        "id": "103-8-droits-des-victimes",
        "article": "103-8",
        "name": "Droits des victimes",
        "description": "Droit de plainte, information de l'enquête, constitution de partie civile pour réparation.",
        "fine": "Réparation",
        "penalty": "Victime",
        "level": "contravention"
      },
      {
        "id": "103-9-assistance-gratuite",
        "article": "103-9",
        "name": "Assistance gratuite",
        "description": "Aide juridique gratuite pour les victimes d'infractions graves (violences/sexuel).",
        "fine": "Charge État",
        "penalty": "Assistance",
        "level": "contravention"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-i-protection-des-mineurs-et-vulnerables",
    "title": "LIVRE I - PROTECTION DES MINEURS ET VULNÉRABLES",
    "articles": [
      {
        "id": "103-10-protection-renforcee",
        "article": "103-10",
        "name": "Protection renforcée",
        "description": "Conditions d'audition adaptées pour éviter les traumatismes des mineurs/vulnérables.",
        "fine": "---",
        "penalty": "Renforcé",
        "level": "contravention"
      },
      {
        "id": "103-11-procedure-mineurs",
        "article": "103-11",
        "name": "Procédure Mineurs",
        "description": "Présence obligatoire d'un tuteur. Si absence &gt; 15min : +15min (Avocat/EMS). Si échec : enregistrement vidéo obligatoire.",
        "fine": "Protocole",
        "penalty": "LSPD Vidéo",
        "level": "contravention"
      },
      {
        "id": "103-12-discernement",
        "article": "103-12",
        "name": "Discernement",
        "description": "Évaluation de l'âge et de la maturité du mineur avant toute décision de justice.",
        "fine": "---",
        "penalty": "Évaluation",
        "level": "contravention"
      },
      {
        "id": "103-13-carence-tuteur",
        "article": "103-13",
        "name": "Carence Tuteur",
        "description": "Désignation d'un représentant légal temporaire en cas de défaillance des parents.",
        "fine": "---",
        "penalty": "Tutelle",
        "level": "contravention"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-i-garanties-de-procedure",
    "title": "LIVRE I - GARANTIES DE PROCÉDURE",
    "articles": [
      {
        "id": "103-14-auto-incrimination",
        "article": "103-14",
        "name": "Auto-incrimination",
        "description": "Nul ne peut être contraint de témoigner contre lui-même (s'auto-incriminer).",
        "fine": "---",
        "penalty": "Protection",
        "level": "contravention"
      },
      {
        "id": "103-15-tiers-de-confiance",
        "article": "103-15",
        "name": "Tiers de confiance",
        "description": "Droit à un accompagnateur désigné en cas d'incapacité à comprendre la procédure.",
        "fine": "---",
        "penalty": "Accompagnement",
        "level": "contravention"
      },
      {
        "id": "103-16-donnees-privees",
        "article": "103-16",
        "name": "Données privées",
        "description": "Protection des informations de santé et de vie privée. Usage strictement limité à l'enquête.",
        "fine": "Confidentialité",
        "penalty": "RGPD RP",
        "level": "contravention"
      },
      {
        "id": "103-17-information-des-charges",
        "article": "103-17",
        "name": "Information des charges",
        "description": "Droit d'être informé des charges dans une langue comprise avant toute audition.",
        "fine": "---",
        "penalty": "Information",
        "level": "contravention"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-i-titre-2-responsabilites-penales",
    "title": "LIVRE I - TITRE 2 : RESPONSABILITÉS PÉNALES",
    "articles": [
      {
        "id": "104-1-resp-personnelle",
        "article": "104-1",
        "name": "Resp. Personnelle",
        "description": "Nul n'est responsable que de son propre fait. Pas de condamnation pour autrui.",
        "fine": "---",
        "penalty": "Individuel",
        "level": "contravention"
      },
      {
        "id": "104-2-3-personnes-morales",
        "article": "104-2/3",
        "name": "Personnes Morales",
        "description": "Les entreprises/orgas sont responsables pénalement (sauf l'État). N'exclut pas la responsabilité des auteurs physiques.",
        "fine": "---",
        "penalty": "Société",
        "level": "contravention"
      },
      {
        "id": "104-5-reddition-volontaire",
        "article": "104-5",
        "name": "Reddition Volontaire",
        "description": "Se rendre de son plein gré durant l'infraction (hors récidive).",
        "fine": "-50% AMENDE",
        "penalty": "-50% PE",
        "level": "contravention"
      },
      {
        "id": "104-6-intention-criminelle",
        "article": "104-6",
        "name": "Intention criminelle",
        "description": "Pas de crime sans intention, sauf cas de négligence ou imprudence prévus par la loi.",
        "fine": "---",
        "penalty": "Élément Moral",
        "level": "contravention"
      },
      {
        "id": "104-7-8-auteur-et-complice",
        "article": "104-7/8",
        "name": "Auteur et Complice",
        "description": "Auteur : accomplit les faits. Complice : aide, assiste, encourage ou soutient moralement délibérément.",
        "fine": "Identique",
        "penalty": "Participation",
        "level": "contravention"
      },
      {
        "id": "104-9-provocation-incitation",
        "article": "104-9",
        "name": "Provocation / Incitation",
        "description": "Est complice celui qui provoque par menace, promesse ou abus de pouvoir.",
        "fine": "Identique",
        "penalty": "Instigateur",
        "level": "contravention"
      },
      {
        "id": "104-10-force-majeure",
        "article": "104-10",
        "name": "Force Majeure",
        "description": "Exonération si force majeure, contrainte irrésistible ou légitime défense.",
        "fine": "EXONÉRATION",
        "penalty": "",
        "level": "contravention"
      },
      {
        "id": "104-11-erreur-de-droit",
        "article": "104-11",
        "name": "Erreur de droit",
        "description": "Nul n'est censé ignorer la loi, sauf erreur insurmontable via info erronée d'une autorité.",
        "fine": "---",
        "penalty": "Exceptionnel",
        "level": "contravention"
      },
      {
        "id": "104-12-solidarite",
        "article": "104-12",
        "name": "Solidarité",
        "description": "Exonération possible si l'acte est fait dans un but humanitaire sans intention de nuire.",
        "fine": "PARTIEL / TOTAL",
        "penalty": "",
        "level": "contravention"
      },
      {
        "id": "104-13-etrangers-export",
        "article": "104-13",
        "name": "Étrangers / Export",
        "description": "Débit automatique des amendes pour les étrangers. Transfert possible pour peine au pays d'origine.",
        "fine": "DÉBIT AUTO",
        "penalty": "Coopération",
        "level": "contravention"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-i-chapitre-2-modulation-des-peines",
    "title": "LIVRE I - CHAPITRE 2 : MODULATION DES PEINES",
    "articles": [
      {
        "id": "105-1-2-circonstances-aggravantes",
        "article": "105-1/2",
        "name": "Circonstances Aggravantes",
        "description": "Faits augmentant la gravité : Préméditation, bande organisée, victime vulnérable, abus de pouvoir, torture, ou discrimination (sexe, religion, etc.).",
        "fine": "AUGMENTATION PEINE",
        "penalty": "",
        "level": "contravention"
      },
      {
        "id": "105-3-repression-aggravee",
        "article": "105-3",
        "name": "Répression Aggravée",
        "description": "Peut entraîner un allongement de la peine de liberté ou une requalification du délit en crime.",
        "fine": "REQUALIFICATION POSSIBLE",
        "penalty": "",
        "level": "contravention"
      },
      {
        "id": "105-4-5-circonstances-attenuantes",
        "article": "105-4/5",
        "name": "Circonstances Atténuantes",
        "description": "Éléments diminuant la gravité : Reddition, provocation, absence d'intention, remords, coopération ou réparation des préjudices.",
        "fine": "DIMINUTION PEINE",
        "penalty": "",
        "level": "contravention"
      },
      {
        "id": "105-6-reduction-de-peine",
        "article": "105-6",
        "name": "Réduction de peine",
        "description": "Le juge peut réduire les amendes/PE ou remplacer l'emprisonnement par des peines alternatives (TIG, sursis).",
        "fine": "ALTERNATIVES POSSIBLES",
        "penalty": "",
        "level": "contravention"
      },
      {
        "id": "105-7-recidive-legale",
        "article": "105-7",
        "name": "Récidive Légale",
        "description": "Aggravation systématique. Délais : 1 mois (Crime) / 2 semaines (Délit) après la dernière condamnation.",
        "fine": "+30% AMENDE",
        "penalty": "+30% PE",
        "level": "aggravante"
      },
      {
        "id": "105-8-minorite-penale",
        "article": "105-8",
        "name": "Minorité Pénale",
        "description": "Circonstances atténuantes systématiques pour les mineurs. Priorité aux mesures éducatives et à la réinsertion.",
        "fine": "MESURES ÉDUCATIVES",
        "penalty": "",
        "level": "contravention"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-ii-titre-1-atteintes-a-l-integrite-physique",
    "title": "LIVRE II - TITRE 1 : ATTEINTES À L'INTÉGRITÉ PHYSIQUE",
    "articles": [
      {
        "id": "201-1-homicide-volontaire",
        "article": "201-1",
        "name": "Homicide Volontaire",
        "description": "Fait de donner la mort volontairement. Inclut l'assassinat (préméditation).",
        "fine": "750 000 $",
        "penalty": "500 PE + Casier",
        "level": "crime"
      },
      {
        "id": "201-2-homicide-involontaire",
        "article": "201-2",
        "name": "Homicide Involontaire",
        "description": "Causer la mort par imprudence, négligence ou manquement à la sécurité.",
        "fine": "325 000 $",
        "penalty": "250 PE",
        "level": "crime"
      },
      {
        "id": "201-2-1-homicide-invol-aggrave",
        "article": "201-2-1",
        "name": "Homicide Invol. (Aggravé)",
        "description": "Commi sous alcool/stup ou faute professionnelle grave.",
        "fine": "+150 000 $",
        "penalty": "+110 PE",
        "level": "crime"
      },
      {
        "id": "201-3-a-violences-legeres-itt-lt-8j",
        "article": "201-3-A",
        "name": "Violences Légères (ITT &lt; 8j)",
        "description": "Atteinte physique volontaire sans arme.",
        "fine": "7 000 $",
        "penalty": "25 PE + Casier",
        "level": "delit"
      },
      {
        "id": "201-3-b-violences-graves-itt-gt-8j",
        "article": "201-3-B",
        "name": "Violences Graves (ITT &gt; 8j)",
        "description": "Atteinte physique sans arme entraînant une ITT supérieure à 8 jours.",
        "fine": "15 000 $",
        "penalty": "35 PE + Casier",
        "level": "delit"
      },
      {
        "id": "201-3-c-violences-armees-blanche-incendiaire",
        "article": "201-3-C",
        "name": "Violences Armées (Blanche/Incendiaire)",
        "description": "Usage d'arme blanche, par destination ou cocktail molotov.",
        "fine": "25 000 $",
        "penalty": "45 PE + Retrait Armes",
        "level": "crime"
      },
      {
        "id": "201-3-d-violences-armees-feu",
        "article": "201-3-D",
        "name": "Violences Armées (Feu)",
        "description": "Usage d'une arme à feu lors d'une agression physique.",
        "fine": "65 000 $",
        "penalty": "70 PE + Retrait PPA",
        "level": "crime"
      },
      {
        "id": "201-3-1-mutilation-infirmite",
        "article": "201-3-1",
        "name": "Mutilation / Infirmité",
        "description": "Violences entraînant la perte d'un membre, d'un organe ou de la vue/parole.",
        "fine": "100 000 $",
        "penalty": "150 PE",
        "level": "crime"
      },
      {
        "id": "201-3-2-violences-sur-vulnerable",
        "article": "201-3-2",
        "name": "Violences sur Vulnérable",
        "description": "Contre mineur &lt; 15 ans, senior, handicapé ou conjoint (dépendance).",
        "fine": "65 000 $",
        "penalty": "50 PE",
        "level": "crime"
      },
      {
        "id": "201-4-mise-en-danger-incitation-suicide",
        "article": "201-4",
        "name": "Mise en danger / Incitation suicide",
        "description": "Exposition à un risque de mort immédiat. Si suicide avéré : 150k$ / 150 PE.",
        "fine": "15 000 $",
        "penalty": "15 PE",
        "level": "delit"
      },
      {
        "id": "201-5-non-assistance-a-personne-en-danger",
        "article": "201-5",
        "name": "Non-assistance à personne en danger",
        "description": "Défaut de secours en cas de péril immédiat (noyade, accident, agression).",
        "fine": "10 000 $",
        "penalty": "15 PE",
        "level": "delit"
      },
      {
        "id": "201-6-torture-et-barbarie",
        "article": "201-6",
        "name": "Torture et Barbarie",
        "description": "Souffrances physiques/psy graves. Si mort : Perpétuité.",
        "fine": "150 000 $",
        "penalty": "150 PE",
        "level": "crime"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-ii-enlevement-et-sequestration",
    "title": "LIVRE II - ENLÈVEMENT ET SÉQUESTRATION",
    "articles": [
      {
        "id": "201-7-a-sequestration-prise-d-otage",
        "article": "201-7-A",
        "name": "Séquestration / Prise d'otage",
        "description": "Priver une personne de sa liberté (hors braquage G6).",
        "fine": "50 000 $",
        "penalty": "60 PE",
        "level": "crime"
      },
      {
        "id": "201-7-b-otage-agent-public-gouv",
        "article": "201-7-B",
        "name": "Otage : Agent Public / Gouv",
        "description": "Séquestration d'un agent public ou membre du gouvernement.",
        "fine": "100 000 $",
        "penalty": "220 PE (Débit Immédiat)",
        "level": "crime"
      },
      {
        "id": "201-7-c-otage-mineur-vulnerable",
        "article": "201-7-C",
        "name": "Otage : Mineur / Vulnérable",
        "description": "Séquestration d'une personne mineure ou vulnérable connue.",
        "fine": "65 000 $",
        "penalty": "80 PE",
        "level": "crime"
      },
      {
        "id": "201-8-a-violences-conjugales",
        "article": "201-8-A",
        "name": "Violences Conjugales",
        "description": "Violences au sein du couple (cohabitation ou non).",
        "fine": "20 000 $",
        "penalty": "35 PE + Casier",
        "level": "delit"
      },
      {
        "id": "201-8-b-v-conjugales-itt-gt-7j",
        "article": "201-8-B",
        "name": "V. Conjugales (ITT &gt; 7j)",
        "description": "Violences de couple avec incapacité de travail supérieure à 7 jours.",
        "fine": "40 000 $",
        "penalty": "45 PE",
        "level": "delit"
      },
      {
        "id": "201-8-c-v-conjugales-enceinte-arme",
        "article": "201-8-C",
        "name": "V. Conjugales (Enceinte/Arme)",
        "description": "Victime enceinte ou usage d'une arme par l'auteur.",
        "fine": "85 000 $",
        "penalty": "80 PE",
        "level": "crime"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-ii-chapitre-2-harcelement-et-pressions",
    "title": "LIVRE II - CHAPITRE 2 : HARCÈLEMENT ET PRESSIONS",
    "articles": [
      {
        "id": "202-1-harcelement-physique",
        "article": "202-1",
        "name": "Harcèlement physique",
        "description": "Comportement intrusif, suivi répété, entrave à la liberté. Si violence légère : 35 PE / 15k$.",
        "fine": "7 000 $",
        "penalty": "25 PE",
        "level": "delit"
      },
      {
        "id": "202-2-harcelement-phys-aggrave",
        "article": "202-2",
        "name": "Harcèlement phys. aggravé",
        "description": "Sur mineur, senior, vulnérable ou par personne d'autorité.",
        "fine": "25 000 $",
        "penalty": "45 PE + Casier",
        "level": "delit"
      },
      {
        "id": "202-3-harcelement-moral",
        "article": "202-3",
        "name": "Harcèlement moral",
        "description": "Pressions, humiliations, dégradation santé mentale. Si altération grave : 35 PE / 15k$.",
        "fine": "7 000 $",
        "penalty": "25 PE",
        "level": "delit"
      },
      {
        "id": "202-4-harcelement-pro",
        "article": "202-4",
        "name": "Harcèlement Pro.",
        "description": "Intimidation ou marginalisation d'un collègue. Si supérieur : PE & Amende x2.",
        "fine": "7 000 $",
        "penalty": "25 PE",
        "level": "delit"
      },
      {
        "id": "202-5-cyberharcelement",
        "article": "202-5",
        "name": "Cyberharcèlement",
        "description": "Harcèlement via réseaux, SMS, mails. Si groupe ou tentative suicide : 35 PE / 15k$.",
        "fine": "7 000 $",
        "penalty": "25 PE",
        "level": "delit"
      },
      {
        "id": "202-6-harcelement-couple",
        "article": "202-6",
        "name": "Harcèlement Couple",
        "description": "Menaces, insultes ou pressions répétées sur conjoint ou ex.",
        "fine": "15 000 $",
        "penalty": "35 PE",
        "level": "delit"
      },
      {
        "id": "202-7-stalking-traque",
        "article": "202-7",
        "name": "Stalking (Traque)",
        "description": "Surveillance ou espionnage répété. Si technologique (GPS/Caméra) : 20k$ + Soins.",
        "fine": "10 000 $",
        "penalty": "Soins oblig.",
        "level": "delit"
      },
      {
        "id": "202-8-chantage-manipulation",
        "article": "202-8",
        "name": "Chantage / Manipulation",
        "description": "Forcer à agir via culpabilité ou intimidation. Si danger : 35 PE / 20k$.",
        "fine": "7 000 $",
        "penalty": "15 PE",
        "level": "delit"
      },
      {
        "id": "202-9-harcelement-discriminatoire",
        "article": "202-9",
        "name": "Harcèlement discriminatoire",
        "description": "Basé sur l'origine, sexe, orientation, religion ou handicap. + Accompagnement psy.",
        "fine": "15 000 $",
        "penalty": "35 PE",
        "level": "delit"
      },
      {
        "id": "202-10-violation-protection-victime",
        "article": "202-10",
        "name": "Violation protection victime",
        "description": "Non-respect d'une ordonnance d'éloignement ou de protection.",
        "fine": "50 000 $",
        "penalty": "50 PE",
        "level": "delit"
      },
      {
        "id": "202-11-diffamation",
        "article": "202-11",
        "name": "Diffamation",
        "description": "Allégations sans preuves ou falsifiées visant à nuire ou déstabiliser.",
        "fine": "25 000 $",
        "penalty": "25 PE + Casier",
        "level": "delit"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-ii-chapitre-3-infractions-sexuelles",
    "title": "LIVRE II - CHAPITRE 3 : INFRACTIONS SEXUELLES",
    "articles": [
      {
        "id": "203-0-1-defaut-de-presentation",
        "article": "203-0-1",
        "name": "Défaut de présentation",
        "description": "Non-respect de l'obligation de signer le registre quotidien au poste (durée 1 mois).",
        "fine": "50 000 $",
        "penalty": "50 PE",
        "level": "delit"
      },
      {
        "id": "203-1-agression-sexuelle",
        "article": "203-1",
        "name": "Agression sexuelle",
        "description": "Atteinte sexuelle avec violence, contrainte, menace ou surprise.",
        "fine": "150 000 $",
        "penalty": "150 PE + Casier",
        "level": "crime"
      },
      {
        "id": "203-2-agression-sexuelle-aggravee",
        "article": "203-2",
        "name": "Agression sexuelle (Aggravée)",
        "description": "Commise en réunion, sous menace d'une arme ou sur personne vulnérable.",
        "fine": "300 000 $",
        "penalty": "300 PE + Casier",
        "level": "crime"
      },
      {
        "id": "203-3-harcelement-sexuel",
        "article": "203-3",
        "name": "Harcèlement sexuel",
        "description": "Actes/propos répétés à connotation sexuelle portant atteinte à la dignité.",
        "fine": "50 000 $",
        "penalty": "45 PE + Casier",
        "level": "delit"
      },
      {
        "id": "203-4-harcelement-sexuel-en-ligne",
        "article": "203-4",
        "name": "Harcèlement sexuel en ligne",
        "description": "Propos obscènes ou demandes insistantes via réseaux/emails/SMS.",
        "fine": "50 000 $",
        "penalty": "45 PE + Casier",
        "level": "delit"
      },
      {
        "id": "203-5-atteinte-a-la-pudeur",
        "article": "203-5",
        "name": "Atteinte à la pudeur",
        "description": "Exhibition volontaire des parties intimes en public ou devant un non-consentant.",
        "fine": "20 000 $",
        "penalty": "20 PE + Casier",
        "level": "delit"
      },
      {
        "id": "203-6-voyeurisme",
        "article": "203-6",
        "name": "Voyeurisme",
        "description": "Observer ou filmer à l'insu dans un moment intime (vestiaires, chambre, etc.).",
        "fine": "20 000 $",
        "penalty": "20 PE + Casier",
        "level": "delit"
      },
      {
        "id": "203-7-sujetion-chimique-viol",
        "article": "203-7",
        "name": "Sujétion chimique (Viol)",
        "description": "Administration de substances (drogue/alcool) pour commettre une agression sexuelle.",
        "fine": "300 000 $",
        "penalty": "300 PE + Casier",
        "level": "crime"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-ii-titre-2-vols-et-extorsions",
    "title": "LIVRE II - TITRE 2 : VOLS ET EXTORSIONS",
    "articles": [
      {
        "id": "204-1-vol-simple",
        "article": "204-1",
        "name": "Vol simple",
        "description": "Soustraction frauduleuse sans violence (cambriolage, vol à la tire).",
        "fine": "1 000 $",
        "penalty": "10 min GAV + Remboursement",
        "level": "contravention"
      },
      {
        "id": "204-2-vol-aggrave",
        "article": "204-2",
        "name": "Vol aggravé",
        "description": "Vol avec violence, arme, violation de domicile ou en réunion/bande organisée.",
        "fine": "20 000 $",
        "penalty": "30 PE + Remboursement",
        "level": "delit"
      },
      {
        "id": "204-3-vol-en-entreprise",
        "article": "204-3",
        "name": "Vol en entreprise",
        "description": "Vol à l'étalage, dissimulation ou substitution de prix dans un commerce/véhicule pro.",
        "fine": "15 000 $",
        "penalty": "20 min GAV + Casier",
        "level": "delit"
      },
      {
        "id": "204-4-vol-vehicule-civil",
        "article": "204-4",
        "name": "Vol véhicule (Civil)",
        "description": "Soustraction illégale d'un véhicule motorisé appartenant à un civil.",
        "fine": "5 000 $",
        "penalty": "20 min GAV + Casier",
        "level": "delit"
      },
      {
        "id": "204-5-vol-vehicule-d-etat",
        "article": "204-5",
        "name": "Vol véhicule d'État",
        "description": "Soustraction de véhicule LSPD, EMS, GOUV ou missions d'intérêt général.",
        "fine": "30 000 $",
        "penalty": "30 PE + Casier",
        "level": "crime"
      },
      {
        "id": "204-6-vol-vehicule-trace-go-fast",
        "article": "204-6",
        "name": "Vol véhicule tracé / Go-Fast",
        "description": "Vol de véhicule spécifique pour activités illicites (livraisons rapides).",
        "fine": "6 000 $",
        "penalty": "20 min GAV + Casier",
        "level": "delit"
      },
      {
        "id": "204-7-extorsion-et-menaces",
        "article": "204-7",
        "name": "Extorsion et Menaces",
        "description": "Obtenir biens/services par contrainte ou menace. Aggravation si arme létale : 35k$ / 30 PE.",
        "fine": "15 000 $",
        "penalty": "20 PE + Casier",
        "level": "delit"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-ii-titre-2-manquements-professionnels",
    "title": "LIVRE II - TITRE 2 : MANQUEMENTS PROFESSIONNELS",
    "articles": [
      {
        "id": "204-8-secret-professionnel",
        "article": "204-8",
        "name": "Secret Professionnel",
        "description": "Révélation d'infos confidentielles (Santé, Justice, Banque). Aggravation possible si préjudice grave.",
        "fine": "20 000 $",
        "penalty": "20 min GAV + Casier",
        "level": "delit"
      },
      {
        "id": "204-9-licenciement-abusif",
        "article": "204-9",
        "name": "Licenciement Abusif",
        "description": "Rupture sans motif légitime ou discriminatoire. Indemnités : moy. 3 dernières primes + frais médicaux si préjudice moral.",
        "fine": "30 000 $",
        "penalty": "Réintégration / Indemnités",
        "level": "delit"
      },
      {
        "id": "204-10-exercice-illegal-medecine",
        "article": "204-10",
        "name": "Exercice illégal médecine",
        "description": "Soins, ordonnances ou usage de matériel médical sans diplôme/autorisation. Saisie du matériel.",
        "fine": "30 000 $",
        "penalty": "40 PE + Casier",
        "level": "crime"
      },
      {
        "id": "204-11-secret-defense-confidentiel",
        "article": "204-11",
        "name": "Secret Défense / Confidentiel",
        "description": "Divulgation de dossiers classifiés, plans tactiques ou identités d'agents infiltrés.",
        "fine": "60 000 $",
        "penalty": "60 PE + Retrait Fonctions",
        "level": "crime"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-ii-chapitre-2-degradations-et-incendies",
    "title": "LIVRE II - CHAPITRE 2 : DÉGRADATIONS ET INCENDIES",
    "articles": [
      {
        "id": "205-1-degradation-biens-publics",
        "article": "205-1",
        "name": "Dégradation Biens Publics",
        "description": "Vandalisme sur infrastructures État, mobilier urbain ou bâtiments administratifs.",
        "fine": "1 500 $",
        "penalty": "Remboursement + Réparation",
        "level": "delit"
      },
      {
        "id": "205-2-degradation-biens-prives",
        "article": "205-2",
        "name": "Dégradation Biens Privés",
        "description": "Atteinte aux biens de particuliers ou entreprises (vitres, véhicules, bâtiments).",
        "fine": "2 000 $",
        "penalty": "Remboursement + Réparation",
        "level": "delit"
      },
      {
        "id": "205-3-intrusion-violation-propriete",
        "article": "205-3",
        "name": "Intrusion / Violation propriété",
        "description": "Pénétration sans autorisation. Mesure : Expulsion immédiate et interdiction d'accès.",
        "fine": "4 000 $",
        "penalty": "Casier judiciaire",
        "level": "delit"
      },
      {
        "id": "205-4-incendie-criminel",
        "article": "205-4",
        "name": "Incendie Criminel",
        "description": "Mise à feu volontaire. Indemnisation : +30% à 40% des frais de secours mobilisés.",
        "fine": "30 000 $",
        "penalty": "30 PE + Casier",
        "level": "crime"
      },
      {
        "id": "205-5-atteinte-immaterielle-privee",
        "article": "205-5",
        "name": "Atteinte immatérielle privée",
        "description": "Préjudice à l'image, réputation ou intérêts éco. Diffusion d'infos nuisibles.",
        "fine": "20 000 $",
        "penalty": "20 PE + Licenciement",
        "level": "delit"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-ii-titre-3-fraudes-corruption-et-blanchiment",
    "title": "LIVRE II - TITRE 3 : FRAUDES, CORRUPTION ET BLANCHIMENT",
    "articles": [
      {
        "id": "206-1-detournement-fonds-publics",
        "article": "206-1",
        "name": "Détournement Fonds Publics",
        "description": "Usage non autorisé de ressources publiques pour avantage personnel. Saisie des biens obtenus.",
        "fine": "300 000 $",
        "penalty": "75 PE + Casier",
        "level": "crime"
      },
      {
        "id": "206-2-fraude-fiscale",
        "article": "206-2",
        "name": "Fraude Fiscale",
        "description": "Dissimulation de revenus ou falsification. Saisie de l'établissement et des sommes dissimulées.",
        "fine": "300 000 $",
        "penalty": "75 PE + Casier",
        "level": "crime"
      },
      {
        "id": "206-3-escroquerie-usurpation",
        "article": "206-3",
        "name": "Escroquerie / Usurpation",
        "description": "Tromperie par manœuvres frauduleuses pour s'approprier des biens. Remboursement obligatoire.",
        "fine": "30 000 $",
        "penalty": "30 PE + Casier",
        "level": "delit"
      },
      {
        "id": "206-4-abus-de-confiance",
        "article": "206-4",
        "name": "Abus de confiance",
        "description": "Détournement de fonds ou biens confiés légalement. Remboursement obligatoire.",
        "fine": "30 000 $",
        "penalty": "30 PE + Casier",
        "level": "delit"
      },
      {
        "id": "207-1-corruption-active-passive",
        "article": "207-1",
        "name": "Corruption (Active/Passive)",
        "description": "Offrir (active) ou accepter (passive) un avantage indu. Saisie des avantages obtenus.",
        "fine": "80 000 $",
        "penalty": "80 PE + Casier",
        "level": "crime"
      },
      {
        "id": "207-2-tentative-de-corruption",
        "article": "207-2",
        "name": "Tentative de corruption",
        "description": "Offrir ou promettre (active) / Tenter d'accepter (passive) un avantage indu.",
        "fine": "40 000 $",
        "penalty": "40 PE + Saisie",
        "level": "delit"
      },
      {
        "id": "207-3-blanchiment-d-argent",
        "article": "207-3",
        "name": "Blanchiment d'argent",
        "description": "Masquer l'origine illégale de fonds ou de biens pour les rendre légitimes.",
        "fine": "150 000 $",
        "penalty": "90 PE + Casier",
        "level": "crime"
      },
      {
        "id": "207-4-enrichissement-illicite",
        "article": "207-4",
        "name": "Enrichissement illicite",
        "description": "Acquisition de biens disproportionnés par rapport aux revenus déclarés.",
        "fine": "100 000 $",
        "penalty": "Saisie des biens",
        "level": "crime"
      },
      {
        "id": "207-5-detournement-subventions",
        "article": "207-5",
        "name": "Détournement subventions",
        "description": "Usage abusif d'aides publiques. Aggravation si &gt; 200k$ : 150k$ / 90 PE.",
        "fine": "100 000 $",
        "penalty": "60 PE + Rembours.",
        "level": "crime"
      },
      {
        "id": "207-6-falsification-financiere",
        "article": "207-6",
        "name": "Falsification financière",
        "description": "Modifier/créer des documents comptables pour tromper tiers ou fisc.",
        "fine": "100 000 $",
        "penalty": "Saisie Entreprise",
        "level": "crime"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-ii-titre-4-resistance-a-la-loi-et-ordre-public",
    "title": "LIVRE II - TITRE 4 : RÉSISTANCE À LA LOI ET ORDRE PUBLIC",
    "articles": [
      {
        "id": "208-1-refus-d-obtemperer-simple",
        "article": "208-1",
        "name": "Refus d'obtempérer simple",
        "description": "Non-respect d'un ordre direct et légitime d'un agent des forces de l'ordre.",
        "fine": "6 000 $",
        "penalty": "15 min GAV + Casier",
        "level": "delit"
      },
      {
        "id": "208-2-refus-d-obtemperer-aggrave",
        "article": "208-2",
        "name": "Refus d'obtempérer aggravé",
        "description": "Refus lors d'une intervention dangereuse (course-poursuite, mise en danger).",
        "fine": "10 000 $",
        "penalty": "30 min GAV + Casier",
        "level": "delit"
      },
      {
        "id": "208-3-fausse-identite",
        "article": "208-3",
        "name": "Fausse identité",
        "description": "Fournir une identité ou des informations trompeuses lors d'un contrôle.",
        "fine": "15 000 $",
        "penalty": "25 PE + Casier",
        "level": "delit"
      },
      {
        "id": "208-4-evasion",
        "article": "208-4",
        "name": "Évasion",
        "description": "Quitter illégalement une prison ou un lieu de détention.",
        "fine": "45 000 $",
        "penalty": "90 PE + Casier",
        "level": "crime"
      },
      {
        "id": "208-5-tentative-d-evasion",
        "article": "208-5",
        "name": "Tentative d'évasion",
        "description": "Action visant à fuir un lieu de détention sans y parvenir.",
        "fine": "25 000 $",
        "penalty": "45 PE + Casier",
        "level": "crime"
      },
      {
        "id": "208-6-complicite-d-evasion",
        "article": "208-6",
        "name": "Complicité d'évasion",
        "description": "Aider activement ou passivement un individu à s'évader.",
        "fine": "45 000 $",
        "penalty": "90 PE + Casier",
        "level": "crime"
      },
      {
        "id": "208-7-entrave-action-forces-l-ordre",
        "article": "208-7",
        "name": "Entrave action forces l'ordre",
        "description": "Gêner ou retarder l'intervention (barricades, obstruction, déni d'accès).",
        "fine": "10 000 $",
        "penalty": "30 min GAV + Casier",
        "level": "delit"
      },
      {
        "id": "208-8-manifestation-illegale",
        "article": "208-8",
        "name": "Manifestation illégale",
        "description": "Participation à une manifestation non déclarée perturbant l'ordre public.",
        "fine": "15 000 $",
        "penalty": "15 min GAV",
        "level": "contravention"
      },
      {
        "id": "208-9-dissimulation-de-visage",
        "article": "208-9",
        "name": "Dissimulation de visage",
        "description": "Masque/foulard volontaire (hors FDO ou 2 roues protection). Palpation autorisée.",
        "fine": "1 500 $",
        "penalty": "Pas de casier",
        "level": "contravention"
      },
      {
        "id": "208-10-usage-abusif-infra-publiques",
        "article": "208-10",
        "name": "Usage abusif infra. publiques",
        "description": "Usage non autorisé ou détourné d'infrastructures réservées. Saisie matériel.",
        "fine": "15 000 $",
        "penalty": "15 min GAV + Casier",
        "level": "delit"
      },
      {
        "id": "208-11-tentative-acces-frauduleux",
        "article": "208-11",
        "name": "Tentative accès frauduleux",
        "description": "Tentative d'intrusion physique ou numérique sur infra. publiques.",
        "fine": "10 000 $",
        "penalty": "15 min GAV + Casier",
        "level": "delit"
      },
      {
        "id": "208-12-impaye-refus-sanction",
        "article": "208-12",
        "name": "Impayé (Refus sanction)",
        "description": "Non-paiement amende. Délais: 4j (&lt;35k), 6j (&lt;60k), 8j (&lt;100k), 10j (&gt;100k).",
        "fine": "DÉBIT IMMÉDIAT",
        "penalty": "60 PE",
        "level": "aggravante"
      },
      {
        "id": "208-13-defaut-de-convocation",
        "article": "208-13",
        "name": "Défaut de convocation",
        "description": "Non présentation à une convocation police/gouv sans motif légitime.",
        "fine": "15 000 $",
        "penalty": "20 min GAV + Casier",
        "level": "delit"
      },
      {
        "id": "208-14-intrusion-site-reserve",
        "article": "208-14",
        "name": "Intrusion site réservé",
        "description": "Poste de police, Gouv, Aéroport, Base militaire.",
        "fine": "40 000 $",
        "penalty": "40 PE + Casier",
        "level": "crime"
      },
      {
        "id": "208-15-faux-temoignage",
        "article": "208-15",
        "name": "Faux témoignage",
        "description": "Mentir ou dissimuler pour fausser une enquête. Aggravé si devant Magistrat : 40k$ / 30 PE.",
        "fine": "20 000 $",
        "penalty": "30 min GAV + Casier",
        "level": "delit"
      },
      {
        "id": "208-16-abus-de-pouvoir-fdo-agent",
        "article": "208-16",
        "name": "Abus de pouvoir (FDO/Agent)",
        "description": "Usage illégal de force, menace, perquisition ou contrôle arbitraire.",
        "fine": "65 000 $",
        "penalty": "Interdiction 3 à 5 mois",
        "level": "responsabilite"
      },
      {
        "id": "208-17-separatisme-atteinte-etat",
        "article": "208-17",
        "name": "Séparatisme / Atteinte État",
        "description": "Violation de la constitution ou de l'intégrité du territoire de San Andreas.",
        "fine": "500 000 $",
        "penalty": "FÉDÉRAL À VIE",
        "level": "crime"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-ii-chapitre-2-protection-des-agents-publics",
    "title": "LIVRE II - CHAPITRE 2 : PROTECTION DES AGENTS PUBLICS",
    "articles": [
      {
        "id": "209-1-agression-verbale-agent",
        "article": "209-1",
        "name": "Agression verbale (Agent)",
        "description": "Insultes ou menaces verbales/écrites réitérées contre un agent en fonction.",
        "fine": "7 500 $",
        "penalty": "Suivi Psy EMS",
        "level": "delit"
      },
      {
        "id": "209-2-menace-de-represailles",
        "article": "209-2",
        "name": "Menace de représailles",
        "description": "Menaces physiques ou financières contre l'agent ou sa famille.",
        "fine": "15 000 $",
        "penalty": "30 min GAV + Casier",
        "level": "delit"
      },
      {
        "id": "209-3-agression-physique-mineure",
        "article": "209-3",
        "name": "Agression physique mineure",
        "description": "Violence main nue ou arme blanche contre un agent. Débit immédiat.",
        "fine": "70 000 $",
        "penalty": "60 PE + Casier",
        "level": "aggravante"
      },
      {
        "id": "209-4-agression-physique-majeure",
        "article": "209-4",
        "name": "Agression physique majeure",
        "description": "Usage d'arme à feu ou blessures graves contre un agent. Débit immédiat.",
        "fine": "150 000 $",
        "penalty": "300 PE + Casier",
        "level": "crime"
      },
      {
        "id": "209-5-mise-en-danger-negligence",
        "article": "209-5",
        "name": "Mise en danger (Négligence)",
        "description": "Mise en danger d'un agent par imprudence (conduite, etc.) sans intention délibérée.",
        "fine": "25 000 $",
        "penalty": "20 min GAV",
        "level": "delit"
      },
      {
        "id": "209-6-mise-en-danger-volontaire",
        "article": "209-6",
        "name": "Mise en danger volontaire",
        "description": "Mise en danger intentionnelle de la vie ou de l'intégrité d'un agent.",
        "fine": "40 000 $",
        "penalty": "40 PE + Casier",
        "level": "delit"
      },
      {
        "id": "209-7-resistance-armee",
        "article": "209-7",
        "name": "Résistance armée",
        "description": "S'opposer violemment avec une arme à une interpellation. Débit immédiat.",
        "fine": "25 000 $",
        "penalty": "20 PE + Confiscation",
        "level": "aggravante"
      },
      {
        "id": "209-8-degradation-matos-fdo",
        "article": "209-8",
        "name": "Dégradation matos FDO",
        "description": "Vandalisme sur véhicules ou équipements des forces de l'ordre.",
        "fine": "20 000 $",
        "penalty": "30 PE + Réparation",
        "level": "delit"
      },
      {
        "id": "209-9-port-illegal-d-insigne-tenue",
        "article": "209-9",
        "name": "Port illégal d'insigne/tenue",
        "description": "Possession d'uniforme ou signe FDO/EMS. Peine doublée si usurpation de fonction.",
        "fine": "50 000 $",
        "penalty": "30 PE (Débit Imméd.)",
        "level": "aggravante"
      },
      {
        "id": "209-10-outrage-a-magistrat",
        "article": "209-10",
        "name": "Outrage à magistrat",
        "description": "Manque de respect public à un juge. Aggravé si insultes directes (25k$ / 30 PE). S'applique même hors service si lié à la fonction.",
        "fine": "12 000 $",
        "penalty": "15 PE + Casier",
        "level": "delit"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-ii-titre-5-trafic-et-production-de-stupefiants",
    "title": "LIVRE II - TITRE 5 : TRAFIC ET PRODUCTION DE STUPÉFIANTS",
    "articles": [
      {
        "id": "210-1-laboratoire-clandestin",
        "article": "210-1",
        "name": "Laboratoire clandestin",
        "description": "Exploitation d'un site de production. Destruction immédiate des équipements.",
        "fine": "75 000 $",
        "penalty": "125 PE + Casier",
        "level": "crime"
      },
      {
        "id": "210-2-precurseurs-chimiques",
        "article": "210-2",
        "name": "Précurseurs chimiques",
        "description": "Possession de produits (Méthylamine, Graines, Fertilisant, etc.).\n• 1-50u : 25$/u\n• 51-100u : 50$/u\n• +100u : 75$/u",
        "fine": "Variable /u",
        "penalty": "20 min GAV + Confiscation",
        "level": "delit"
      },
      {
        "id": "210-3-a-possession-weed",
        "article": "210-3-A",
        "name": "Possession : Weed",
        "description": "Soustraction et transport de Cannabis.\n• 1-50u : 40$/u\n• 51-100u : 75$/u\n• +100u : 100$/u",
        "fine": "Variable /u",
        "penalty": "20 min GAV + Confiscation",
        "level": "delit"
      },
      {
        "id": "210-3-b-possession-meth",
        "article": "210-3-B",
        "name": "Possession : Meth",
        "description": "Soustraction et transport de Méthamphétamine.\n• 1-50u : 55$/u\n• 51-100u : 85$/u\n• +100u : 135$/u",
        "fine": "Variable /u",
        "penalty": "20 min GAV + Confiscation",
        "level": "delit"
      },
      {
        "id": "210-3-c-possession-cocaine",
        "article": "210-3-C",
        "name": "Possession : Cocaïne",
        "description": "Soustraction et transport de Cocaïne.\n• 1-50u : 65$/u\n• 51-100u : 95$/u\n• +100u : 140$/u",
        "fine": "Variable /u",
        "penalty": "20 min GAV + Confiscation",
        "level": "delit"
      },
      {
        "id": "210-4-reseau-de-trafic",
        "article": "210-4",
        "name": "Réseau de trafic",
        "description": "Création, gestion ou participation à un réseau structuré.",
        "fine": "65 000 $",
        "penalty": "150 PE + Confiscation",
        "level": "crime"
      },
      {
        "id": "210-5-vente-cession",
        "article": "210-5",
        "name": "Vente / Cession",
        "description": "Distribution ou offre illégale de stupéfiants.",
        "fine": "3 500 $",
        "penalty": "15 PE + Confiscation",
        "level": "delit"
      },
      {
        "id": "211-1-2-usage-detention-perso",
        "article": "211-1/2",
        "name": "Usage & Détention perso.",
        "description": "Consommation ou détention de quantités limitées. Programme de désintoxication obligatoire.",
        "fine": "2 000 $",
        "penalty": "Désintox + Confiscation",
        "level": "delit"
      },
      {
        "id": "211-3-usage-lieu-public",
        "article": "211-3",
        "name": "Usage lieu public",
        "description": "Consommation de stupéfiants dans un espace public.",
        "fine": "3 000 $",
        "penalty": "15 min Dégrisement",
        "level": "delit"
      },
      {
        "id": "212-1-production-illegale",
        "article": "212-1",
        "name": "Production illégale",
        "description": "Fabrication ou culture sans autorisation légale.",
        "fine": "50 000 $",
        "penalty": "60 PE + Casier",
        "level": "crime"
      },
      {
        "id": "212-2-exploitation-de-mineur-trafic",
        "article": "212-2",
        "name": "Exploitation de mineur (Trafic)",
        "description": "Utilisation d'un mineur pour la production, vente ou transport. +30% D&I au tuteur.",
        "fine": "15 000 $",
        "penalty": "40 PE + Casier",
        "level": "crime"
      },
      {
        "id": "213-1-trafic-en-zone-protegee",
        "article": "213-1",
        "name": "Trafic en zone protégée",
        "description": "Consommation/Vente à proximité d'écoles, hôpitaux ou bâtiments publics.",
        "fine": "5 000 $",
        "penalty": "Confiscation + Casier",
        "level": "delit"
      },
      {
        "id": "213-2-stockage-illegal",
        "article": "213-2",
        "name": "Stockage illégal",
        "description": "Dissimulation de stupéfiants dans des lieux publics ou privés.",
        "fine": "50 000 $",
        "penalty": "30 PE + Casier",
        "level": "delit"
      },
      {
        "id": "214-1-non-denonciation-drogue",
        "article": "214-1",
        "name": "Non-dénonciation (Drogue)",
        "description": "Connaissance de faits de trafic non signalés. Aggravé si mineur impliqué (50k$ / 40 PE).",
        "fine": "30 000 $",
        "penalty": "30 min GAV + Casier",
        "level": "delit"
      },
      {
        "id": "214-2-promotion-stupefiants",
        "article": "214-2",
        "name": "Promotion stupéfiants",
        "description": "Incitation ou promotion de la consommation (incluant réseaux sociaux).",
        "fine": "10 000 $",
        "penalty": "15 min GAV + Casier",
        "level": "delit"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-ii-titre-6-armes-et-equipements-tactiques",
    "title": "LIVRE II - TITRE 6 : ARMES ET ÉQUIPEMENTS TACTIQUES",
    "articles": [
      {
        "id": "215-1-silencieux-illegal",
        "article": "215-1",
        "name": "Silencieux illégal",
        "description": "Possession d'un modérateur de son non autorisé. Sanction par unité.",
        "fine": "10 000 $",
        "penalty": "15 min GAV + Saisie",
        "level": "delit"
      },
      {
        "id": "215-2-gilet-pare-balles-lourd",
        "article": "215-2",
        "name": "Gilet Pare-balles (Lourd)",
        "description": "Plaques de kevlar lourd. Sanction par unité.",
        "fine": "50 000 $",
        "penalty": "30 min GAV + Saisie",
        "level": "crime"
      },
      {
        "id": "215-3-gilet-pare-balles-leger",
        "article": "215-3",
        "name": "Gilet Pare-balles (Léger)",
        "description": "Plaques de kevlar léger. Sanction par unité.",
        "fine": "5 000 $",
        "penalty": "15 min GAV + Saisie",
        "level": "delit"
      },
      {
        "id": "215-4-detention-taser-lspd",
        "article": "215-4",
        "name": "Détention Taser (LSPD)",
        "description": "Possession d'un pistolet à impulsion électrique non restitué ou non justifié.",
        "fine": "30 000 $",
        "penalty": "20 PE + Casier",
        "level": "delit"
      },
      {
        "id": "215-5-armes-blanches-incendiaires",
        "article": "215-5",
        "name": "Armes blanches / Incendiaires",
        "description": "Port d'armes blanches interdites (non disponibles légalement) ou armes incendiaires.",
        "fine": "35 000 $",
        "penalty": "25 PE + Casier",
        "level": "delit"
      },
      {
        "id": "215-6-arme-illegale-petit-calibre",
        "article": "215-6",
        "name": "Arme illégale (Petit calibre)",
        "description": "Port d'arme de petit calibre non disponible à la vente légale.",
        "fine": "35 000 $",
        "penalty": "35 PE + Saisie",
        "level": "delit"
      },
      {
        "id": "215-7-arme-illegale-moyen-calibre",
        "article": "215-7",
        "name": "Arme illégale (Moyen calibre)",
        "description": "Port d'arme de moyen calibre non disponible à la vente légale.",
        "fine": "70 000 $",
        "penalty": "55 PE + Saisie",
        "level": "delit"
      },
      {
        "id": "215-8-arme-illegale-gros-calibre",
        "article": "215-8",
        "name": "Arme illégale (Gros calibre)",
        "description": "Port d'arme de gros calibre non disponible à la vente légale.",
        "fine": "135 000 $",
        "penalty": "100 PE + Casier",
        "level": "crime"
      },
      {
        "id": "215-9-munitions-illegales",
        "article": "215-9",
        "name": "Munitions illégales",
        "description": "45ACP, Cal.12, 7.62, 5.56. Sanction par chargeur.",
        "fine": "200 $ /u",
        "penalty": "15 min GAV + Saisie",
        "level": "delit"
      }
    ],
    "notes": []
  },
  {
    "id": "armement-reserve-a-l-etat-police-militaire",
    "title": "ARMEMENT RÉSERVÉ À L'ÉTAT (POLICE / MILITAIRE)",
    "articles": [
      {
        "id": "215-10-a-arme-blanche-etat",
        "article": "215-10-A",
        "name": "Arme blanche État",
        "description": "Possession d'arme blanche réservée FDO/Gouv. Mandat perquisition auto.",
        "fine": "20 000 $ (Débit)",
        "penalty": "50 PE + Casier",
        "level": "aggravante"
      },
      {
        "id": "215-10-b-petit-calibre-etat",
        "article": "215-10-B",
        "name": "Petit calibre État",
        "description": "Arme de poing de service ou dotation publique. Mandat perquisition auto.",
        "fine": "70 000 $ (Débit)",
        "penalty": "70 PE + Casier",
        "level": "aggravante"
      },
      {
        "id": "215-10-c-moyen-calibre-etat",
        "article": "215-10-C",
        "name": "Moyen calibre État",
        "description": "Arme de type PM ou fusil à pompe de dotation. Mandat perquisition auto.",
        "fine": "150 000 $ (Débit)",
        "penalty": "125 PE + Casier",
        "level": "crime"
      },
      {
        "id": "215-10-d-calibre-lourd-etat",
        "article": "215-10-D",
        "name": "Calibre lourd État",
        "description": "Fusil d'assaut ou équipement militaire. Mandat perquisition auto.",
        "fine": "200 000 $ (Débit)",
        "penalty": "200 PE + Casier",
        "level": "crime"
      }
    ],
    "notes": []
  },
  {
    "id": "exhibition-et-stockage",
    "title": "EXHIBITION ET STOCKAGE",
    "articles": [
      {
        "id": "215-11-exhibition-d-arme",
        "article": "215-11",
        "name": "Exhibition d'arme",
        "description": "Arme blanche ou à feu apparente ou en main sur la voie publique (hors holster).",
        "fine": "12 000 $",
        "penalty": "15 PE + Saisie",
        "level": "delit"
      },
      {
        "id": "215-12-gilet-esthetique",
        "article": "215-12",
        "name": "Gilet esthétique",
        "description": "Port/Exhibition de gilet par balle à visée esthétique en public.",
        "fine": "3 500 $",
        "penalty": "15 min GAV + Saisie",
        "level": "delit"
      },
      {
        "id": "215-13-arme-legale-sans-ppa",
        "article": "215-13",
        "name": "Arme légale sans PPA",
        "description": "Détention d'arme légale sans permis (justificatif).",
        "fine": "15 000 $",
        "penalty": "20 min GAV + Saisie",
        "level": "delit"
      },
      {
        "id": "215-14-stockage-illegal-d-armes",
        "article": "215-14",
        "name": "Stockage illégal d'armes",
        "description": "Dissimulation d'armes diverses dans un lieu public ou privé.",
        "fine": "50 000 $",
        "penalty": "30 PE + Casier",
        "level": "delit"
      },
      {
        "id": "215-15-kits-de-reparation-illegaux",
        "article": "215-15",
        "name": "Kits de réparation illégaux",
        "description": "Éléments/objets permettant la réparation d'armes illégales.",
        "fine": "2 000 $ /u",
        "penalty": "20 min GAV + Saisie",
        "level": "delit"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-ii-chapitre-2-troubles-a-l-ordre-public",
    "title": "LIVRE II - CHAPITRE 2 : TROUBLES À L'ORDRE PUBLIC",
    "articles": [
      {
        "id": "216-1-participation-a-une-emeute",
        "article": "216-1",
        "name": "Participation à une émeute",
        "description": "Participation active causant des troubles graves. Restriction d'accès possible.",
        "fine": "15 000 $",
        "penalty": "15 min GAV + Casier",
        "level": "delit"
      },
      {
        "id": "216-2-organisation-incitation-emeute",
        "article": "216-2",
        "name": "Organisation / Incitation émeute",
        "description": "Instigation directe à l'émeute. Restriction d'accès au périmètre.",
        "fine": "25 000 $",
        "penalty": "15 min GAV + Casier",
        "level": "delit"
      },
      {
        "id": "216-3-degradation-emeute",
        "article": "216-3",
        "name": "Dégradation (Émeute)",
        "description": "Dommages aux biens publics/privés en réunion. Remboursement intégral requis.",
        "fine": "20 000 $",
        "penalty": "30 PE + Casier",
        "level": "crime"
      },
      {
        "id": "216-4-incitation-a-la-violence",
        "article": "216-4",
        "name": "Incitation à la violence",
        "description": "Promotion ou diffusion de messages incitant à la violence publique/privée.",
        "fine": "25 000 $",
        "penalty": "50 PE + Casier",
        "level": "crime"
      },
      {
        "id": "216-5-port-d-arme-en-rassemblement",
        "article": "216-5",
        "name": "Port d'arme en rassemblement",
        "description": "Exhibition d'armes illégales lors d'un rassemblement public.",
        "fine": "30 000 $",
        "penalty": "Saisie + Casier",
        "level": "crime"
      },
      {
        "id": "216-6-usage-d-arme-voie-publique",
        "article": "216-6",
        "name": "Usage d'arme (Voie publique)",
        "description": "Tir sans motif légitime (hors légitime défense).",
        "fine": "20 000 $",
        "penalty": "Saisie + Casier",
        "level": "delit"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-iii-titre-7-crimes-et-delits-de-guerre",
    "title": "LIVRE III - TITRE 7 : CRIMES ET DÉLITS DE GUERRE",
    "articles": [
      {
        "id": "317-1-meurtres-tortures-guerre",
        "article": "317-1",
        "name": "Meurtres & Tortures (Guerre)",
        "description": "Traitement cruel ou torture sur civils ou combattants hors combat.",
        "fine": "750 000 $",
        "penalty": "700 PE + Casier",
        "level": "crime"
      },
      {
        "id": "317-2-attaques-contre-civils",
        "article": "317-2",
        "name": "Attaques contre civils",
        "description": "Ciblage délibéré d'habitations, écoles, hôpitaux ou commerces.",
        "fine": "350 000 $",
        "penalty": "350 PE + Casier",
        "level": "crime"
      },
      {
        "id": "317-3-methodes-de-guerre-prohibees",
        "article": "317-3",
        "name": "Méthodes de guerre prohibées",
        "description": "Usage d'armes chimiques, biologiques ou nucléaires. Confiscation totale.",
        "fine": "250 000 $",
        "penalty": "PERPÉTUITÉ",
        "level": "crime"
      },
      {
        "id": "317-4-enfants-soldats",
        "article": "317-4",
        "name": "Enfants-soldats",
        "description": "Recrutement ou utilisation de mineurs (-18 ans) dans les hostilités.",
        "fine": "250 000 $",
        "penalty": "250 PE + Casier",
        "level": "crime"
      },
      {
        "id": "317-5-destruction-biens-culturels",
        "article": "317-5",
        "name": "Destruction Biens Culturels",
        "description": "Attaque de monuments historiques ou lieux de culte. Obligation de restaurer.",
        "fine": "500 000 $",
        "penalty": "250 PE + Indemnité",
        "level": "crime"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-iii-chapitre-2-violation-des-lois-de-la-guerre",
    "title": "LIVRE III - CHAPITRE 2 : VIOLATION DES LOIS DE LA GUERRE",
    "articles": [
      {
        "id": "318-1-prise-d-otages-boucliers-humains",
        "article": "318-1",
        "name": "Prise d'otages / Boucliers humains",
        "description": "Usage de civils pour se protéger ou faire pression. + Dommages & Intérêts aux civils.",
        "fine": "250 000 $",
        "penalty": "250 PE + Casier",
        "level": "crime"
      },
      {
        "id": "318-2-attaques-disproportionnees",
        "article": "318-2",
        "name": "Attaques disproportionnées",
        "description": "Attaques ignorant les pertes civiles par rapport à l'avantage militaire.",
        "fine": "45 000 $ / civ.",
        "penalty": "35 PE / civ. + Casier",
        "level": "crime"
      },
      {
        "id": "318-3-hostilites-sans-distinction",
        "article": "318-3",
        "name": "Hostilités sans distinction",
        "description": "Actions militaires ne différenciant pas civils et combattants.",
        "fine": "45 000 $ / civ.",
        "penalty": "35 PE / civ. + Casier",
        "level": "crime"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-iii-chapitre-3-crimes-contre-l-humanite",
    "title": "LIVRE III - CHAPITRE 3 : CRIMES CONTRE L'HUMANITÉ",
    "articles": [
      {
        "id": "319-1-esclavage-exploitation",
        "article": "319-1",
        "name": "Esclavage & Exploitation",
        "description": "Réduction de civils à l'esclavage en cadre de conflit.",
        "fine": "45 000 $ / civ.",
        "penalty": "PERPÉTUITÉ + Casier",
        "level": "crime"
      },
      {
        "id": "319-2-genocide-deportation",
        "article": "319-2",
        "name": "Génocide & Déportation",
        "description": "Extermination ou déportation forcée d'une population. Saisie des biens liés.",
        "fine": "45 000 $ / civ.",
        "penalty": "PERPÉTUITÉ INC.",
        "level": "crime"
      },
      {
        "id": "319-3-propagande-de-guerre",
        "article": "319-3",
        "name": "Propagande de guerre",
        "description": "Diffusion/encouragement aux crimes de guerre ou crimes contre l'humanité.",
        "fine": "100 000 $",
        "penalty": "80 PE / civ. + Saisie",
        "level": "crime"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-ii-titre-8-code-de-la-route-et-conduite",
    "title": "LIVRE II - TITRE 8 : CODE DE LA ROUTE ET CONDUITE",
    "articles": [
      {
        "id": "218-1-conduite-sans-permis-adapte",
        "article": "218-1",
        "name": "Conduite sans permis adapté",
        "description": "Catégorie de véhicule non possédée. Fourrière jusqu'à permis valide.",
        "fine": "7 500 $",
        "penalty": "Fourrière + Casier",
        "level": "delit"
      },
      {
        "id": "218-2-defaut-de-papiers-officiels",
        "article": "218-2",
        "name": "Défaut de papiers officiels",
        "description": "Non-présentation du permis ou documents obligatoires lors d'un contrôle.",
        "fine": "3 500 $",
        "penalty": "-",
        "level": "contravention"
      },
      {
        "id": "218-3-conduite-sous-suspension",
        "article": "218-3",
        "name": "Conduite sous suspension",
        "description": "Usage d'un véhicule alors que le permis est révoqué ou suspendu.",
        "fine": "10 000 $",
        "penalty": "Fourrière 48h + Retrait 1 sem.",
        "level": "delit"
      },
      {
        "id": "219-1-alcoolemie-au-volant",
        "article": "219-1",
        "name": "Alcoolémie au volant",
        "description": "Conduite en état d'ivresse. Cellule de dégrisement obligatoire.",
        "fine": "7 500 $",
        "penalty": "Fourrière 48h + Retrait 48h",
        "level": "delit"
      },
      {
        "id": "219-2-conduite-sous-stupefiants",
        "article": "219-2",
        "name": "Conduite sous stupéfiants",
        "description": "Usage de drogues ou psychotropes. Retrait immédiat du permis.",
        "fine": "10 000 $",
        "penalty": "Fourrière 72h + Retrait Imméd.",
        "level": "delit"
      },
      {
        "id": "219-3-refus-controle-sobriete",
        "article": "219-3",
        "name": "Refus contrôle sobriété",
        "description": "Refus de test alcool/drogue lors d'un contrôle de police.",
        "fine": "15 000 $",
        "penalty": "15 min GAV + Retrait Imméd.",
        "level": "delit"
      },
      {
        "id": "220-1-2-conduite-dangereuse",
        "article": "220-1/2",
        "name": "Conduite dangereuse",
        "description": "Mise en danger d'autrui. Récidive (30j) : 12 000 $ / Retrait 48h.",
        "fine": "4 000 $",
        "penalty": "Fourrière 24h",
        "level": "contravention"
      },
      {
        "id": "220-4-contresens",
        "article": "220-4",
        "name": "Contresens",
        "description": "Circulation dans le sens opposé à la voie.",
        "fine": "8 000 $",
        "penalty": "Fourrière 24h",
        "level": "contravention"
      },
      {
        "id": "221-1-2-stationnement-genant-interdit",
        "article": "221-1/2",
        "name": "Stationnement Gênant / Interdit",
        "description": "Stationnement zone interdite ou gênant la circulation.",
        "fine": "2 000 $",
        "penalty": "Fourrière (12h si Interdit)",
        "level": "contravention"
      },
      {
        "id": "222-1-2-exces-de-vitesse-50-km-h",
        "article": "222-1/2",
        "name": "Excès de vitesse (-50 km/h)",
        "description": "Sans radar (1 500 $) ou avec radar (2 000 $).",
        "fine": "Variable",
        "penalty": "-",
        "level": "contravention"
      },
      {
        "id": "222-3-vitesse-51-a-100-km-h",
        "article": "222-3",
        "name": "Vitesse (51 à 100 km/h)",
        "description": "Grand excès de vitesse détecté au radar.",
        "fine": "4 000 $",
        "penalty": "Fourrière 24h",
        "level": "delit"
      },
      {
        "id": "222-4-vitesse-101-km-h",
        "article": "222-4",
        "name": "Vitesse (+101 km/h)",
        "description": "Dépassement de vitesse extrême. Retrait de permis 24h à 48h.",
        "fine": "8 000 $",
        "penalty": "Fourrière 48h + Retrait",
        "level": "delit"
      },
      {
        "id": "223-1-3-usage-klaxon-etat-vehicule",
        "article": "223-1/3",
        "name": "Usage Klaxon / État véhicule",
        "description": "Usage abusif klaxon (3k$) ou véhicule endommagé (500$).",
        "fine": "Variable",
        "penalty": "Mise en conformité",
        "level": "contravention"
      },
      {
        "id": "223-2-vehicule-non-homologue",
        "article": "223-2",
        "name": "Véhicule non homologué",
        "description": "Défaut de plaque ou immatriculation étrangère.",
        "fine": "10 000 $",
        "penalty": "Fourrière 48h",
        "level": "delit"
      },
      {
        "id": "223-4-forcage-de-barrage-lspd",
        "article": "223-4",
        "name": "Forçage de barrage LSPD",
        "description": "Franchissement de zone d'opération ou refus de contrôle. Fouille véhicule auto.",
        "fine": "35 000 $ (Débit)",
        "penalty": "35 PE + Casier",
        "level": "aggravante"
      },
      {
        "id": "223-5-rodeo-urbain",
        "article": "223-5",
        "name": "Rodéo Urbain",
        "description": "Conduite dangereuse/acrobatique mettant en péril autrui. Saisie possible.",
        "fine": "30 000 $",
        "penalty": "Fourrière 48h + Retrait (2 sem.)",
        "level": "delit"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-iii-titre-9-trafics-transfrontaliers",
    "title": "LIVRE III - TITRE 9 : TRAFICS TRANSFRONTALIERS",
    "articles": [
      {
        "id": "224-1-2-vente-contrebande-d-armes",
        "article": "224-1/2",
        "name": "Vente & Contrebande d'armes",
        "description": "Vente ou transport frontalier illégal.\n• Blanches : 70k$ / 50 PE\n• Petit Cal : 170k$ / 70 PE\n• Moyen Cal : 350k$ / 100 PE\n• Gros Cal : 700k$ / 150 PE",
        "fine": "Variable",
        "penalty": "Saisie + Casier",
        "level": "crime"
      },
      {
        "id": "224-3-armes-de-guerre-destruction",
        "article": "224-3",
        "name": "Armes de Guerre / Destruction",
        "description": "Possession ou transport d'armes de destruction massive. Perquisition auto.",
        "fine": "1 000 000 $",
        "penalty": "200 PE + Casier",
        "level": "crime"
      },
      {
        "id": "224-6-soutien-au-terrorisme",
        "article": "224-6",
        "name": "Soutien au Terrorisme",
        "description": "Vente d'armes à des groupes terroristes reconnus par l'État.",
        "fine": "1 000 000 $",
        "penalty": "PERPÉTUITÉ + Saisie totale",
        "level": "crime"
      },
      {
        "id": "224-7-circuits-financiers-clandestins",
        "article": "224-7",
        "name": "Circuits Financiers Clandestins",
        "description": "Blanchiment, crypto illicite, Perico.\n• 1-15k u : 35$/100u\n• 15k-50k u : 45$/100u\n• +50k u : 55$/100u",
        "fine": "Variable",
        "penalty": "20 min GAV + Saisie",
        "level": "delit"
      },
      {
        "id": "225-1-4-trafic-biens-culturels",
        "article": "225-1/4",
        "name": "Trafic Biens Culturels",
        "description": "Vente, Import/Export ou Falsification d'art et antiquités protégées.",
        "fine": "100 000 $",
        "penalty": "60 à 75 PE + Interdit Commerce",
        "level": "delit"
      },
      {
        "id": "225-5-objets-de-luxe-sans-justificatif",
        "article": "225-5",
        "name": "Objets de luxe sans justificatif",
        "description": "Possession illégale.\n• +5 Bijoux : 200$/u\n• Diamant : 300$/u\n• Or/Art/Coffre : 5000$/u\n• Sacs de billets : 200$/u",
        "fine": "Variable",
        "penalty": "15 min GAV / 15 PE",
        "level": "delit"
      },
      {
        "id": "225-7-10-medicaments-denrees-illicites",
        "article": "225-7/10",
        "name": "Médicaments & Denrées illicites",
        "description": "Faux médicaments ou denrées non conformes (Cigares, Alcool...).\n• 1-50u : 3500$\n• 51-100u : 5000$\n• +100u : 7500$",
        "fine": "Variable",
        "penalty": "15 à 25 PE + Saisie",
        "level": "delit"
      },
      {
        "id": "225-11-kit-crochetage-atm",
        "article": "225-11",
        "name": "Kit Crochetage / ATM",
        "description": "Détention de matériel de crochetage ou piratage d'automates.",
        "fine": "700 $ /u",
        "penalty": "Saisie + Casier",
        "level": "delit"
      },
      {
        "id": "225-12-menottes-lspd",
        "article": "225-12",
        "name": "Menottes LSPD",
        "description": "Possession illégale de menottes de dotation publique.",
        "fine": "5 000 $ /u",
        "penalty": "15 min GAV + Saisie",
        "level": "delit"
      },
      {
        "id": "225-13-preparation-de-delit-thermite",
        "article": "225-13",
        "name": "Préparation de délit (Thermite)",
        "description": "Possession de Net Cracker ou Bombe Thermite.",
        "fine": "5 000 $ /u",
        "penalty": "15 PE + Saisie",
        "level": "aggravante"
      },
      {
        "id": "225-14-materiel-de-braquage-banque",
        "article": "225-14",
        "name": "Matériel de Braquage (Banque)",
        "description": "Possession de cartes d'accès ou dispositifs de braquage bancaire.",
        "fine": "15 000 $ /u",
        "penalty": "40 PE + Saisie",
        "level": "aggravante"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-iii-chapitre-3-criminalite-organisee",
    "title": "LIVRE III - CHAPITRE 3 : CRIMINALITÉ ORGANISÉE",
    "articles": [
      {
        "id": "226-1-association-de-malfaiteurs",
        "article": "226-1",
        "name": "Association de malfaiteurs",
        "description": "Participation avérée à un groupement criminel hiérarchisé.",
        "fine": "40 000 $",
        "penalty": "50 PE + Casier",
        "level": "crime"
      },
      {
        "id": "226-2-3-organisation-complicite",
        "article": "226-2/3",
        "name": "Organisation & Complicité",
        "description": "Direction d'un réseau international (60k$/65PE) ou soutien logistique (40k$/50PE).",
        "fine": "Variable",
        "penalty": "Saisie + Casier",
        "level": "crime"
      },
      {
        "id": "226-4-blanchiment-international",
        "article": "226-4",
        "name": "Blanchiment International",
        "description": "Dissimulation de fonds illicites via l'économie légale. Perquisition auto.",
        "fine": "150 000 $",
        "penalty": "100 PE + Saisie avoirs",
        "level": "crime"
      },
      {
        "id": "226-5-transfert-frauduleux-etat",
        "article": "226-5",
        "name": "Transfert frauduleux État",
        "description": "Contournement des régulations bancaires pour dissimuler des fonds.",
        "fine": "100 000 $",
        "penalty": "60 PE + Saisie fonds",
        "level": "crime"
      },
      {
        "id": "226-6-faux-documents-passeports",
        "article": "226-6",
        "name": "Faux documents / Passeports",
        "description": "Production ou vente d'identités falsifiées pour trafic transnational.",
        "fine": "80 000 $",
        "penalty": "70 PE + Destruction",
        "level": "crime"
      },
      {
        "id": "226-7-corruption-d-agent-etranger",
        "article": "226-7",
        "name": "Corruption d'agent étranger",
        "description": "Avantage indu offert à un fonctionnaire étranger. Débit immédiat.",
        "fine": "80 000 $",
        "penalty": "80 PE + Casier",
        "level": "aggravante"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-ii-titre-10-braquages-et-vols-de-fonds",
    "title": "LIVRE II - TITRE 10 : BRAQUAGES ET VOLS DE FONDS",
    "articles": [
      {
        "id": "227-1-braquage-d-atm",
        "article": "227-1",
        "name": "Braquage d'ATM",
        "description": "Tentative ou vol de distributeur de billets (avec/sans effraction).",
        "fine": "4 000 $",
        "penalty": "15 min GAV + Saisie",
        "level": "delit"
      },
      {
        "id": "227-2-superette-petite-echelle",
        "article": "227-2",
        "name": "Supérette (Petite échelle)",
        "description": "Extorsion d'un commerce de quartier (pertes limitées).",
        "fine": "1 000 $",
        "penalty": "15 min GAV + Saisie",
        "level": "delit"
      },
      {
        "id": "228-1-4-superette-haut-debit-containers",
        "article": "228-1/4",
        "name": "Supérette (Haut débit) / Containers",
        "description": "Attaque organisée ou vol de fret (containers).",
        "fine": "4 000 $",
        "penalty": "25 min GAV / 15 min GAV",
        "level": "crime"
      },
      {
        "id": "228-2-braquage-de-banque",
        "article": "228-2",
        "name": "Braquage de Banque",
        "description": "Vol d'institution bancaire (effraction/armes/menaces).",
        "fine": "65 000 $",
        "penalty": "85 PE + Saisie",
        "level": "crime"
      },
      {
        "id": "228-3-braquage-de-bijouterie",
        "article": "228-3",
        "name": "Braquage de Bijouterie",
        "description": "Vancleef / Vangelico. Ne pas cumuler avec 201-7 et 225-5.",
        "fine": "35 000 $",
        "penalty": "65 PE + Saisie bijoux",
        "level": "crime"
      },
      {
        "id": "228-5-fourgon-brinks-automatise",
        "article": "228-5",
        "name": "Fourgon Brinks (Automatisé)",
        "description": "Attaque de transport de fonds (mission PNJ).",
        "fine": "7 000 $",
        "penalty": "15 PE + Saisie",
        "level": "crime"
      },
      {
        "id": "228-6-fourgon-gruppe6-joueurs",
        "article": "228-6",
        "name": "Fourgon Gruppe6 (Joueurs)",
        "description": "Attaque de transport de fonds opéré par des joueurs.",
        "fine": "35 000 $",
        "penalty": "30 PE + Saisie",
        "level": "crime"
      },
      {
        "id": "228-7-braquage-pacific-bank",
        "article": "228-7",
        "name": "Braquage Pacific Bank",
        "description": "Crime majeur contre la banque centrale de la ville.",
        "fine": "100 000 $",
        "penalty": "180 PE + Casier",
        "level": "crime"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-ii-chapitre-2-cambriolages-et-violations-de-domicile",
    "title": "LIVRE II - CHAPITRE 2 : CAMBRIOLAGES ET VIOLATIONS DE DOMICILE",
    "articles": [
      {
        "id": "229-1-tentative-de-cambriolage",
        "article": "229-1",
        "name": "Tentative de cambriolage",
        "description": "Forçage d'entrée ou possession d'outils sans justification.",
        "fine": "2 500 $",
        "penalty": "15 min GAV + Saisie outils",
        "level": "delit"
      },
      {
        "id": "229-2-cambriolage-simple",
        "article": "229-2",
        "name": "Cambriolage simple",
        "description": "Intrusion illégale dans une habitation pour vol de biens. Restitution obligatoire.",
        "fine": "4 500 $",
        "penalty": "15 PE + Casier",
        "level": "delit"
      },
      {
        "id": "229-3-cambriolage-aggrave-habitation",
        "article": "229-3",
        "name": "Cambriolage aggravé (Habitation)",
        "description": "Composante réunion, effraction ou violence sur occupant. Mandat perquisition auto.",
        "fine": "7 500 $",
        "penalty": "30 PE + Casier",
        "level": "aggravante"
      },
      {
        "id": "229-4-cambriolage-commercial",
        "article": "229-4",
        "name": "Cambriolage commercial",
        "description": "Intrusion dans une entreprise/commerce hors horaires d'ouverture.",
        "fine": "8 000 $",
        "penalty": "40 PE + Casier",
        "level": "delit"
      },
      {
        "id": "229-5-cambriolage-commercial-aggrave",
        "article": "229-5",
        "name": "Cambriolage commercial aggravé",
        "description": "Vol de grande valeur ou neutralisation de sécurité (alarmes/caméras).",
        "fine": "9 500 $",
        "penalty": "60 PE + Interdiction d'approcher",
        "level": "aggravante"
      },
      {
        "id": "229-6-recel-de-cambriolage",
        "article": "229-6",
        "name": "Recel de cambriolage",
        "description": "Achat, détention ou revente d'objets issus d'un cambriolage.",
        "fine": "6 500 $",
        "penalty": "20 PE + Saisie",
        "level": "delit"
      },
      {
        "id": "229-7-intrusion-par-moyens-frauduleux",
        "article": "229-7",
        "name": "Intrusion par moyens frauduleux",
        "description": "Usage de fausses identités, uniformes ou tromperie pour s'introduire.",
        "fine": "35 000 $",
        "penalty": "35 PE + Casier",
        "level": "aggravante"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-ii-titre-11-protection-animale",
    "title": "LIVRE II - TITRE 11 : PROTECTION ANIMALE",
    "articles": [
      {
        "id": "230-1-sensibilite-animale",
        "article": "230-1",
        "name": "Sensibilité animale",
        "description": "Reconnaissance des animaux comme êtres vivants doués de sensibilité. Obligation de bien-être.",
        "fine": "-",
        "penalty": "Principe Général",
        "level": "info"
      },
      {
        "id": "230-2-droit-a-la-protection",
        "article": "230-2",
        "name": "Droit à la protection",
        "description": "Protection contre la cruauté, négligence ou traitements violents.",
        "fine": "15 000 $",
        "penalty": "30 min GAV + Interdiction détention",
        "level": "delit"
      },
      {
        "id": "231-1-2-responsabilite-conditions",
        "article": "231-1/2",
        "name": "Responsabilité & Conditions",
        "description": "Santé, accidents causés, accès nourriture/soins. Retrait animal en récidive.",
        "fine": "5 000 $ / 10 000 $",
        "penalty": "Dommages civils",
        "level": "delit"
      },
      {
        "id": "231-3-abandon-d-animal",
        "article": "231-3",
        "name": "Abandon d'animal",
        "description": "Abandon sur la voie publique ou en nature.",
        "fine": "15 000 $",
        "penalty": "15 min GAV + Retrait définitif",
        "level": "delit"
      }
    ],
    "notes": []
  },
  {
    "id": "animaux-de-service-et-k9-forces-de-l-ordre",
    "title": "ANIMAUX DE SERVICE ET K9 (FORCES DE L'ORDRE)",
    "articles": [
      {
        "id": "232-1-abus-de-chien-k9-maitre",
        "article": "232-1",
        "name": "Abus de chien K9 (Maître)",
        "description": "Utilisation comme arme gratuite, torture ou négligence par l'officier.",
        "fine": "30 000 $",
        "penalty": "Retrait K9 + Exclusion programme",
        "level": "aggravante"
      },
      {
        "id": "234-2-violence-contre-un-k9",
        "article": "234-2",
        "name": "Violence contre un K9",
        "description": "Blessure ou mise à mort d'un chien K9 (assimilé homicide agent public).",
        "fine": "50 000 $",
        "penalty": "60 PE + Interdiction port d'arme",
        "level": "crime"
      },
      {
        "id": "232-2-usage-commercial-abusif",
        "article": "232-2",
        "name": "Usage commercial abusif",
        "description": "Animaux en club/casino sans licence ou maltraités pour le spectacle.",
        "fine": "20 000 $",
        "penalty": "Fermeture établissement",
        "level": "delit"
      },
      {
        "id": "233-1-2-maltraitance-dressage-violence",
        "article": "233-1/2",
        "name": "Maltraitance & Dressage violence",
        "description": "Coups, combats, ou dressage à l'attaque humaine sans motif légal.",
        "fine": "25 000 $ / 30 000 $",
        "penalty": "25 PE + Interdiction à vie",
        "level": "crime"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-iii-circonstances-et-majorations",
    "title": "LIVRE III - CIRCONSTANCES ET MAJORATIONS",
    "articles": [
      {
        "id": "301-1-dommage-grave-irreversible",
        "article": "301-1",
        "name": "Dommage grave / irréversible",
        "description": "Mutilation, paralysie ou traumatisme sévère de la victime.",
        "fine": "+ 15 %",
        "penalty": "+ 15 % Peine Initiale",
        "level": "aggravante"
      },
      {
        "id": "301-2-recidive-legale",
        "article": "301-2",
        "name": "Récidive Légale",
        "description": "Crime (-1 mois) ou Délit (-2 sem) répété. Bracelet électronique possible.",
        "fine": "+ 30 %",
        "penalty": "+ 30 % Peine Initiale",
        "level": "aggravante"
      },
      {
        "id": "301-3-4-bande-organisee-premeditation",
        "article": "301-3/4",
        "name": "Bande organisée / Préméditation",
        "description": "Action planifiée ou commise en réunion. Interdiction de contact co-auteurs.",
        "fine": "+ 10 %",
        "penalty": "+ 10 % Peine Initiale",
        "level": "aggravante"
      },
      {
        "id": "301-5-mort-sans-intention-de-la-donner",
        "article": "301-5",
        "name": "Mort sans intention de la donner",
        "description": "Infraction entraînant involontairement le décès. Suspension permis/armes.",
        "fine": "+ 250 000 $",
        "penalty": "+ 50 % Peine Initiale",
        "level": "crime"
      },
      {
        "id": "301-6-sequestration-privation-liberte",
        "article": "301-6",
        "name": "Séquestration / Privation liberté",
        "description": "Accompagnée d'enlèvement ou rétention de la victime.",
        "fine": "+ 10 %",
        "penalty": "+ 10 % Peine Initiale",
        "level": "aggravante"
      },
      {
        "id": "301-7-multiplicite-de-victimes",
        "article": "301-7",
        "name": "Multiplicité de victimes",
        "description": "Agression collective ou crime organisé touchant plusieurs personnes.",
        "fine": "+ 15 %",
        "penalty": "+ 15 % Peine Initiale",
        "level": "aggravante"
      },
      {
        "id": "301-8-usage-technologie-avancee",
        "article": "301-8",
        "name": "Usage technologie avancée",
        "description": "Piratage, cybercriminalité ou surveillance de masse.",
        "fine": "+ 10 %",
        "penalty": "+ 10 % Peine Initiale",
        "level": "aggravante"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-iii-chapitre-2-motifs-et-mobiles-aggravants",
    "title": "LIVRE III - CHAPITRE 2 : MOTIFS ET MOBILES AGGRAVANTS",
    "articles": [
      {
        "id": "302-1-discriminations-vulnerabilite",
        "article": "302-1",
        "name": "Discriminations / Vulnérabilité",
        "description": "Haine raciste, sexiste, homophobe ou abus de personne faible.",
        "fine": "+ 25 %",
        "penalty": "+ 25 % Peine Initiale",
        "level": "crime"
      },
      {
        "id": "302-2-crime-passionnel-conflit-personnel",
        "article": "302-2",
        "name": "Crime passionnel / Conflit personnel",
        "description": "Émotion violente, jalousie ou conflit extrême. Suivi psy possible.",
        "fine": "+ 25 %",
        "penalty": "+ 25 % Peine Initiale",
        "level": "crime"
      },
      {
        "id": "302-3-4-emprise-substances-vengeance",
        "article": "302-3/4",
        "name": "Emprise substances / Vengeance",
        "description": "Sous alcool/drogue (+10%) ou représailles suite décision justice (+15%).",
        "fine": "Variable",
        "penalty": "+ 10 à 15 % Peine",
        "level": "aggravante"
      },
      {
        "id": "302-5-contexte-terroriste",
        "article": "302-5",
        "name": "Contexte Terroriste",
        "description": "Idéologie radicale visant à semer la terreur. Expulsion possible.",
        "fine": "+ 1 000 000 $",
        "penalty": "PERPÉTUITÉ INC.",
        "level": "crime"
      },
      {
        "id": "302-6-extremisme-religieux",
        "article": "302-6",
        "name": "Extrémisme religieux",
        "description": "Violence justifiée par une idéologie religieuse radicale.",
        "fine": "+ 15 %",
        "penalty": "+ 15 % Peine Initiale",
        "level": "aggravante"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-iii-chapitre-3-circonstances-de-la-commission",
    "title": "LIVRE III - CHAPITRE 3 : CIRCONSTANCES DE LA COMMISSION",
    "articles": [
      {
        "id": "303-1-presence-faveur-de-mineurs",
        "article": "303-1",
        "name": "Présence/Faveur de mineurs",
        "description": "Infraction commise devant des mineurs ou à leur bénéfice direct.",
        "fine": "+ 15 %",
        "penalty": "+ 15 % Peine + Interdiction mineurs",
        "level": "aggravante"
      },
      {
        "id": "303-2-8-usage-d-armes-otages",
        "article": "303-2/8",
        "name": "Usage d'armes / Otages",
        "description": "Menace avec arme (+10%) ou prise d'otages/pression (+10%).",
        "fine": "+ 10 %",
        "penalty": "+ 10 % Peine + Saisie",
        "level": "aggravante"
      },
      {
        "id": "303-3-4-violence-extreme-lieu-public",
        "article": "303-3/4",
        "name": "Violence extrême / Lieu public",
        "description": "Traumatisme grave (+15%) ou zone sensible/panique (écoles, hôpitaux +15%).",
        "fine": "+ 15 %",
        "penalty": "+ 15 % Peine + Suivi Psy",
        "level": "aggravante"
      },
      {
        "id": "303-5-6-terrorisme-contexte-de-guerre",
        "article": "303-5/6",
        "name": "Terrorisme / Contexte de Guerre",
        "description": "But terroriste (+75%) ou zone de conflit/moyens militaires (+50%).",
        "fine": "+ 50 à 75 %",
        "penalty": "+ 50 à 75 % Peine",
        "level": "crime"
      }
    ],
    "notes": []
  },
  {
    "id": "qualite-des-victimes-et-des-auteurs-etat-doj",
    "title": "QUALITÉ DES VICTIMES ET DES AUTEURS (ÉTAT & DOJ)",
    "articles": [
      {
        "id": "303-7-atteinte-a-l-autorite-publique",
        "article": "303-7",
        "name": "Atteinte à l'Autorité Publique",
        "description": "Infraction visant un agent des forces de l'ordre ou représentant d'autorité.",
        "fine": "+ 30 %",
        "penalty": "+ 30 % Peine + Interdit Emploi Pub.",
        "level": "aggravante"
      },
      {
        "id": "303-10-atteinte-gouvernement-doj",
        "article": "303-10",
        "name": "Atteinte Gouvernement / DOJ",
        "description": "Visant les élus ou membres du Département of Justice.",
        "fine": "+ 50 %",
        "penalty": "+ 50 % Peine + Interdit Emploi Pub.",
        "level": "crime"
      },
      {
        "id": "303-9-auteur-membre-service-public",
        "article": "303-9",
        "name": "Auteur : Membre Service Public",
        "description": "L'auteur est (ou était) membre LSPD/EMS/GOUV/G6/DOJ. Sanction de \"Trahison\".",
        "fine": "X 2 (Double)",
        "penalty": "+ 15 % Peine + Casier Syst.",
        "level": "aggravante"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-iii-titre-2-circonstances-attenuantes-et-reductions",
    "title": "LIVRE III - TITRE 2 : CIRCONSTANCES ATTÉNUANTES ET RÉDUCTIONS",
    "articles": [
      {
        "id": "304-1-primo-delinquant-casier-vierge",
        "article": "304-1",
        "name": "Primo-délinquant / Casier vierge",
        "description": "Première infraction constatée. Sursis possible. Pas de casier sous conditions.",
        "fine": "- 50 %",
        "penalty": "- 50 % Peine Initiale",
        "level": "info"
      },
      {
        "id": "304-4-5-cooperation-reddition",
        "article": "304-4/5",
        "name": "Coopération & Reddition",
        "description": "Aide au démantèlement de réseau ou reddition immédiate après les faits.",
        "fine": "- 50 %",
        "penalty": "- 50 % Peine Initiale",
        "level": "info"
      },
      {
        "id": "304-2-3-etat-mental-remords-sinceres",
        "article": "304-2/3",
        "name": "État mental / Remords sincères",
        "description": "Trouble psy confirmé ou mesures de réparation avant jugement.",
        "fine": "- 20 %",
        "penalty": "- 20 % Peine Initiale",
        "level": "info"
      }
    ],
    "notes": []
  },
  {
    "id": "attenuation-liee-a-l-intention",
    "title": "ATTÉNUATION LIÉE À L'INTENTION",
    "articles": [
      {
        "id": "305-1-4-pression-menace-emprise",
        "article": "305-1/4",
        "name": "Pression / Menace / Emprise",
        "description": "Infraction commise sous contrainte ou manipulation mentale avérée.",
        "fine": "- 30 % / Exoné.",
        "penalty": "- 30 % Peine Initiale",
        "level": "info"
      },
      {
        "id": "305-2-3-etat-de-necessite-humain-bien",
        "article": "305-2/3",
        "name": "État de nécessité (Humain/Bien)",
        "description": "Protéger une personne en danger ou un bien essentiel à la survie.",
        "fine": "- 30 % / - 25%",
        "penalty": "- 30 % / - 25% Peine",
        "level": "info"
      },
      {
        "id": "305-5-6-detresse-intention-non-criminelle",
        "article": "305-5/6",
        "name": "Détresse / Intention non-criminelle",
        "description": "Détresse sociale (vol survie) ou acte involontaire sous stress intense.",
        "fine": "- 25 % / - 30%",
        "penalty": "- 25 % / - 30% Peine",
        "level": "info"
      }
    ],
    "notes": []
  },
  {
    "id": "attenuation-liee-aux-circonstances",
    "title": "ATTÉNUATION LIÉE AUX CIRCONSTANCES",
    "articles": [
      {
        "id": "306-1-2-legitime-defense-danger-grave",
        "article": "306-1/2",
        "name": "Légitime défense / Danger grave",
        "description": "Riposte excessive mais justifiée par la peur ou pour éviter un danger de mort.",
        "fine": "- 30 % / - 25%",
        "penalty": "- 30 % / - 25% Peine",
        "level": "info"
      },
      {
        "id": "306-3-reparation-rapide",
        "article": "306-3",
        "name": "Réparation rapide",
        "description": "Indemnisation ou retour des biens avant/pendant le procès.",
        "fine": "- 25 %",
        "penalty": "- 25 % Peine Initiale",
        "level": "info"
      },
      {
        "id": "306-4-complicite",
        "article": "306-4",
        "name": "Complicité",
        "description": "Le prévenu n'est que complice de l'infraction (ex: guetteur).",
        "fine": "- 50 %",
        "penalty": "- 50 % Peine Initiale",
        "level": "info"
      }
    ],
    "notes": []
  },
  {
    "id": "livre-iii-titre-3-modalites-d-execution-des-peines",
    "title": "LIVRE III - TITRE 3 : MODALITÉS D'EXÉCUTION DES PEINES",
    "articles": [
      {
        "id": "307-1-assignation-bracelet",
        "article": "307-1",
        "name": "Assignation / Bracelet",
        "description": "Surveillance électronique (1-3 sem). Non-respect : 40k$ + 40 PE.",
        "fine": "Variable",
        "penalty": "Restriction zone",
        "level": "delit"
      },
      {
        "id": "307-2-travail-d-interet-general-tig",
        "article": "307-2",
        "name": "Travail d'Intérêt Général (TIG)",
        "description": "Travaux non rémunérés (1-10h). Échec : 70k$ à 150k$ + 100 à 200 PE.",
        "fine": "-",
        "penalty": "1 à 10 Heures",
        "level": "delit"
      },
      {
        "id": "307-3-perte-de-droits",
        "article": "307-3",
        "name": "Perte de droits",
        "description": "Retrait permis (48h-1sem), port d'arme ou interdiction fonction publique.",
        "fine": "-",
        "penalty": "Retrait définitif/temp.",
        "level": "delit"
      },
      {
        "id": "307-4-liberte-conditionnelle",
        "article": "307-4",
        "name": "Liberté Conditionnelle",
        "description": "Sortie sous surveillance (1-3 sem). Non-respect : 70k$ + 100 PE.",
        "fine": "-",
        "penalty": "Suivi strict",
        "level": "info"
      }
    ],
    "notes": []
  },
  {
    "id": "peines-complementaires-et-sanctions-d-etat",
    "title": "PEINES COMPLÉMENTAIRES ET SANCTIONS D'ÉTAT",
    "articles": [
      {
        "id": "308-1-confiscation-de-biens",
        "article": "308-1",
        "name": "Confiscation de biens",
        "description": "Saisie des profits illégaux, outils du crime ou véhicules. Vente ou destruction.",
        "fine": "Saisie Totale",
        "penalty": "Perte de propriété",
        "level": "aggravante"
      },
      {
        "id": "308-2-3-decheance-interdiction-territoire",
        "article": "308-2/3",
        "name": "Déchéance / Interdiction Territoire",
        "description": "Terrorisme/Trahison. Retrait ID et Expulsion (1-4 sem). Violation : 25k$.",
        "fine": "Variable",
        "penalty": "Bannissement RP",
        "level": "crime"
      },
      {
        "id": "308-4-dommages-et-interets",
        "article": "308-4",
        "name": "Dommages et Intérêts",
        "description": "Indemnisation de la victime (soins, moral). Saisie si insolvable.",
        "fine": "Fixé par juge",
        "penalty": "Réparation civile",
        "level": "info"
      },
      {
        "id": "308-5-interdiction-de-paraitre-contact",
        "article": "308-5",
        "name": "Interdiction de Paraître / Contact",
        "description": "Violence, harcèlement, stupéfiants. Violation : 30k$ + 40 PE.",
        "fine": "-",
        "penalty": "1 à 3 Semaines",
        "level": "aggravante"
      }
    ],
    "notes": []
  },
  {
    "id": "glossaire-et-definitions-juridiques",
    "title": "GLOSSAIRE ET DÉFINITIONS JURIDIQUES",
    "articles": [],
    "notes": [
      "Injonction : Ordre formel d'obéir sur-le-champ sous menace de sanction.\nDélit vs Crime : Le délit entraîne des peines correctionnelles, le crime est l'infraction la plus grave.\nRécidive : Répétition d'une infraction après une première condamnation.\nMagistrats : Les magistrats du siège (Juges) disent le droit ; les magistrats du parquet (Procureurs) requièrent l'application de la loi."
    ]
  }
];
