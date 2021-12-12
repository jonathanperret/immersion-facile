import { EstablishmentFromLaBonneBoite } from "../adapters/secondary/immersionOffer/LaBonneBoiteGateway";
import { Builder } from "./Builder";

const validEstablishmentFromLaBonneBoite: EstablishmentFromLaBonneBoite = {
  address:
    "Service des ressources humaines,  IMPASSE FENDERIE, 57290 SEREMANGE-ERZANGE",
  city: "SEREMANGE-ERZANGE",
  lat: 49.3225,
  lon: 6.08067,
  matched_rome_code: "M1607",
  naf: "8810C",
  name: "BLANCHISSERIE LA FENSCH",
  siret: "77561959600155",
  stars: 4.5,
};

export class EstablishmentFromLaBonneBoiteBuilder
  implements Builder<EstablishmentFromLaBonneBoite>
{
  public constructor(
    private entity: EstablishmentFromLaBonneBoite = validEstablishmentFromLaBonneBoite,
  ) {}

  public withSiret(siret: string): EstablishmentFromLaBonneBoiteBuilder {
    return new EstablishmentFromLaBonneBoiteBuilder({
      ...this.entity,
      siret,
    });
  }

  public withNaf(naf: string): EstablishmentFromLaBonneBoiteBuilder {
    return new EstablishmentFromLaBonneBoiteBuilder({
      ...this.entity,
      naf,
    });
  }
  public build() {
    return this.entity;
  }
}
