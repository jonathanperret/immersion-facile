import type { SearchParams } from "../../../domain/immersionOffer/ports/ImmersionOfferRepository";
import {
  LaBonneBoiteCompany,
  LaBonneBoiteAPI,
} from "../../../domain/immersionOffer/ports/LaBonneBoiteAPI";
import { createAxiosInstance } from "../../../utils/axiosUtils";
import { createLogger } from "../../../utils/logger";

const logger = createLogger(__filename);

export class HttpLaBonneBoiteAPI implements LaBonneBoiteAPI {
  constructor(private _accessToken: string) {}

  public async searchCompanies(
    searchParams: SearchParams,
  ): Promise<LaBonneBoiteCompany[]> {
    const response = await createAxiosInstance(logger).get(
      "https://api.emploi-store.fr/partenaire/labonneboite/v1/company/",
      {
        headers: {
          Authorization: "Bearer " + this._accessToken,
        },
        params: {
          distance: searchParams.distance_km,
          longitude: searchParams.lon,
          latitude: searchParams.lat,
          rome_codes: searchParams.rome,
        },
      },
    );
    return response.data.companies || [];
  }
}
