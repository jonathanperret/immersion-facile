import {
  EstablishmentFromLaBonneBoite,
  HttpCallsToLaBonneBoite,
} from "../adapters/secondary/immersionOffer/LaBonneBoiteGateway";
import {
  EstablishmentFromLaPlateFormeDeLInclusion,
  HttpCallsToLaPlateFormeDeLInclusion,
} from "../adapters/secondary/immersionOffer/LaPlateFormeDeLInclusionGateway";
import {
  AccessTokenGateway,
  GetAccessTokenResponse,
} from "../domain/core/ports/AccessTokenGateway";
import { GetPosition } from "../domain/immersionOffer/entities/UncompleteEstablishmentEntity";
import { Position } from "../domain/immersionOffer/ports/GetPosition";
import { SearchParams } from "../domain/immersionOffer/ports/ImmersionOfferRepository";
import { GetEstablishmentsResponse } from "./../adapters/secondary/immersionOffer/LaPlateFormeDeLInclusionGateway";

export const fakeAccessTokenGateway: AccessTokenGateway = {
  getAccessToken: async (scope: string) => {
    const response: GetAccessTokenResponse = {
      access_token: "",
      expires_in: -1,
    };
    return response;
  },
};

export const fakeGetPosition: GetPosition = async (address: string) => {
  const returnedPosition: Position = { lat: 49.119146, lon: 6.17602 };
  return returnedPosition;
};

export const makeFakeHttpCallToLaPlateFormeDeLInclusion = (
  results: EstablishmentFromLaPlateFormeDeLInclusion[],
) => {
  const fakeHttpCallToLaPlateFormeDeLInclusion: HttpCallsToLaPlateFormeDeLInclusion =
    {
      getEstablishments: async (
        _searchParams: SearchParams,
      ): Promise<GetEstablishmentsResponse> => ({
        results,
      }),
      getNextEstablishments: async (
        _url: string,
      ): Promise<GetEstablishmentsResponse> => ({ results: [] }),
    };
  return fakeHttpCallToLaPlateFormeDeLInclusion;
};
