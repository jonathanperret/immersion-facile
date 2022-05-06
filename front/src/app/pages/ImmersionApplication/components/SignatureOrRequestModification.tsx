import React from "react";
import {
  RequestModificationSubmitButton,
  SignSubmitButton,
} from "src/app/pages/ImmersionApplication/components/SubmitButton";
import { BoolCheckboxGroup } from "src/uiComponents/form/CheckboxGroup";

export const SignatureOrRequestModification = ({
  alreadySubmitted,
  isSignatureEnterprise,
  signeeName,
  isSubmitting,
  submitForm,
  onRejectForm,
}: {
  alreadySubmitted: boolean;
  isSignatureEnterprise: boolean;
  signeeName: string;
  isSubmitting: boolean;
  submitForm: () => Promise<void>;
  onRejectForm: () => Promise<void>;
}) => (
  <>
    {alreadySubmitted ? (
      <p>Vous avez signé la convention.</p>
    ) : (
      <>
        <BoolCheckboxGroup
          name={
            isSignatureEnterprise ? "enterpriseAccepted" : "beneficiaryAccepted"
          }
          label={`Je, soussigné ${signeeName} (${
            isSignatureEnterprise
              ? "représentant de la structure d'accueil"
              : "bénéficiaire de l'immersion"
          }) m'engage à avoir pris connaissance des dispositions réglementaires de la PMSMP et à les respecter *`}
          description="Avant de répondre, consultez ces dispositions ici"
          descriptionLink="https://docs.google.com/document/d/1siwGSE4fQB5hGWoppXLMoUYX42r9N-mGZbM_Gz_iS7c/edit?usp=sharing"
          disabled={false}
        />
        <p style={{ display: "flex", gap: "50px" }}>
          <SignSubmitButton isSubmitting={isSubmitting} onSubmit={submitForm} />

          <RequestModificationSubmitButton
            onSubmit={onRejectForm}
            isSubmitting={isSubmitting}
          />
        </p>
      </>
    )}
  </>
);
