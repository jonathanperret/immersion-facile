import * as Yup from "yup";

export type TodoDto = { uuid: string; description: string };

export const todoDtoSchema: Yup.SchemaOf<TodoDto> = Yup.object({
  uuid: Yup.string().required(),
  description: Yup.string().required(),
}).required();
