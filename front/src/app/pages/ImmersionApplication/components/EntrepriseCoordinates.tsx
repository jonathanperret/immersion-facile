import React from "react";
import { CopyLink } from "src/app/pages/ImmersionApplication/CopyLink";
import { ShareLinkByEmail } from "src/app/pages/ImmersionApplication/ShareLinkByEmail";
import { TextInput } from "src/uiComponents/form/TextInput";
import { FormSectionTitle } from "src/uiComponents/FormSectionTitle";

export const EnterpriseCoordinates = ({
  isFrozen = false,
  enableInseeApi,
  isFetchingSiret = false,
}: {
  isFrozen?: boolean;
  enableInseeApi: boolean;
  isFetchingSiret?: boolean;
}) => (
  <>
    <FormSectionTitle>
      2. Coordonnées de l'entreprise
      {!isFrozen && (
        <>
          <CopyLink />
          <ShareLinkByEmail />
        </>
      )}
    </FormSectionTitle>
    <h4>
      Les questions suivantes doivent être complétées avec la personne qui vous
      accueillera pendant votre immersion
    </h4>
    <TextInput
      label="Indiquez le SIRET de la structure d'accueil *"
      name="siret"
      placeholder="362 521 879 00034"
      description="la structure d'accueil, c'est l'entreprise, le commerce, l'association ... où vous allez faire votre immersion"
      disabled={isFrozen}
    />
    <TextInput
      label="Indiquez le nom (raison sociale) de l'établissement d'accueil *"
      name="businessName"
      type="text"
      placeholder=""
      description=""
      disabled={isFrozen || enableInseeApi}
    />
    <TextInput
      label="Indiquez le prénom, nom et fonction du tuteur *"
      name="mentor"
      type="text"
      placeholder=""
      description="Ex : Alain Prost, pilote automobile"
      disabled={isFrozen || isFetchingSiret}
    />
    <TextInput
      label="Indiquez le numéro de téléphone du tuteur ou de la structure d'accueil *"
      name="mentorPhone"
      type="tel"
      placeholder="0606060707"
      description="pour que l'on puisse le contacter à propos de l’immersion"
      disabled={isFrozen}
    />
    <TextInput
      label="Indiquez l'e-mail du tuteur *"
      name="mentorEmail"
      type="email"
      placeholder="nom@exemple.com"
      description="pour envoyer la validation de la convention"
      disabled={isFrozen}
      className="!mb-1"
    />
  </>
);
