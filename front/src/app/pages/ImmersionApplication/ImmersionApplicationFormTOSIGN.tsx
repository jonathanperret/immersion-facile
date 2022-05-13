import { Formik, FormikProps } from "formik";
import React, { useState } from "react";
import { ImmersionApplicationDto } from "shared/src/ImmersionApplication/ImmersionApplication.dto";
import { immersionApplicationSchema } from "shared/src/ImmersionApplication/immersionApplication.schema";
import { AppellationDto } from "shared/src/romeAndAppellationDtos/romeAndAppellation.dto";
import {
  SubmitFeedback,
  SuccessFeedbackKind,
} from "src/app/components/SubmitFeedback";
import {
  immersionApplicationHasError,
  immersionApplicationIsInAddMode,
} from "src/app/pages/ImmersionApplication/ApplicationFormField";
import { ImmersionApplicationStaticText } from "src/app/pages/ImmersionApplication/components/ImmersionApplicationStaticText";
import { ImmersionCondition } from "src/app/pages/ImmersionApplication/components/ImmersionCondition";
import { InformationNotification } from "src/app/pages/ImmersionApplication/components/InformationNotification";
import { AddOrEditSubmitButton } from "src/app/pages/ImmersionApplication/components/SubmitButton";
import { ValidationErrorFeedback } from "src/app/pages/ImmersionApplication/components/ValidationErrorFeedback";
import { FrozenMessage } from "src/app/pages/ImmersionApplication/FrozenMessage";
import {
  createOrUpdateImmersionApplication,
  isImmersionApplicationFrozen,
  undefinedIfEmptyString,
} from "src/app/pages/ImmersionApplication/immersionApplicationHelpers";
import { ImmersionApplicationPresentation } from "src/app/pages/ImmersionApplication/ImmersionApplicationPage";
import { PeConnect } from "src/app/pages/ImmersionApplication/PeConnect";
import { SignOnlyMessage } from "src/app/pages/ImmersionApplication/SignOnlyMessage";
import { toFormikValidationSchema } from "src/uiComponents/form/zodValidate";
import { SignatureOrRequestModification } from "./components/SignatureOrRequestModification";

type ImmersionApplicationFormProps = {
  properties: ImmersionApplicationPresentation;
  routeParams?: { jwt?: string; demandeId?: string };
};

