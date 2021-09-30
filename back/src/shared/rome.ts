import * as Yup from "../../node_modules/yup";

// Details: https://www.pole-emploi.fr/employeur/vos-recrutements/le-rome-et-les-fiches-metiers.html
const romeCodeMetierRegex = /[A-N]\d{4}/;

export const romeCodeMetierSchema = Yup.string()
  .matches(romeCodeMetierRegex, "Code ROME incorrect")
  .required("Obligatoire");

export type RomeCodeMetierDto = Yup.InferType<typeof romeSearchResponseSchema>;

const romeCodeAppellationSchema = Yup.string();

export const professionSchema = Yup.object({
  romeCodeMetier: romeCodeMetierSchema.required("Obligatoire"),
  romeCodeAppellation: romeCodeAppellationSchema,
  description: Yup.string().required("Obligatoire"),
});

const matchRangeSchema = Yup.object({
  startIndexInclusive: Yup.number().min(0).integer().required("Obligatoire"),
  endIndexExclusive: Yup.number().min(0).integer().required("Obligatoire"),
});

export const romeSearchMatchSchema = Yup.object({
  profession: professionSchema.required("Obligatoire"),
  matchRanges: Yup.array().of(matchRangeSchema).required("Obligatoire"),
});

export type RomeSearchMatchDto = Yup.InferType<typeof romeSearchMatchSchema>;

export type ProfessionDto = Yup.InferType<typeof professionSchema>;

export const romeSearchRequestSchema = Yup.string().required("Obligatoire");

export type RomeSearchRequestDto = Yup.InferType<
  typeof romeSearchRequestSchema
>;

export const romeSearchResponseSchema = Yup.array(
  romeSearchMatchSchema,
).required("Obligatoire");

export type RomeSearchResponseDto = Yup.InferType<
  typeof romeSearchResponseSchema
>;

export type MatchRangeDto = Yup.InferType<typeof matchRangeSchema>;
