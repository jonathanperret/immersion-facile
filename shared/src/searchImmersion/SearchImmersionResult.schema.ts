import { z } from "zod";
import { addressSchema } from "../address/address.schema";
import { geoPositionSchema } from "../geoPosition/geoPosition.schema";
import { romeCodeSchema } from "../rome";
import { siretSchema } from "../siret/siret";
import { zStringPossiblyEmpty } from "../zodUtils";
import {
  SearchContactDto,
  SearchImmersionResultDto,
} from "./SearchImmersionResult.dto";

export const contactDetailsSchema: z.Schema<SearchContactDto> = z.object({
  id: z.string(),
  lastName: z.string(),
  firstName: z.string(),
  email: z.string(),
  job: z.string(),
  phone: z.string(),
});

export const searchImmersionResultSchema: z.Schema<SearchImmersionResultDto> =
  z.object({
    rome: romeCodeSchema,
    romeLabel: z.string(),
    appellationLabels: z.array(z.string()),
    naf: z.string(),
    nafLabel: z.string(),
    siret: siretSchema,
    name: z.string(),
    customizedName: z.string().optional(),
    voluntaryToImmersion: z.boolean(),
    position: geoPositionSchema,
    address: addressSchema,
    contactMode: z.enum(["EMAIL", "PHONE", "IN_PERSON"]).optional(),
    distance_m: z.number().optional(),
    contactDetails: contactDetailsSchema.optional(),
    numberOfEmployeeRange: z.string().optional(),
    website: zStringPossiblyEmpty.optional(),
    additionalInformation: zStringPossiblyEmpty.optional(),
    fitForDisabledWorkers: z.boolean().optional(),
  });

export const searchImmersionsSchema = z.array(searchImmersionResultSchema);
