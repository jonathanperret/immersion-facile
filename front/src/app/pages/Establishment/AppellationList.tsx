import { useField } from "formik";
import React from "react";
import { FormEstablishmentAppellation } from "./FormEstablishmentAppellation";
import { ButtonAdd } from "src/uiComponents/ButtonAdd";
import { AppellationDto } from "shared/src/romeAndAppellationDtos/romeAndAppellation.dto";
import { removeAtIndex } from "shared/src/utils";

type AppellationListProps = {
  name: string;
  title?: string;
};

export const AppellationList = ({ name, title }: AppellationListProps) => {
  const [field, { touched, error }, { setValue }] = useField<AppellationDto[]>({
    name,
  });

  const professions = field.value;
  const onDelete = (index: number) => {
    setValue(removeAtIndex(professions, index));
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div className="w-full">
        {title && <h5 className="text-lg font-semibold mt-6">{title}</h5>}
        {professions.map(({ appellationLabel }, index) => (
          <FormEstablishmentAppellation
            name={`${name}[${index}]`}
            label={appellationLabel}
            onDelete={() => onDelete(index)}
            key={index}
          />
        ))}
      </div>
      <ButtonAdd
        onClick={() =>
          setValue([
            ...field.value,
            {
              romeCode: "",
              appellationCode: "",
              romeLabel: "",
              appellationLabel: "",
            },
          ])
        }
      >
        Ajouter un métier
      </ButtonAdd>

      {touched && error && (
        <div id={name + "-error-description"} className="fr-error-text">
          {typeof error === "string" ? error : "Indiquez au moins 1 métier."}
        </div>
      )}
    </div>
  );
};
