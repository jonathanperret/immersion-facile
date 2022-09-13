import { z } from "zod";
import { siretSchema } from "../siret";
import { romeCodeSchemaV0 } from "../rome";
import { zPreprocessedBoolean, zPreprocessedNumber } from "../zodUtils";
import { SearchImmersionQueryParamsDto } from "./SearchImmersionQueryParams.dto";

export const searchImmersionQueryParamsSchema: z.Schema<SearchImmersionQueryParamsDto> =
  z.object({
    rome: romeCodeSchemaV0.optional(),
    siret: siretSchema.optional(),
    latitude: zPreprocessedNumber(),
    longitude: zPreprocessedNumber(),
    distance_km: zPreprocessedNumber(
      z.number().positive("'distance_km' doit être > 0"),
    ),
    voluntaryToImmersion: zPreprocessedBoolean().optional(),
    sortedBy: z.enum(["distance", "date"]),
  });
