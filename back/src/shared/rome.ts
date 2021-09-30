import * as Yup from "../../node_modules/yup";

// Details: https://www.pole-emploi.fr/employeur/vos-recrutements/le-rome-et-les-fiches-metiers.html
const romeCodeMetierRegex = /[A-N]\d{4}/;

export const romeCodeMetierSchema = Yup.string()
  .matches(romeCodeMetierRegex, "Code ROME incorrect")
  .required("Obligatoire");

export type RomeCodeMetierDto = Yup.InferType<typeof romeSearchResponseSchema>;

const romeCodeAppellationSchema = Yup.string();

export type ProfessionDto = {
  romeCodeMetier: string;
  romeCodeAppellation?: string;
  description: string;
};

export const professionSchema: Yup.SchemaOf<ProfessionDto> = Yup.object({
  romeCodeMetier: romeCodeMetierSchema,
  romeCodeAppellation: romeCodeAppellationSchema,
  description: Yup.string().required("Obligatoire"),
});

export type MatchRangeDto = {
  startIndexInclusive: number;
  endIndexExclusive: number;
};

const matchRangeSchema: Yup.SchemaOf<MatchRangeDto> = Yup.object({
  startIndexInclusive: Yup.number().min(0).integer().required("Obligatoire"),
  endIndexExclusive: Yup.number().min(0).integer().required("Obligatoire"),
});

export type RomeSearchMatchDto = {
  profession: ProfessionDto;
  matchRanges: MatchRangeDto[];
};

export const romeSearchMatchSchema: Yup.SchemaOf<RomeSearchMatchDto> =
  Yup.object({
    profession: professionSchema.required("Obligatoire"),
    matchRanges: Yup.array().of(matchRangeSchema).required("Obligatoire"),
  });

export const romeSearchRequestSchema = Yup.string().required("Obligatoire");

export type RomeSearchRequestDto = Yup.InferType<
  typeof romeSearchRequestSchema
>;

export type RomeSearchResponseDto = RomeSearchMatchDto[];
export const romeSearchResponseSchema: Yup.SchemaOf<RomeSearchResponseDto> =
  Yup.array(romeSearchMatchSchema).required("Obligatoire");

