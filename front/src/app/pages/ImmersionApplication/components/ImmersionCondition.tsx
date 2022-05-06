import React from "react";
import {
  BoolRadioGroup,
  RadioGroupForField,
} from "src/app/components/RadioGroup";
import { ApplicationFormProfession } from "src/app/pages/ImmersionApplication/ApplicationFormProfession";
import { CopyLink } from "src/app/pages/ImmersionApplication/CopyLink";
import { ShareLinkByEmail } from "src/app/pages/ImmersionApplication/ShareLinkByEmail";
import { AppellationDto } from "shared/src/romeAndAppellationDtos/romeAndAppellation.dto";
import { AddressAutocomplete } from "src/uiComponents/AddressAutocomplete";
import { DateInput } from "src/uiComponents/form/DateInput";
import {
  SchedulePicker,
  scheduleValidator,
} from "src/uiComponents/form/SchedulePicker/SchedulePicker";
import { TextInput } from "src/uiComponents/form/TextInput";
import { FormSectionTitle } from "src/uiComponents/FormSectionTitle";

export const ImmersionCondition = ({
  isFrozen = false,
  values,
  establishmentInfo,
  isFetchingSiret = false,
  setFieldValue,
}: {
  isFrozen?: boolean;
  values: { immersionAddress?: string; immersionAppellation: AppellationDto };
  establishmentInfo: { businessAddress: string } | undefined;
  isFetchingSiret?: boolean;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined,
  ) => void;
}) => (
  <>
    <FormSectionTitle>
      3. Conditions d’accueil de l’immersion professionnelle
      {!isFrozen && (
        <>
          <CopyLink />
          <ShareLinkByEmail />
        </>
      )}
    </FormSectionTitle>
    <DateInput
      label="Date de début de l'immersion *"
      name="dateStart"
      type="date"
      disabled={isFrozen}
    />
    <br />
    <DateInput
      label="Date de fin de l'immersion *"
      name="dateEnd"
      type="date"
      disabled={isFrozen}
    />
    <br />
    <SchedulePicker
      name="schedule"
      validate={scheduleValidator}
      setFieldValue={(x) => {
        setFieldValue("schedule", x);
      }}
      disabled={isFrozen}
    />
    <br />
    <TextInput
      label="Conditions de travail, propres  au métier observé pendant l’immersion. "
      name="workConditions"
      description="Ex : transport de marchandises longue distance - pas de retour au domicile pendant 2 jours"
      disabled={isFrozen}
    />
    <br />
    <AddressAutocomplete
      initialSearchTerm={
        values.immersionAddress ?? establishmentInfo?.businessAddress
      }
      label="Adresse du lieu où se fera l'immersion * "
      setFormValue={({ label }) => setFieldValue("immersionAddress", label)}
      disabled={isFrozen || isFetchingSiret}
    />
    <br />
    <BoolRadioGroup
      name="individualProtection"
      label="Un équipement de protection individuelle est-il fourni pour l’immersion ? *"
      disabled={isFrozen}
    />
    <BoolRadioGroup
      name="sanitaryPrevention"
      label="Des mesures de prévention sanitaire sont-elles prévues pour l’immersion ? *"
      disabled={isFrozen}
    />
    <TextInput
      label="Si oui, précisez-les"
      name="sanitaryPreventionDescription"
      type="text"
      placeholder=""
      description="Ex : fourniture de gel, de masques"
      disabled={isFrozen}
    />
    <RadioGroupForField
      name="immersionObjective"
      label="Objet de la période de mise en situation en milieu professionnel *"
      options={[
        { value: "Confirmer un projet professionnel" },
        { value: "Découvrir un métier ou un secteur d'activité" },
        { value: "Initier une démarche de recrutement" },
      ]}
      disabled={isFrozen}
    />
    <ApplicationFormProfession
      label="Intitulé du poste / métier observé pendant l'immersion *"
      description="Ex : employé libre service, web développeur, boulanger …"
      disabled={isFrozen}
      initialFieldValue={values.immersionAppellation}
    />
    <TextInput
      label="Activités observées / pratiquées pendant l'immersion *"
      name="immersionActivities"
      type="text"
      placeholder=""
      description="Ex : mise en rayon, accueil et aide à la clientèle"
      disabled={isFrozen}
    />
    <TextInput
      label="Compétences/aptitudes observées / évaluées pendant l'immersion"
      name="immersionSkills"
      type="text"
      placeholder=""
      description="Ex : communiquer à l'oral, résoudre des problèmes, travailler en équipe"
      disabled={isFrozen}
    />
  </>
);
