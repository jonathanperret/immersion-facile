import { z } from "zod";

// Details: https://www.pole-emploi.fr/employeur/vos-recrutements/le-rome-et-les-fiches-metiers.html
const romeCodeRegex = /^[A-N]\d{4}$/;

export type RomeCodeV0 = z.infer<typeof romeCodeSchemaV0>;
export const romeCodeSchemaV0 = z
  .string()
  .regex(romeCodeRegex, "Code ROME incorrect");

export type AppellationCodeV0 = z.infer<typeof appellationSchemaV0>;
const appellationCodeRegex = /^\d{5}\d?$/; // 5 or 6 digits
export const appellationSchemaV0 = z
  .string()
  .regex(appellationCodeRegex, "Code ROME incorrect");
