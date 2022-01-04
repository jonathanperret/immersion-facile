import {
  SearchImmersionRequestDto,
  searchImmersionRequestSchema,
  SearchImmersionResultDto,
} from "../../../shared/SearchImmersionDto";
import { ApiConsumer } from "../../../shared/tokens/ApiConsumer";
import { uniqBy } from "../../../shared/utils";
import { UseCase } from "../../core/UseCase";
import { SearchParams } from "../entities/SearchParams";
import { ImmersionOfferRepository } from "../ports/ImmersionOfferRepository";
import { LaBonneBoiteAPI } from "../ports/LaBonneBoiteAPI";
import { SearchesMadeRepository } from "../ports/SearchesMadeRepository";

export class SearchImmersion extends UseCase<
  SearchImmersionRequestDto,
  SearchImmersionResultDto[],
  ApiConsumer
> {
  constructor(
    private readonly searchesMadeRepository: SearchesMadeRepository,
    private readonly immersionOfferRepository: ImmersionOfferRepository,
    private readonly laBonneBoiteAPI: LaBonneBoiteAPI,
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

    const resultsFromLaBonneBoite = await this.laBonneBoiteAPI.searchCompanies({
      ...params,
      ...params.location,
    });

    // TODO : convert resultsFromLaBonneBoite to SearchImmersion result and add rome to unicity check
    return uniqBy(
      [...resultsFromStorage /* , ...resultsFromLaBonneBoite */],
      (searchResult) => searchResult.siret,
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
