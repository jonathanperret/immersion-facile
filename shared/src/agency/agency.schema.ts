import { z } from "zod";
import { absoluteUrlSchema } from "../AbsoluteUrl";
import { addressSchema } from "../address/address.schema";
import { geoPositionSchema } from "../geoPosition/geoPosition.schema";
import { localization, zEmail, zString, zTrimmedString } from "../zodUtils";
import {
  AgencyDto,
  AgencyId,
  AgencyOption,
  AgencyIdResponse,
  AgencyKind,
  agencyKindList,
  AgencyPublicDisplayDto,
  allAgencyStatuses,
  CreateAgencyDto,
  ListAgenciesRequestDto,
  PrivateListAgenciesRequestDto,
  UpdateAgencyRequestDto,
  WithAgencyId,
} from "./agency.dto";

export const agencyIdSchema: z.ZodSchema<AgencyId> = zTrimmedString;

export const withAgencyIdSchema: z.Schema<WithAgencyId> = z.object({
  id: agencyIdSchema,
});

export const agencyIdResponseSchema: z.ZodSchema<AgencyIdResponse> = z.union([
  agencyIdSchema,
  z.object({ success: z.boolean() }),
]);

export const agencyIdAndNameSchema: z.ZodSchema<AgencyOption> = z.object({
  id: agencyIdSchema,
  name: z.string(),
});

export const agenciesIdAndNameSchema: z.ZodSchema<AgencyOption[]> = z.array(
  agencyIdAndNameSchema,
);

const agencyKindSchema: z.ZodSchema<AgencyKind> = z.enum(agencyKindList);

export const listAgenciesByDepartmentCodeRequestSchema: z.ZodSchema<ListAgenciesRequestDto> =
  z.object({
    departmentCode: z.string().optional(),
    nameIncludes: z.string().optional(),
    kind: z
      .enum([
        "immersionPeOnly",
        "immersionWithoutPe",
        "miniStageOnly",
        "miniStageExcluded",
      ])
      .optional(),
  });

const createAgencyShape = {
  id: agencyIdSchema,
  name: zString,
  kind: agencyKindSchema,
  address: addressSchema,
  position: geoPositionSchema,
  counsellorEmails: z.array(zEmail),
  validatorEmails: z.array(zEmail).refine((emails) => emails.length > 0, {
    message: localization.atLeastOneEmail,
  }),
  questionnaireUrl: z.string().optional(),
  signature: zString,
  logoUrl: absoluteUrlSchema.optional(),
};

export const createAgencySchema: z.ZodSchema<CreateAgencyDto> =
  z.object(createAgencyShape);

const agencyStatusSchema = z.enum(allAgencyStatuses);

export const agencySchema: z.ZodSchema<AgencyDto> = z.object({
  ...createAgencyShape,
  questionnaireUrl: z.string(),
  status: agencyStatusSchema,
  adminEmails: z.array(zString),
  agencySiret: zString.optional(),
  codeSafir: zString.optional(),
});

export const agenciesSchema: z.ZodSchema<AgencyDto[]> = z.array(agencySchema);

export const privateListAgenciesRequestSchema: z.ZodSchema<PrivateListAgenciesRequestDto> =
  z.object({
    status: agencyStatusSchema.optional(),
  });

export const updateAgencyRequestSchema: z.ZodSchema<UpdateAgencyRequestDto> =
  z.object({
    id: agencyIdSchema,
    status: agencyStatusSchema.optional(),
  });

export const agencyPublicDisplaySchema: z.ZodSchema<AgencyPublicDisplayDto> =
  z.object({
    id: agencyIdSchema,
    name: zString,
    address: addressSchema,
    position: geoPositionSchema,
    logoUrl: absoluteUrlSchema.optional(),
  });
