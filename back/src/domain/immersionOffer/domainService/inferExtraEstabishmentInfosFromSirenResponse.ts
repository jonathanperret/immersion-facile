import { SirenResponse } from "../../sirene/ports/SirenGateway";
import { TefenCode } from "../entities/EstablishmentEntity";

export type ExtraEstablishmentInfos = {
  naf?: string;
  numberEmployeesRange: TefenCode;
};

export const inferExtraEstabishmentInfosFromSirenResponse = (
  sirenResponse: SirenResponse,
): ExtraEstablishmentInfos => {
  const naf =
    sirenResponse.etablissements[0].uniteLegale.activitePrincipaleUniteLegale?.replace(
      ".",
      "",
    );

  const tefenCode =
    sirenResponse.etablissements[0].uniteLegale.trancheEffectifsUniteLegale;

  const numberEmployeesRange: TefenCode =
    !tefenCode || tefenCode == "NN" ? -1 : <TefenCode>+tefenCode;

  return {
    naf,
    numberEmployeesRange,
  };
};
