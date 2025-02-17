import { StandardPageSlugs } from "src/app/routes/route-params";
import legalsContent from "./mentions-legales";
import cguContent from "./cgu";
import policiesContent from "./politique-de-confidentialite";
import accessibilityContent from "./declaration-accessibilite";
import siteMapContent from "./siteMap";

type StandardPageContent = {
  title: string;
  content: string;
};

const mappedContents: Record<StandardPageSlugs, StandardPageContent> = {
  cgu: cguContent,
  "mentions-legales": legalsContent,
  "politique-de-confidentialite": policiesContent,
  "declaration-accessibilite": accessibilityContent,
  "plan-du-site": siteMapContent,
};

export const getStandardContents = (path: StandardPageSlugs) =>
  mappedContents[path];
