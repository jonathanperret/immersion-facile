import { Formik, FormikHelpers } from "formik";
import React, { Dispatch, SetStateAction } from "react";
import {
  SubmitFeedback,
  SuccessFeedbackKind,
} from "src/app/components/SubmitFeedback";
import { immersionApplicationGateway } from "src/app/config/dependencies";
import { ApplicationFormFields } from "src/app/pages/ImmersionApplication/components/ApplicationFormFields";
import { ImmersionApplicationPresentation } from "src/app/pages/ImmersionApplication/ImmersionApplicationPage";
import { ImmersionApplicationDto } from "src/shared/ImmersionApplication/ImmersionApplication.dto";
import { toFormikValidationSchema } from "src/uiComponents/form/zodValidate";
import { z } from "zod";

export const FormikImmersionApplicationAddForm = ({
  initialValues,
  setInitialValues,
  setSubmitFeedback,
  submitFeedback,
  validationSchema,
}: {
  initialValues: ImmersionApplicationPresentation;
  setInitialValues: Dispatch<SetStateAction<ImmersionApplicationPresentation>>;
  setSubmitFeedback: Dispatch<
    SetStateAction<SuccessFeedbackKind | Error | null>
  >;
  submitFeedback: SuccessFeedbackKind | Error | null;
  validationSchema: z.Schema<ImmersionApplicationDto>;
}) => (
  <Formik
    enableReinitialize={true}
    initialValues={initialValues}
    validationSchema={toFormikValidationSchema(validationSchema)}
    onSubmit={addApplicationFormUseCase}
  >
    {(props) => (
      <div>
        <form onReset={props.handleReset} onSubmit={props.handleSubmit}>
          <ApplicationFormFields />
          <SubmitFeedback submitFeedback={submitFeedback} />
        </form>
      </div>
    )}
  </Formik>
);
