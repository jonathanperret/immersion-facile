import { useFormikContext } from "formik";
import React from "react";
import type { ConventionDto } from "shared";
import { FormSectionTitle } from "../../commons/FormSectionTitle";
import { ConventionFrozenMessage } from "../ConventionFrozenMessage";
import { ConventionSignOnlyMessage } from "../ConventionSignOnlyMessage";
import { makeValuesToWatchInUrlForUkraine } from "../makeValuesToWatchInUrl";
import { SubmitButton } from "../SubmitButtons";
import { useConventionWatchValuesInUrl } from "../useConventionWatchValuesInUrl";
import { BeneficiaryFormSection } from "./beneficiary/BeneficiaryFormSection";
import { EstablishmentFormSection } from "./establishment/EstablishmentFormSection";
import { ImmersionConditionsCommonFields } from "./ImmersionConditionsCommonFields";

type ConventionFieldsProps = {
  isFrozen?: boolean;
  isSignOnly?: boolean;
  alreadySubmitted?: boolean;
};

export const ConventionFormFieldsUkraine = ({
  isFrozen,
  isSignOnly: isSignatureMode,
  alreadySubmitted,
}: ConventionFieldsProps) => {
  const { errors, submitCount, isSubmitting, submitForm, values } =
    useFormikContext<ConventionDto>();
  const watchedValues = makeValuesToWatchInUrlForUkraine(values);
  useConventionWatchValuesInUrl(watchedValues);

  return (
    <>
      {isFrozen && !isSignatureMode && <ConventionFrozenMessage />}
      {isFrozen && isSignatureMode && (
        <ConventionSignOnlyMessage
          isAlreadySigned={alreadySubmitted ?? false}
        />
      )}
      <BeneficiaryFormSection isFrozen={isFrozen} />

      <EstablishmentFormSection
        isFrozen={isFrozen}
        federatedIdentity={undefined}
      />

      <FormSectionTitle>
        3. Conditions d’accueil de l’immersion professionnelle
      </FormSectionTitle>
      <ImmersionConditionsCommonFields disabled={isFrozen} />

      {!isSignatureMode &&
        submitCount !== 0 &&
        Object.values(errors).length > 0 && (
          <div style={{ color: "red" }}>
            Veuillez corriger les champs erronés
          </div>
        )}
      {!isFrozen && (
        <p className="font-bold">
          Une fois le formulaire envoyé, vous allez recevoir une demande de
          validation par mail et l'entreprise également.
        </p>
      )}
      {!isFrozen && !isSignatureMode && (
        <div className="fr-mt-1w">
          <SubmitButton isSubmitting={isSubmitting} onSubmit={submitForm} />
        </div>
      )}
    </>
  );
};