export const ImmersionApplicationForm = ({
  properties,
  routeParams = {},
}: ImmersionApplicationFormProps) => {
  const [initialValues, setInitialValues] = useState(properties);
  const [submitFeedback, setSubmitFeedback] = useState<
    SuccessFeedbackKind | Error | null
  >(null);

  /* useEffect(() => {
    if (!("demandeId" in routeParams) && !("jwt" in routeParams)) return;
    if (!("jwt" in routeParams) || routeParams.jwt === undefined) {
      return;
    }
    immersionApplicationGateway
      .getMagicLink(routeParams.jwt)
      .then((response) => {
        if (response.status === "DRAFT") {
          response.dateSubmission = toDateString(startOfToday());
        }
        setInitialValues(response);
      })
      .catch((e) => {
        //eslint-disable-next-line no-console
        console.log("immersionApplicationGateway fetch error", e);
      });
  }, []);*/

  const isFrozen = isImmersionApplicationFrozen(initialValues);

  // TODO
  /*const {
    errors,
    submitCount,
    setFieldValue,
    isSubmitting,
    submitForm,
    values,
  } = useFormikContext<ImmersionApplicationDto>();*/
  //const featureFlags = useAppSelector(featureFlagsSelector);
  //const isSiretFetcherDisabled = properties.status !== "DRAFT";
  /*  const { establishmentInfo, isFetchingSiret } = useSiretFetcher({
    fetchSirenApiEvenAlreadyInDb: true,
    disabled: isSiretFetcherDisabled,
  });
  useSiretRelatedField("businessName", establishmentInfo, {
    disabled: isSiretFetcherDisabled,
  });
  useSiretRelatedField("businessAddress", establishmentInfo, {
    fieldToUpdate: "immersionAddress",
    disabled: isSiretFetcherDisabled,
  });*/

  /*  const watchedValues: Partial<ImmersionApplicationDto> =
      makeValuesToWatchInUrl(initialValues);
  const {
    schedule,
    immersionAppellation,
    ...watchedValuesExceptScheduleAndAppellation
  } = watchedValues;

  const route = useRoute();*/
  /*  useEffect(() => {
    if (route.name !== "immersionApplication" || !!route.params.jwt) return;
    routes.immersionApplication(watchedValues).replace();
  }, [
    ...Object.values(watchedValuesExceptScheduleAndAppellation),
    JSON.stringify(properties.schedule),
    JSON.stringify(properties.immersionAppellation),
  ]);*/
  const isSignatureMode = false;
  const alreadySubmitted = false;
  const isSignatureEnterprise = false;
  const signeeName = "";
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const onRejectForm = async () => {};

  // TODO

  return (
    <div className="fr-grid-row fr-grid-row--center fr-grid-row--gutters">
      <div className="fr-col-lg-8 fr-p-2w">
        <ImmersionApplicationStaticText />

        <PeConnect />

        <Formik
          enableReinitialize={true}
          initialValues={initialValues}
          validationSchema={toFormikValidationSchema(
            immersionApplicationSchema,
          )}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const immersionApplicationParsed: ImmersionApplicationDto =
                immersionApplicationSchema.parse(values);
              const immersionApplication: ImmersionApplicationDto = {
                ...immersionApplicationParsed,
                workConditions: undefinedIfEmptyString(
                  immersionApplicationParsed.workConditions,
                ),
              };

              await createOrUpdateImmersionApplication(
                routeParams,
                immersionApplication,
              );
              setInitialValues(immersionApplication);
              setSubmitFeedback("justSubmitted");
            } catch (e: any) {
              //eslint-disable-next-line no-console
              console.log("onSubmit error", e);
              setSubmitFeedback(e);
            }
            setSubmitting(false);
          }}
        >
          {(props: FormikProps<ImmersionApplicationPresentation>) => (
            <div>
              <form onReset={props.handleReset} onSubmit={props.handleSubmit}>
                <>
                  {isFrozen && !isSignatureMode && <FrozenMessage />}

                  {isFrozen && isSignatureMode && (
                    <SignOnlyMessage
                      isAlreadySigned={alreadySubmitted ?? false}
                    />
                  )}

                  <input type="hidden" name="peExternalIdentity" />

                  {/*  <BeneficiaryCoordinates
                    isFrozen={isFrozen || false}
                    values={{ agencyId: props.values.agencyId || "" }}
                  />

                  <EnterpriseCoordinates
                    isFrozen={isFrozen || false}
                    featureFlags={featureFlags}
                    isFetchingSiret={false}
                  />*/}

                  <ImmersionCondition
                    isFrozen={isFrozen || false}
                    values={{
                      immersionAddress: props.values.immersionAddress,
                      immersionAppellation:
                        props.values.immersionAppellation ||
                        ({} as AppellationDto),
                    }}
                    establishmentInfo={{ businessAddress: "" }}
                    isFetchingSiret={false}
                    setFieldValue={props.setFieldValue}
                  />

                  {immersionApplicationHasError(
                    isSignatureMode,
                    props.submitCount,
                    props.errors,
                  ) && <ValidationErrorFeedback />}

                  {!isFrozen && <InformationNotification />}

                  {immersionApplicationIsInAddMode(
                    isFrozen,
                    isSignatureMode,
                  ) && (
                    <AddOrEditSubmitButton
                      isSubmitting={props.isSubmitting}
                      onSubmit={props.submitForm}
                    />
                  )}

                  {isSignatureMode && (
                    <SignatureOrRequestModification
                      alreadySubmitted={alreadySubmitted || false}
                      isSignatureEnterprise={isSignatureEnterprise || false}
                      signeeName={signeeName || ""}
                      isSubmitting={props.isSubmitting}
                      submitForm={props.submitForm}
                      onRejectForm={onRejectForm}
                    />
                  )}
                </>
                <SubmitFeedback submitFeedback={submitFeedback} />
              </form>
            </div>
          )}
        </Formik>
      </div>
    </div>
  );
};
