import { getReglementIcon } from "@/lib/reglement/icons";

export default function RuleIcon({ name, className = "", size = 20, strokeWidth = 1.75 }) {
  const Icon = getReglementIcon(name);

  return <Icon aria-hidden className={className} size={size} strokeWidth={strokeWidth} />;
}
