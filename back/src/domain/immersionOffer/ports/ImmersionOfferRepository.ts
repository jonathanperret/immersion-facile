import {
  EstablishmentEntity,
  ImmersionEstablishmentContact,
} from "../entities/EstablishmentEntity";
import { ImmersionOfferEntity } from "../entities/ImmersionOfferEntity";

export type SearchParams = {
  rome: string;
  distance_km: number;
  lat: number;
  lon: number;
  nafDivision?: string;
  siret?: string;
};

export interface ImmersionOfferRepository {
  insertEstablishmentContact: (
    establishmentContact: ImmersionEstablishmentContact,
  ) => Promise<void>;
  insertSearch: (searchParams: SearchParams) => Promise<void>;
  insertImmersions: (immersions: ImmersionOfferEntity[]) => Promise<void>;
  insertEstablishments: (
    establishments: EstablishmentEntity[],
  ) => Promise<void>;
  markPendingResearchesAsProcessedAndRetrieveThem(): Promise<SearchParams[]>;

  getImmersionFromUuid(uuid: string): Promise<ImmersionOfferEntity | undefined>;
  getFromSearch: (
    searchParams: SearchParams,
  ) => Promise<ImmersionOfferEntity[]>;
}
