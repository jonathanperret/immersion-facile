import { SearchImmersionResultDto } from "../../../shared/SearchImmersionDto";
import { EstablishmentAggregate } from "../entities/EstablishmentAggregate";
import { EstablishmentEntity } from "../entities/EstablishmentEntity";
import {
  ImmersionOfferEntity,
  ImmersionEstablishmentContact,
} from "../entities/ImmersionOfferEntity";

export type SearchParams = {
  rome: string;
  distance_km: number;
  lat: number;
  lon: number;
  nafDivision?: string; // @jerome: Why nafDivision here ?
  siret?: string; // @jerome: Why siret here ?
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

  getImmersionFromUuid(
    uuid: string,
    withContactDetails?: boolean,
  ): Promise<SearchImmersionResultDto | undefined>;
  getFromSearch: (
    searchParams: SearchParams,
    withContactDetails?: boolean,
  ) => Promise<SearchImmersionResultDto[]>;
}

export interface EstablishmentRepository {
  addEstablishment: (establishment: EstablishmentAggregate) => Promise<void>;
  // insertSearch: (searchParams: SearchParams) => Promise<void>;
  // insertImmersions: (immersions: ImmersionOfferEntity[]) => Promise<void>;
  // insertEstablishments: (
  //   establishments: EstablishmentEntity[],
  // ) => Promise<void>;
  // markPendingResearchesAsProcessedAndRetrieveThem(): Promise<SearchParams[]>;

  // getImmersionFromUuid(
  //   uuid: string,
  //   withContactDetails?: boolean,
  // ): Promise<SearchImmersionResultDto | undefined>;
  // getFromSearch: (
  //   searchParams: SearchParams,
  //   withContactDetails?: boolean,
  // ) => Promise<SearchImmersionResultDto[]>;
}

export type Search = {
  searchParams: SearchParams;
  processed: boolean;
  madeAt: Date;
};
export interface SearchRepository {
  // TODO : search should probably have an idea (or it could be the date of the search)
  getUnprocessedSearches(): Promise<Search[]>;
  setSearchProcessed(madeAt: Date, processed: boolean): Promise<void>;
}
