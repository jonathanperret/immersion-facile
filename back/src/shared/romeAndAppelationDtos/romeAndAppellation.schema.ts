// Details: https://www.pole-emploi.fr/employeur/vos-recrutements/le-rome-et-les-fiches-metiers.html
import { z } from "zod";
import { zTrimmedString } from "../zodUtils";
import type {
  AppellationDto,
  AppellationMatch,
  CodeAppellation,
  CodeRome,
  MatchRangeDto,
} from "./romeAndAppellation.dto";

const codeRomeRegex = /^[A-N]\d{4}$/;
export const codeRomeSchema: z.Schema<CodeRome> = z
  .string()
  .regex(codeRomeRegex, "Code ROME incorrect");

const codeAppellationRegex = /^\d{5}\d?$/; // 5 or 6 digits
const codeAppellationSchema: z.Schema<CodeAppellation> = z
  .string()
  .regex(codeAppellationRegex, "Code ROME incorrect");

export const appellationDtoSchema: z.Schema<AppellationDto> = z.object({
  codeAppellation: codeAppellationSchema,
  libelleAppellation: zTrimmedString,
  codeRome: codeRomeSchema,
  libelleRome: zTrimmedString,
});

const matchRangeSchema: z.Schema<MatchRangeDto> = z.object({
  startIndexInclusive: z.number({ required_error: "Obligatoire" }).min(0).int(),
  endIndexExclusive: z.number({ required_error: "Obligatoire" }).min(0).int(),
});

export const romeSearchMatchSchema: z.Schema<AppellationMatch> = z.object(
  {
    appellation: appellationDtoSchema,
    matchRanges: z.array(matchRangeSchema),
  },
  { required_error: "Obligatoire" },
);

export const romeSearchResponseSchema = z.array(romeSearchMatchSchema, {
  required_error: "Obligatoire",
});
