import { SiretDto } from "../../../shared/siret";
import { Establishment } from "../../../../../front/src/core-logic/ports/EstablishmentInfoFromSiretApi";

export type SiretResponse = {
  etablissements: Establishment[];
};

export interface SireneRepository {
  get: (siret: SiretDto) => Promise<SiretResponse | undefined>;
}
