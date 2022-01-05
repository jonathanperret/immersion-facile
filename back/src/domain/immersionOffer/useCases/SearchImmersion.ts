import { FeatureFlags } from "../../../shared/featureFlags";
import {
  SearchImmersionRequestDto,
  searchImmersionRequestSchema,
  SearchImmersionResultDto,
} from "../../../shared/SearchImmersionDto";
import { ApiConsumer } from "../../../shared/tokens/ApiConsumer";
import { UuidGenerator } from "../../core/ports/UuidGenerator";
import { UseCase } from "../../core/UseCase";
import { SearchParams } from "../entities/SearchParams";
import { ImmersionOfferRepository } from "../ports/ImmersionOfferRepository";
import { LaBonneBoiteAPI } from "../ports/LaBonneBoiteAPI";
import { SearchesMadeRepository } from "../ports/SearchesMadeRepository";

const THRESHOLD_TO_FETCH_LBB = 15;

export class SearchImmersion extends UseCase<
  SearchImmersionRequestDto,
  SearchImmersionResultDto[],
  ApiConsumer
> {
  constructor(
    private readonly searchesMadeRepository: SearchesMadeRepository,
    private readonly immersionOfferRepository: ImmersionOfferRepository,
    private readonly laBonneBoiteAPI: LaBonneBoiteAPI,
    private readonly uuidGenerator: UuidGenerator,
    private readonly featureFlags: FeatureFlags,
  ) {
    super();
  }

  inputSchema = searchImmersionRequestSchema;

  public async _execute(
    params: SearchImmersionRequestDto,
    apiConsumer: ApiConsumer,
  ): Promise<SearchImmersionResultDto[]> {
    const searchParams = convertRequestDtoToSearchParams(params);
    await this.searchesMadeRepository.insertSearchMade(searchParams);
    const apiConsumerName = apiConsumer?.consumer;

    const resultsFromStorage =
      await this.immersionOfferRepository.getFromSearch(
        searchParams,
        /* withContactDetails= */ apiConsumerName !== undefined,
      );

    if (!this.featureFlags.enableLBBFetchOnSearch) return resultsFromStorage;

    if (resultsFromStorage.length >= THRESHOLD_TO_FETCH_LBB)
      return resultsFromStorage;

    await this.updateStorageByCallingLaBonneBoite(params);

    return this.immersionOfferRepository.getFromSearch(
      searchParams,
      /* withContactDetails= */ apiConsumerName !== undefined,
    );
  }

  private async updateStorageByCallingLaBonneBoite(
    params: SearchImmersionRequestDto,
  ) {
    const resultsFromLaBonneBoite = await this.laBonneBoiteAPI.searchCompanies({
      ...params,
      ...params.location,
    });

    const llbResultsConvertedToEstablishmentAggregates =
      resultsFromLaBonneBoite.map((lbbCompanyVO) =>
        lbbCompanyVO.toEstablishmentAggregate(this.uuidGenerator),
      );

    await this.immersionOfferRepository.insertEstablishmentAggregates(
      llbResultsConvertedToEstablishmentAggregates,
    );
  }
}

const convertRequestDtoToSearchParams = ({
  rome,
  nafDivision,
  siret,
  location,
  distance_km,
}: SearchImmersionRequestDto): SearchParams => ({
  rome: rome,
  nafDivision,
  siret,
  lat: location.lat,
  lon: location.lon,
  distance_km,
});
