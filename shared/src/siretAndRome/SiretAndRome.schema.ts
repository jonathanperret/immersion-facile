import { z } from "zod";
import { siretSchema } from "../siret";
import { romeCodeSchemaV0 } from "../rome";
import { SiretAndRomeDto } from "./SiretAndRome.dto";

export const siretAndRomeSchema: z.Schema<SiretAndRomeDto> = z.object({
  rome: romeCodeSchemaV0,
  siret: siretSchema,
});
