import { FormikErrors } from "formik";
import { ImmersionApplicationPresentation } from "src/app/pages/ImmersionApplication/ImmersionApplicationPage";
import { ApplicationFormKeysInUrl } from "src/app/routing/route-params";
import { ImmersionApplicationDto } from "shared/src/ImmersionApplication/ImmersionApplication.dto";

export const makeValuesToWatchInUrl = (
  values: ImmersionApplicationDto,
): Partial<ImmersionApplicationDto> => {
  const keysToWatch: ApplicationFormKeysInUrl[] = [
    "peExternalId",
    "email",
    "firstName",
    "lastName",
    "phone",
    "emergencyContact",
    "emergencyContactPhone",
    "postalCode",
    "dateStart",
    "dateEnd",
    "siret",
    "businessName",
    "mentor",
    "mentorEmail",
    "mentorPhone",
    "agencyId",

    "immersionAddress",
    "sanitaryPrevention",
    "individualProtection",
    "sanitaryPreventionDescription",
    "immersionObjective",
    "immersionActivities",
    "immersionSkills",
    "workConditions",

    "schedule",
    "immersionAppellation",
  ];

  return keysToWatch.reduce(
    (acc, watchedKey) => ({ ...acc, [watchedKey]: values[watchedKey] }),
    {} as Partial<ImmersionApplicationDto>,
  );
};

export const immersionApplicationHasError = (
  isSignatureMode: undefined | boolean,
  submitCount: number,
  errors: FormikErrors<ImmersionApplicationPresentation>,
) => !isSignatureMode && submitCount !== 0 && Object.values(errors).length > 0;

export const immersionApplicationIsInAddMode = (
  isFrozen: undefined | boolean,
  isSignatureMode: undefined | boolean,
) => !isFrozen && !isSignatureMode;
