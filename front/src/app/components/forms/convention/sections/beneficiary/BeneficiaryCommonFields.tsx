import { useFormikContext } from "formik";
import React from "react";
import { useDispatch } from "react-redux";
import { ConventionDto, getConventionFieldName } from "shared";
import { RadioGroup } from "src/app/components/RadioGroup";
import { BeneficiaryRepresentativeFields } from "src/app/components/forms/convention/sections/beneficiary/BeneficiaryRepresentativeFields";
import { useConventionTextsFromFormikContext } from "src/app/contents/convention/textSetup";
import { useAppSelector } from "src/app/hooks/reduxHooks";
import { conventionSelectors } from "src/core-logic/domain/convention/convention.selectors";
import { conventionSlice } from "src/core-logic/domain/convention/convention.slice";
import { DateInput } from "src/app/components/forms/commons/DateInput";
import { TextInput } from "src/app/components/forms/commons/TextInput";
import { BeneficiaryCurrentEmployerFields } from "./BeneficiaryCurrentEmployerFields";
import { ConventionEmailWarning } from "src/app/components/forms/convention/ConventionEmailWarning";

export const BeneficiaryCommonFields = ({
  disabled,
}: {
  disabled?: boolean;
}) => {
  const { setFieldValue } = useFormikContext<ConventionDto>();
  const isMinor = useAppSelector(conventionSelectors.isMinor);
  const hasCurrentEmployer = useAppSelector(
    conventionSelectors.hasCurrentEmployer,
  );
  const dispatch = useDispatch();
  const t = useConventionTextsFromFormikContext();
  const { values } = useFormikContext<ConventionDto>();
  return (
    <>
      <TextInput
        label={`${t.beneficiarySection.firstNameLabel} *`}
        name={getConventionFieldName("signatories.beneficiary.firstName")}
        type="text"
        placeholder=""
        description=""
        disabled={disabled}
      />
      <TextInput
        label={`${t.beneficiarySection.lastNameLabel} *`}
        name={getConventionFieldName("signatories.beneficiary.lastName")}
        type="text"
        placeholder=""
        description=""
        disabled={disabled}
      />
      <DateInput
        label={`${t.beneficiarySection.birthdate} *`}
        name={getConventionFieldName("signatories.beneficiary.birthdate")}
        disabled={disabled}
        onDateChange={(date) => {
          setFieldValue(
            "signatories.beneficiary.birthdate",
            new Date(date).toISOString(),
          );
        }}
      />
      <TextInput
        label={`${t.beneficiarySection.email.label} *`}
        name={getConventionFieldName("signatories.beneficiary.email")}
        type="email"
        placeholder={t.beneficiarySection.email.placeholder}
        description={t.beneficiarySection.email.description}
        disabled={disabled}
      />
      {values.signatories.beneficiary.email && <ConventionEmailWarning />}
      <TextInput
        label={`${t.beneficiarySection.phone.label} *`}
        name={getConventionFieldName("signatories.beneficiary.phone")}
        type="tel"
        placeholder={t.beneficiarySection.phone.placeholder}
        description={t.beneficiarySection.phone.description}
        disabled={disabled}
      />
      <RadioGroup
        id="is-minor"
        disabled={disabled}
        currentValue={isMinor}
        setCurrentValue={(value) =>
          dispatch(conventionSlice.actions.isMinorChanged(value))
        }
        groupLabel={`${t.beneficiarySection.isMinorLabel} *`}
        options={[
          { label: t.yes, value: true },
          { label: t.no, value: false },
        ]}
      />

      {isMinor ? (
        <BeneficiaryRepresentativeFields disabled={disabled} />
      ) : (
        <>
          <TextInput
            label={t.beneficiarySection.emergencyContact.nameLabel}
            name={getConventionFieldName(
              "signatories.beneficiary.emergencyContact",
            )}
            type="text"
            placeholder=""
            description=""
            disabled={disabled}
          />
          <TextInput
            label={t.beneficiarySection.emergencyContact.phone.label}
            name={getConventionFieldName(
              "signatories.beneficiary.emergencyContactPhone",
            )}
            type="tel"
            placeholder={
              t.beneficiarySection.emergencyContact.phone.placeholder
            }
            description=""
            disabled={disabled}
          />
        </>
      )}

      <RadioGroup
        id="is-current-employer"
        disabled={disabled}
        currentValue={hasCurrentEmployer}
        setCurrentValue={(value) =>
          dispatch(conventionSlice.actions.isCurrentEmployerChanged(value))
        }
        groupLabel={`${t.beneficiarySection.beneficiaryCurrentEmployer.hasCurrentEmployerLabel} *`}
        options={[
          { label: t.yes, value: true },
          { label: t.no, value: false },
        ]}
      />

      {hasCurrentEmployer && (
        <BeneficiaryCurrentEmployerFields disabled={disabled} />
      )}
    </>
  );
};
