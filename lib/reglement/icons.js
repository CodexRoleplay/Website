import * as LucideIcons from "lucide-react";
import { FileText } from "lucide-react";

const EXCLUDED_ICON_NAMES = new Set(["Icon", "LucideIcon", "createLucideIcon", "default"]);

export const LEGACY_ICON_MAP = {
  alert: "AlertTriangle",
  badge: "Award",
  bolt: "Zap",
  book: "BookOpen",
  bookOpen: "BookOpen",
  building: "Building2",
  car: "Car",
  case: "Briefcase",
  chat: "MessageSquare",
  document: "FileText",
  folder: "FolderOpen",
  forbidden: "Ban",
  globe: "Globe",
  handshake: "Handshake",
  island: "Palmtree",
  loop: "RefreshCw",
  office: "Building",
  pin: "MapPin",
  power: "Power",
  sanction: "Gavel",
  screen: "Monitor",
  search: "Search",
  shield: "Shield",
  siren: "Siren",
  stop: "OctagonX",
  warning: "AlertTriangle",
  weapon: "Sword",
};

export const POPULAR_ICON_NAMES = [
  "AlertTriangle",
  "Award",
  "Ban",
  "BookOpen",
  "Briefcase",
  "Building",
  "Building2",
  "Car",
  "FileText",
  "FolderOpen",
  "Gavel",
  "Globe",
  "Handshake",
  "MapPin",
  "MessageSquare",
  "Monitor",
  "OctagonX",
  "Palmtree",
  "Power",
  "RefreshCw",
  "Search",
  "Shield",
  "Siren",
  "Sword",
  "Users",
  "User",
  "Scale",
  "Skull",
  "Flame",
  "Heart",
  "Star",
  "Zap",
  "Eye",
  "Lock",
  "Key",
  "Phone",
  "Mail",
  "Camera",
  "Video",
  "Mic",
];

let cachedIconNames = null;

function buildIconNames() {
  return Object.keys(LucideIcons)
    .filter((name) => {
      if (EXCLUDED_ICON_NAMES.has(name)) {
        return false;
      }

      if (name.endsWith("Icon")) {
        return false;
      }

      if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
        return false;
      }

      return typeof LucideIcons[name] === "object" && LucideIcons[name] !== null;
    })
    .sort((a, b) => a.localeCompare(b, "fr"));
}

export function getAllLucideIconNames() {
  if (!cachedIconNames) {
    cachedIconNames = buildIconNames();
  }

  return cachedIconNames;
}

export function searchLucideIcons(query, limit = 80) {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length < 2) {
    return POPULAR_ICON_NAMES;
  }

  const matches = [];

  for (const name of getAllLucideIconNames()) {
    const label = formatIconLabel(name).toLowerCase();

    if (name.toLowerCase().includes(normalizedQuery) || label.includes(normalizedQuery)) {
      matches.push(name);

      if (matches.length >= limit) {
        break;
      }
    }
  }

  return matches;
}

export function resolveIconName(name) {
  if (!name) {
    return "FileText";
  }

  if (LEGACY_ICON_MAP[name]) {
    return LEGACY_ICON_MAP[name];
  }

  if (LucideIcons[name]) {
    return name;
  }

  return "FileText";
}

export function getReglementIcon(name) {
  const resolved = resolveIconName(name);
  return LucideIcons[resolved] ?? FileText;
}

export function formatIconLabel(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/(\d+)/g, " $1")
    .trim();
}

export function getLucideIconCount() {
  return getAllLucideIconNames().length;
}
