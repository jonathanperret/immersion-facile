import type { AxiosError } from "axios";
import { useField } from "formik";
import { useEffect, useState } from "react";
import { immersionApplicationGateway } from "src/app/dependencies";
import { GetSiretResponseDto, SiretDto } from "src/shared/siret";
import { siretSchema } from "./../../shared/siret";

export const useSiretRelatedField = <K extends keyof GetSiretResponseDto>(
  fieldFromInfo: K,
  establishmentInfos: GetSiretResponseDto | undefined,
  fieldToUpdate?: string,
) => {
  const [_, { touched }, { setValue }] = useField<GetSiretResponseDto[K]>({
    name: fieldToUpdate ?? fieldFromInfo,
  });

  useEffect(() => {
    if (!establishmentInfos) return;
    if (!touched) setValue(establishmentInfos[fieldFromInfo]);
  }, [establishmentInfos]);
};

export const useSiretFetcher = () => {
  const [isFetchingSiret, setIsFetchingSiret] = useState(false);
  const [establishmentInfo, setEstablishmentInfo] = useState<
    GetSiretResponseDto | undefined
  >();

  const [field, _, { setValue, setError }] = useField<string>({
    name: "siret",
  });

  useEffect(() => {
    let validatedSiret: SiretDto;
    try {
      validatedSiret = siretSchema.parse(field.value);
    } catch (e: any) {
      // Not a valid siret, not ready for lookup.
      return;
    }

    setIsFetchingSiret(true);
    immersionApplicationGateway
      .getSiretInfo(validatedSiret)
      .then((response) => {
        setValue(validatedSiret);
        setEstablishmentInfo(response);
      })
      .catch((err: AxiosError) => {
        if (err.isAxiosError && err.code === "404") {
          setError("SIRET inconnu ou inactif");
        } else {
          setError(err.message);
        }
      })
      .finally(() => setIsFetchingSiret(false));
  }, [field.value]);

  return { establishmentInfo, isFetchingSiret };
};
