import React from "react";
import { FederatedIdentity } from "shared";
import { useConventionTextsFromFormikContext } from "src/app/contents/convention/textSetup";
import { FormSectionTitle } from "../../../commons/FormSectionTitle";
import { ShareActions } from "../../ShareActions";
import { ImmersionConditionsCommonFields } from "../ImmersionConditionsCommonFields";

type ImmersionConditionFormSectionProperties = {
  federatedIdentity: FederatedIdentity | undefined;
  isFrozen: boolean | undefined;
};

export const ImmersionConditionFormSection = ({
  federatedIdentity,
  isFrozen,
}: ImmersionConditionFormSectionProperties): JSX.Element => {
  const t = useConventionTextsFromFormikContext();
  return (
    <>
      <FormSectionTitle>
        {t.immersionConditionsSection.title}
        <ShareActions
          isFrozen={isFrozen}
          federatedIdentity={federatedIdentity}
        />
      </FormSectionTitle>
      <ImmersionConditionsCommonFields disabled={isFrozen} />
    </>
  );
};
