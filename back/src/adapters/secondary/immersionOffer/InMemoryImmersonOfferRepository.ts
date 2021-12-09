import {
  EstablishmentEntity,
  ImmersionEstablishmentContact,
} from "../../../domain/immersionOffer/entities/EstablishmentEntity";
import { ImmersionOfferEntity } from "../../../domain/immersionOffer/entities/ImmersionOfferEntity";
import {
  ImmersionOfferRepository,
  SearchParams,
} from "../../../domain/immersionOffer/ports/ImmersionOfferRepository";
import { ImmersionOfferId } from "../../../shared/SearchImmersionDto";
import { createLogger } from "../../../utils/logger";

const logger = createLogger(__filename);

export const validImmersionOfferId = "13df03a5-a2a5-430a-b558-ed3e2f03512d";
export class InMemoryImmersionOfferRepository
  implements ImmersionOfferRepository
{
  public constructor(
    private _searches: SearchParams[] = [],
    private _immersionOffers: {
      [id: string]: ImmersionOfferEntity;
    } = {},
    private _establishments: { [siret: string]: EstablishmentEntity } = {},
    private _establishmentContacts: {
      [siret: string]: ImmersionEstablishmentContact;
    } = {},
  ) {}

  empty() {
    this._searches = [];
    this._immersionOffers = {};
    this._establishments = {};
    this._establishmentContacts = {};
    return this;
  }

  public async insertSearch(searchParams: SearchParams) {
    logger.info(searchParams, "insertSearch");
    this._searches.push(searchParams);
    return;
  }

  async insertEstablishmentContact(
    immersionEstablishmentContact: ImmersionEstablishmentContact,
  ) {
    logger.info(
      { immersionEstablishmentContact },
      "insertEstablishmentContact",
    );
    this._establishmentContacts[
      immersionEstablishmentContact.siretEstablishment
    ] = immersionEstablishmentContact;
  }

  public async insertImmersions(immersions: ImmersionOfferEntity[]) {
    logger.info({ immersions }, "insertImmersions");
    await Promise.all(
      immersions.map((immersion) => {
        this._immersionOffers[immersion.getId()] = immersion;

        const establishment = immersion.getProps().establishment;
        return this.insertEstablishments([establishment]);
      }),
    );
  }

  public async insertEstablishments(establishments: EstablishmentEntity[]) {
    logger.info({ establishments }, "insertEstablishments");
    await Promise.all(
      establishments.map((establishment) => {
        this._establishments[establishment.getSiret()] = establishment;

        const establishmentContact =
          establishment.getProps().contactInEstablishment;
        if (establishmentContact) {
          return this.insertEstablishmentContact(establishmentContact);
        }
      }),
    );
  }

  public async markPendingResearchesAsProcessedAndRetrieveThem(): Promise<
    SearchParams[]
  > {
    logger.info("markPendingResearchesAsProcessedAndRetrieveThem");
    const searchesToReturn = this._searches;
    this._searches = [];
    return searchesToReturn;
  }

  public async getFromSearch(
    searchParams: SearchParams,
  ): Promise<ImmersionOfferEntity[]> {
    let offers = Object.values(this._immersionOffers).filter(
      (immersionOffer) => immersionOffer.getRome() === searchParams.rome,
    );
    if (searchParams.nafDivision) {
      offers = offers.filter(
        (immersionOffer) =>
          immersionOffer
            .getProps()
            .establishment.extractNafDivision()
            .toString() === searchParams.nafDivision,
      );
    }
    if (searchParams.siret) {
      offers = offers.filter(
        (immersionOffer) =>
          immersionOffer.getProps().establishment.getSiret().toString() ===
          searchParams.siret,
      );
    }
    logger.info({ searchParams, response: offers }, "getFromSearch");
    return offers.map((offer) =>
      this.buildUpdatedImmersionOffer(offer, searchParams),
    );
  }

  async getImmersionFromUuid(uuid: ImmersionOfferId) {
    const immersionOffer = this._immersionOffers[uuid];
    if (!immersionOffer) return;
    return this.buildUpdatedImmersionOffer(immersionOffer);
  }

  private buildUpdatedImmersionOffer(
    immersionOffer: ImmersionOfferEntity,
    searchParams?: SearchParams,
  ) {
    const siret = immersionOffer.getProps().establishment.getSiret();
    const establishment = this._establishments[siret];
    const contactInEstablishment = this._establishmentContacts[siret];

    return new ImmersionOfferEntity({
      ...immersionOffer.getProps(),
      establishment: new EstablishmentEntity({
        ...establishment.getProps(),
        contactInEstablishment,
      }),
      distance_m:
        searchParams &&
        distanceBetweenCoordinates(
          establishment.getPosition().lat,
          establishment.getPosition().lon,
          searchParams.lat,
          searchParams.lon,
        ),
    });
  }

  // for test purposes only :
  async getEstablishmentFromSiret(siret: string) {
    return this._establishments[siret];
  }

  setSearches(searches: SearchParams[]) {
    this._searches = searches;
  }
  get searches() {
    return this._searches;
  }
  get immersionOffers() {
    return Object.values(this._immersionOffers);
  }
  get establishments() {
    return Object.values(this._establishments);
  }
  get establishmentContacts() {
    return Object.values(this._establishmentContacts);
  }
}

// Takes two coordinates (in degrees) and returns distance in meters.
// Taken from https://www.movable-type.co.uk/scripts/latlong.html (MIT license)
const distanceBetweenCoordinates = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // in metres
};
