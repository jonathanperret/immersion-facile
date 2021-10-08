import { z } from "../../node_modules/zod";
import { keys } from "./utils";

export type NafSectorCode = keyof typeof nafSectorLabels;
export const nafSectorLabels = {
  "0": "Unknown",
  A: "Agriculture, sylviculture et pêche",
  B: "Industries extractives",
  C: "Industrie manufacturière",
  D: "Production et distribution d'électricité, de gaz, de vapeur et d'air conditionné",
  E: "Production et distribution d'eau ; assainissement, gestion des déchets et dépollution",
  F: "Construction",
  G: "Commerce ; réparation d'automobiles et de motocycles",
  H: "Transports et entreposage",
  I: "Hébergement et restauration",
  J: "Information et communication",
  K: "Activités financières et d'assurance",
  L: "Activités immobilières",
  M: "Activités spécialisées, scientifiques et techniques",
  N: "Activités de services administratifs et de soutien",
  O: "Administration publique",
  P: "Enseignement",
  Q: "Santé humaine et action sociale",
  R: "Arts, spectacles et activités récréatives",
  S: "Autres activités de services",
  T: "Activités des ménages en tant qu'employeurs ; activités indifférenciées des ménages en tant que producteurs de biens et services pour usage propre",
  U: "Activités extra-territoriales",
};

export const validNafSectorCodes = keys(nafSectorLabels).filter(
  (val) => val !== "0",
);

export type NafDto = z.infer<typeof nafSchema>;
export const nafSchema = z
  .object({
    code: z.string(),
    nomenclature: z.string(),
  })
  .optional();
