import * as Yup from "yup";

export const formulaireDtoSchema = Yup.object({
  uuid: Yup.string().required(),
  email: Yup.string().required(),
  dateStart: Yup.date().required(),
  dateEnd: Yup.date().required(),
}).required();

export type FormulaireDto = Yup.InferType<typeof formulaireDtoSchema>;
