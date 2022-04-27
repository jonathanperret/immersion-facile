import React, { useState } from "react";
import { SuccessFeedbackKind } from "src/app/components/SubmitFeedback";
import { FormikImmersionApplicationAddForm } from "src/app/pages/ImmersionApplication/components/FormikImmersionApplicationAddForm";
import { ImmersionApplicationPresentation } from "src/app/pages/ImmersionApplication/ImmersionApplicationPage";
import { immersionApplicationUkraineSchema } from "src/shared/ImmersionApplication/immersionApplication.schema";
import { Title } from "src/uiComponents/Title";

type ImmersionApplicationFormProps = {
  properties: ImmersionApplicationPresentation;
};

export const ImmersionApplicationAddFormUkraine = ({
  properties,
}: ImmersionApplicationFormProps) => {
  const [initialValues, setInitialValues] = useState(properties);
  const [submitFeedback, setSubmitFeedback] = useState<
    SuccessFeedbackKind | Error | null
  >(null);

  return (
    <>
      <StaticTextUkraine />
      <FormikImmersionApplicationAddForm
        initialValues={initialValues}
        setInitialValues={setInitialValues}
        setSubmitFeedback={setSubmitFeedback}
        submitFeedback={submitFeedback}
        validationSchema={immersionApplicationUkraineSchema}
      />
    </>
  );
};

const StaticTextUkraine = () => (
  <>
    <div className="flex justify-center">
      <Title red>
        Formulaire pour conventionner une période de mise en situation
        professionnelle (PMSMP) à destination des réfugiés ukrainiens
      </Title>
    </div>

    <div className="fr-text">
      <p className="fr-text--xs">
        Ce formulaire vaut équivalence du CERFA 13912 * 04
      </p>
    </div>
  </>
);
