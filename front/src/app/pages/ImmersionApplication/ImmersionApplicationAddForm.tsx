import { Formik, FormikErrors, FormikProps } from "formik";
import React, { useState } from "react";
import { immersionApplicationSchema } from "shared/src/ImmersionApplication/immersionApplication.schema";
import { AppellationDto } from "shared/src/romeAndAppellationDtos/romeAndAppellation.dto";
import { SubmitFeedback, SuccessFeedbackKind, } from "src/app/components/SubmitFeedback";
import { immersionApplicationGateway } from "src/app/config/dependencies";
import { EnterpriseCoordinates } from "src/app/pages/ImmersionApplication/components/EntrepriseCoordinates";
import {
    ImmersionApplicationStaticText
} from "src/app/pages/ImmersionApplication/components/ImmersionApplicationStaticText";
import { ImmersionCondition } from "src/app/pages/ImmersionApplication/components/ImmersionCondition";
import { InformationNotification } from "src/app/pages/ImmersionApplication/components/InformationNotification";
import { AddOrEditSubmitButton } from "src/app/pages/ImmersionApplication/components/SubmitButton";
import { ValidationErrorFeedback } from "src/app/pages/ImmersionApplication/components/ValidationErrorFeedback";
import { ImmersionApplicationPresentation } from "src/app/pages/ImmersionApplication/ImmersionApplicationPage";
import { PeConnect } from "src/app/pages/ImmersionApplication/PeConnect";
import { useAppSelector } from "src/app/utils/reduxHooks";
import { featureFlagsSelector } from "src/core-logic/domain/featureFlags/featureFlags.selector";
import {
    immersionApplicationSelectors
} from "src/core-logic/domain/immersionApplication/immersionApplication.selectors";
import { toFormikValidationSchema } from "src/uiComponents/form/zodValidate";
import { BeneficiaryCoordinates } from "./components/BeneficiaryCoordinates";

type ImmersionApplicationFormProps = {
  properties: ImmersionApplicationPresentation;
};

export const ImmersionApplicationAddForm = ({
  properties,
}: ImmersionApplicationFormProps) => {

  const [initialValues] = useState(properties);

  const { enableInseeApi: inseeApiIsEnabled } = useAppSelector(featureFlagsSelector);

  const submitFeedback: SuccessFeedbackKind | Error | null = useAppSelector(immersionApplicationSelectors.submitFeedbackStatus);

  return (
    <>
      <ImmersionApplicationStaticText />

      <PeConnect />

      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={toFormikValidationSchema(immersionApplicationSchema)}
        onSubmit={immersionApplicationonSubmit}
      >
        {(props: FormikProps<ImmersionApplicationPresentation>) => (
          <div>
            <form onReset={props.handleReset} onSubmit={props.handleSubmit}>
              <>
                <input type="hidden" name="peExternalIdentity" />

                <BeneficiaryCoordinates agencyId={ props?.values?.agencyId } />

                <EnterpriseCoordinates enableInseeApi={inseeApiIsEnabled} />

                <ImmersionCondition
                  values={{
                    immersionAddress: props.values.immersionAddress,
                    immersionAppellation:
                      props.values.immersionAppellation ||
                      ({} as AppellationDto),
                  }}
                  establishmentInfo={{ businessAddress: "" }}
                  setFieldValue={props.setFieldValue}
                />

                {hasSubmitError(props.submitCount, props.errors) && (
                  <ValidationErrorFeedback />
                )}

                <AddOrEditSubmitButton
                  isSubmitting={props.isSubmitting}
                  onSubmit={props.submitForm}
                />
                <InformationNotification />
              </>
              <SubmitFeedback submitFeedback={submitFeedback} />
            </form>
          </div>
        )}
      </Formik>
    </>
  );
};

const hasSubmitError = (
  submitCount: number,
  errors: FormikErrors<ImmersionApplicationPresentation>,
) => submitCount !== 0 && Object.values(errors).length > 0;

const immersionApplicationonSubmit = async (
  values: ImmersionApplicationPresentation,
) => {
  //try {
  await immersionApplicationGateway.add(
    immersionApplicationSchema.parse(values),
  );
  //setInitialValues(values);

  //} catch (e: any) {
  //eslint-disable-next-line no-console
  //console.log("onSubmit error", e);
  //setSubmitFeedback(e);
  //}
  //setSubmitting(false);
};
