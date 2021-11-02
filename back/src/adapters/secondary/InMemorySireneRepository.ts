import {
  SireneRepository,
  SiretResponse,
} from "../../domain/sirene/ports/SireneRepository";
import { Establishment } from "../../../../front/src/core-logic/ports/EstablishmentInfoFromSiretApi";
import { SiretDto } from "../../shared/siret";

export const TEST_ESTABLISHMENT1: Establishment = {
  siret: "12345678901234",
  siren: "123456789",
  nic: "01234",
  etablissementSiege: false,
  uniteLegale: {
    denominationUniteLegale: "MA P'TITE BOITE",
    activitePrincipaleUniteLegale: "71.12B",
    nomenclatureActivitePrincipaleUniteLegale: "Ref2",
    trancheEffectifsUniteLegale: "01",
  },
  adresseEtablissement: {
    numeroVoieEtablissement: "20",
    typeVoieEtablissement: "AVENUE",
    libelleVoieEtablissement: "DE SEGUR",
    codePostalEtablissement: "75007",
    libelleCommuneEtablissement: "PARIS 7",
  },
};

export class InMemorySireneRepository implements SireneRepository {
  private readonly _repo = {
    [TEST_ESTABLISHMENT1.siret]: TEST_ESTABLISHMENT1,
  };

  public constructor() {}

  public async get(siret: SiretDto): Promise<SiretResponse | undefined> {
    const establishment = this._repo[siret];
    if (!establishment) return undefined;
    return {
      etablissements: [establishment],
    };
  }

  // Visible for testing
  public add(establishment: Establishment) {
    this._repo[establishment.siret] = establishment;
  }
}
