import { penalSections } from "@/data/code-penal";
import { getLosAngelesSections, normalizePenalJurisdictions, normalizePenalSections } from "@/lib/code-penal/normalize";

export function getFallbackCodePenal() {
  const jurisdictions = normalizePenalJurisdictions(null, penalSections);

  return {
    jurisdictions,
    sections: getLosAngelesSections(jurisdictions),
    updatedAt: null,
    updatedBy: null,
    updatedByEmail: null,
    source: "static",
  };
}

export { normalizePenalSections };
