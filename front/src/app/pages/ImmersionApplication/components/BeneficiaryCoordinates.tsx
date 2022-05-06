import React from "react";
import { AgencyDisplay } from "src/app/components/AgencyDisplay";
import { AgencySelector } from "src/app/components/AgencySelector";
import { TextInput } from "src/uiComponents/form/TextInput";
import { FormSectionTitle } from "src/uiComponents/FormSectionTitle";

export const BeneficiaryCoordinates = ({
  isFrozen = false,
  agencyId,
}: {
  isFrozen?: boolean;
  agencyId: string | undefined;
}) => (
  <>
    <FormSectionTitle>1. Coordonnées du bénéficiaire</FormSectionTitle>
    <TextInput
      label="Email *"
      name="email"
      type="email"
      placeholder="nom@exemple.com"
      description="cela nous permet de vous transmettre la validation de la convention"
      disabled={isFrozen}
    />
    <TextInput
      label="Votre prénom *"
      name="firstName"
      type="text"
      placeholder=""
      description=""
      disabled={isFrozen}
    />
    <TextInput
      label="Votre nom *"
      name="lastName"
      type="text"
      placeholder=""
      description=""
      disabled={isFrozen}
    />
    <TextInput
      label="Votre numéro de téléphone"
      name="phone"
      type="tel"
      placeholder="0606060607"
      description="pour qu’on puisse vous contacter à propos de l’immersion"
      disabled={isFrozen}
    />

    {isFrozen && (
      <AgencyDisplay
        label="Votre structure d'accompagnement *"
        agencyId={agencyId}
      />
    )}
    {!isFrozen && (
      <AgencySelector
        label="Votre structure d'accompagnement *"
        disabled={isFrozen}
        defaultAgencyId={agencyId}
      />
    )}
    <TextInput
      label="Indiquez le prénom et le nom de la personne à prévenir en cas d'urgence"
      name="emergencyContact"
      type="text"
      placeholder=""
      description=""
      disabled={isFrozen}
    />
    <TextInput
      label="Indiquez le numéro de téléphone de la personne à prévenir en cas d'urgence"
      name="emergencyContactPhone"
      type="tel"
      placeholder="0606060607"
      description=""
      disabled={isFrozen}
    />
  </>
);
