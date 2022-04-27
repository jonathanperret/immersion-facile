import React, { useState } from "react";
import { PeConnect } from "src/app/components/PeConnect";
import { SuccessFeedbackKind } from "src/app/components/SubmitFeedback";
import { FormikImmersionApplicationAddForm } from "src/app/pages/ImmersionApplication/components/FormikImmersionApplicationAddForm";
import { ImmersionApplicationPresentation } from "src/app/pages/ImmersionApplication/ImmersionApplicationPage";
import { immersionApplicationSchema } from "src/shared/ImmersionApplication/immersionApplication.schema";
import { Title } from "src/uiComponents/Title";

type ImmersionApplicationFormProps = {
  properties: ImmersionApplicationPresentation;
  routeParams?: { jwt?: string; demandeId?: string };
};

export const ImmersionApplicationAddForm = ({
  properties,
}: ImmersionApplicationFormProps) => {
  const [initialValues, setInitialValues] = useState(properties);
  const [submitFeedback, setSubmitFeedback] = useState<
    SuccessFeedbackKind | Error | null
  >(null);

  return (
    <>
      <StaticText />

      <PeConnect />

      <FormikImmersionApplicationAddForm
        initialValues={initialValues}
        setInitialValues={setInitialValues}
        setSubmitFeedback={setSubmitFeedback}
        submitFeedback={submitFeedback}
        validationSchema={immersionApplicationSchema}
      />
    </>
  );
};

const StaticText = () => (
  <>
    <div className="flex justify-center">
      <Title red>
        Formulaire pour conventionner une période de mise en situation
        professionnelle (PMSMP)
      </Title>
    </div>

    <div className="fr-text">
      <span className="font-bold">
        Attention, le formulaire de demande de convention est en cours de test
        dans quelques départements ou villes.
      </span>
      <br />
      Il ne peut être utilisé que si votre conseiller ou votre agence/mission
      locale/espace solidarité apparaît dans la liste. Si ce n'est pas le cas,
      contactez votre conseiller. Il établira la convention avec vous et
      l'entreprise qui va vous accueillir.
    </div>
    <div className="fr-text">
      Bravo ! <br />
      Vous avez trouvé une entreprise pour vous accueillir en immersion. <br />
      Avant tout, vous devez faire établir une convention pour cette immersion
      et c'est ici que ça se passe. <br />
      En quelques minutes, complétez ce formulaire avec l'entreprise qui vous
      accueillera. <br />
      <p className="fr-text--xs">
        Ce formulaire vaut équivalence du CERFA 13912 * 04
      </p>
    </div>
  </>
);
