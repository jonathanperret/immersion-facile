import { PoolClient } from "pg";
import { ConventionId, ConventionReadDto, conventionReadSchema } from "shared";

export const selectAllConventionDtosById = `
WITH 
  beneficiaries AS (SELECT conventions.id as convention_id, actors.* from actors LEFT JOIN conventions ON actors.id = beneficiary_id),
  beneficiaryRepresentative AS (SELECT conventions.id as convention_id, actors.* from actors LEFT JOIN conventions ON actors.id = beneficiary_representative_id),
  beneficiariesCurrentEmployer AS (SELECT conventions.id as convention_id, actors.* from actors LEFT JOIN conventions ON actors.id = beneficiary_current_employer_id),
  establishmentTutors AS (SELECT conventions.id as convention_id, actors.* from actors LEFT JOIN conventions ON actors.id = establishment_tutor_id),
  establishmentRepresentative AS (SELECT conventions.id as convention_id, actors.* from actors LEFT JOIN conventions ON actors.id = establishment_representative_id),
  formated_signatories AS (
    SELECT 
    b.convention_id,
    JSON_BUILD_OBJECT(
      'beneficiary' , JSON_BUILD_OBJECT(
        'role', 'beneficiary',
        'firstName', b.first_name,
        'lastName', b.last_name,
        'email', b.email,
        'phone', b.phone,
        'signedAt', date_to_iso(b.signed_at),
        'emergencyContact', b.extra_fields ->> 'emergencyContact',
        'emergencyContactPhone', b.extra_fields ->> 'emergencyContactPhone',
        'emergencyContactEmail', b.extra_fields ->> 'emergencyContactEmail',
        'federatedIdentity', CASE WHEN  (p.user_pe_external_id IS NOT NULL) THEN CONCAT('peConnect:', p.user_pe_external_id) ELSE NULL END,
        'levelOfEducation', CASE WHEN  (b.extra_fields ->> 'levelOfEducation' IS NOT NULL) THEN b.extra_fields ->> 'levelOfEducation' ELSE NULL END,
        'birthdate', CASE WHEN  (b.extra_fields ->> 'birthdate' IS NOT NULL) THEN b.extra_fields ->> 'birthdate' ELSE '1970-01-01T12:00:00.000Z' END
      ),
      'beneficiaryCurrentEmployer' , CASE WHEN bce IS NULL THEN NULL ELSE JSON_BUILD_OBJECT(
        'role', 'beneficiary-current-employer',
        'firstName', bce.first_name,
        'lastName', bce.last_name,
        'email', bce.email,
        'phone', bce.phone,
        'job', bce.extra_fields ->> 'job',
        'businessSiret', bce.extra_fields ->> 'businessSiret',
        'businessName', bce.extra_fields ->> 'businessName',
        'signedAt', date_to_iso(bce.signed_at)
      ) END,
      'establishmentRepresentative' , JSON_BUILD_OBJECT(
        'role', 'establishment-representative',
        'firstName', er.first_name,
        'lastName', er.last_name,
        'email', er.email,
        'phone', er.phone,
        'signedAt', date_to_iso(er.signed_at)
      ),
      'beneficiaryRepresentative' , CASE WHEN br IS NULL THEN NULL ELSE JSON_BUILD_OBJECT(
        'role', 'beneficiary-representative',
        'firstName', br.first_name,
        'lastName', br.last_name,
        'email', br.email,
        'phone', br.phone,
        'signedAt', date_to_iso(br.signed_at)
      ) END
    ) AS signatories
    FROM beneficiaries AS b
    LEFT JOIN beneficiaryRepresentative as br ON b.convention_id = br.convention_id
    LEFT JOIN beneficiariesCurrentEmployer as bce ON b.convention_id = bce.convention_id
    LEFT JOIN establishmentRepresentative as er ON b.convention_id = er.convention_id
    LEFT JOIN partners_pe_connect AS p ON p.convention_id = b.convention_id)

SELECT 
  conventions.id,
  JSON_STRIP_NULLS(
    JSON_BUILD_OBJECT(
      'id', conventions.id,
      'externalId', external_id::text, 
      'status', conventions.status,
      'dateValidation', date_to_iso(date_validation),
      'dateSubmission', date_to_iso(date_submission),
      'dateStart',  date_to_iso(date_start),
      'dateEnd', date_to_iso(date_end),
      'signatories', signatories,
      'siret', siret, 
      'schedule', schedule,
      'businessName', business_name, 
      'workConditions', work_conditions, 
      'postalCode', postal_code, 
      'agencyId', agency_id, 
      'agencyName', agencies.name,
      'agencyDepartment', agencies.department_code,
      'individualProtection', individual_protection,
      'sanitaryPrevention', sanitary_prevention,
      'sanitaryPreventionDescription', sanitary_prevention_description,
      'immersionAddress', immersion_address,
      'immersionObjective', immersion_objective,
      'immersionAppellation', JSON_BUILD_OBJECT(
        'appellationCode', vad.appellation_code::text, 
        'appellationLabel', vad.appellation_label, 
        'romeCode', vad.rome_code,  
        'romeLabel', vad.rome_label
      ),
      'immersionActivities', immersion_activities,
      'immersionSkills', immersion_skills,
      'internshipKind', internship_kind,
      'establishmentTutor' , JSON_BUILD_OBJECT(
        'role', 'establishment-tutor',
        'firstName', et.first_name,
        'lastName', et.last_name,
        'email', et.email,
        'phone', et.phone,
        'job', et.extra_fields ->> 'job'
      )
    )
  ) AS dto

FROM 
conventions LEFT JOIN formated_signatories ON formated_signatories.convention_id = conventions.id
LEFT JOIN establishmentTutors as et ON conventions.id = et.convention_id
LEFT JOIN view_appellations_dto AS vad ON vad.appellation_code = conventions.immersion_appellation
LEFT JOIN convention_external_ids AS cei ON cei.convention_id = conventions.id
LEFT JOIN agencies ON agencies.id = conventions.agency_id
`;

const getReadConventionByIdQuery = `
WITH convention_dtos AS (${selectAllConventionDtosById})
SELECT * FROM convention_dtos WHERE id = $1`;

export const getReadConventionById = async (
  client: PoolClient,
  conventionId: ConventionId,
): Promise<ConventionReadDto | undefined> => {
  const pgResult = await client.query<{ dto: unknown }>(
    getReadConventionByIdQuery,
    [conventionId],
  );
  const pgConvention = pgResult.rows.at(0);
  return pgConvention && conventionReadSchema.parse(pgConvention.dto);
};
