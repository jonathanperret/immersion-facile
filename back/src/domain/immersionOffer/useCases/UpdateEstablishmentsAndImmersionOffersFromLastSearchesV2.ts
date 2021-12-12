import { v4 as uuidV4 } from "uuid";
import { createLogger } from "../../../utils/logger";
// import { PipelineStats } from "../../../utils/pipelineStats";
import { SirenGateway } from "../../sirene/ports/SirenGateway";
import { inferExtraEstabishmentInfosFromSirenResponse } from "../domainService/inferExtraEstabishmentInfosFromSirenResponse";
import type { EstablishmentAggregate } from "../entities/EstablishmentAggregate";
import { GetPosition } from "../ports/GetPosition";
import {
  EstablishmentRepository,
  SearchParams,
  SearchRepository,
} from "../ports/ImmersionOfferRepository";
import { LaBonneBoiteAPI, LaBonneBoiteCompany } from "../ports/LaBonneBoiteAPI";
import {
  LaPlateformeDeLInclusionAPI,
  LaPlateformeDeLInclusionResult,
} from "../ports/LaPlateformeDeLInclusionAPI";

const logger = createLogger(__filename);

export class UpdateEstablishmentsAndImmersionOffersFromLastSearchesV2 {
  // public readonly stats = new PipelineStats(this.constructor.name);

  constructor(
    private readonly laBonneBoiteAPI: LaBonneBoiteAPI,
    private readonly laPlateFormeDeLInclusionAPI: LaPlateformeDeLInclusionAPI,
    private readonly getPosition: GetPosition,
    private readonly sirenGateway: SirenGateway,
    private readonly establishmentRepository: EstablishmentRepository,
    private readonly searchRepository: SearchRepository,
  ) {}

  public async execute() {
    // Take all searches made in the past.
    const searchesMade = await this.searchRepository.getUnprocessedSearches();

    logger.info(
      `Found ${searchesMade.length} unprocessed rows in the searches_made table.`,
    );

    for (const search of searchesMade) {
      await this.processSearchMade(search.searchParams);
      this.searchRepository.setSearchProcessed(search.madeAt, true);
    }
  }

  private async processSearchMade(searchParams: SearchParams) {
    logger.debug({ searchParams }, "processSearchMade");

    // Aggregate La Bonne Boite establishemnts
    const laBonneBoiteCompanies = await this.laBonneBoiteAPI.searchCompanies(
      searchParams,
    );
    const establishmentsFromLaBonneBoite: EstablishmentAggregate[] =
      await Promise.all(
        laBonneBoiteCompanies.map((company) =>
          this.convertLaBonneBoiteCompanyToEstablishment(company),
        ),
      );

    // Aggregate La Plateforme de l'Inclusion establishemnts
    const laPlateFormeDeLInclusionResults =
      await this.laPlateFormeDeLInclusionAPI.getResults(searchParams);

    const establishmentsFromLaPlateFormeDeLInclusion: EstablishmentAggregate[] =
      await Promise.all(
        laPlateFormeDeLInclusionResults.map((result) =>
          this.convertLaPlateformeDeLInclusionResultToEstablishment(result),
        ),
      );

    const allEstablishments = [
      ...establishmentsFromLaBonneBoite,
      ...establishmentsFromLaPlateFormeDeLInclusion,
    ]; // TODO : here, special processing (eg. append the offers, compare the informations, ... what about dataSource ?) for establishment present in both arrays

    await Promise.all(
      allEstablishments.map((establishment) =>
        this.establishmentRepository.addEstablishment(establishment),
      ),
    );
  }

  // This code comes from old LaBonneBoiteGateway
  private async convertLaBonneBoiteCompanyToEstablishment(
    laBonneBoiteCompany: LaBonneBoiteCompany,
  ): Promise<EstablishmentAggregate> {
    const sirenResponse = await this.sirenGateway.get(
      laBonneBoiteCompany.siret,
    );
    if (!sirenResponse)
      throw `Could not find LaBonneBoite company with siret ${laBonneBoiteCompany.siret} in Siren Gateway`;

    const { naf, numberEmployeesRange } =
      inferExtraEstabishmentInfosFromSirenResponse(sirenResponse);
    return {
      address: laBonneBoiteCompany.address,
      position: { lat: laBonneBoiteCompany.lat, lon: laBonneBoiteCompany.lon },
      naf: laBonneBoiteCompany.naf ?? naf,
      name: laBonneBoiteCompany.name,
      siret: laBonneBoiteCompany.siret,
      score: laBonneBoiteCompany.stars,
      voluntaryToImmersion: false,
      immersionOffers: [
        {
          id: uuidV4(), // TODO : this should be injected (for test purposes)
          rome: laBonneBoiteCompany.matched_rome_code,
        },
      ],
      contacts: [], // ?
      dataSource: "api_labonneboite",
      numberEmployeesRange,
    };
  }

  // This code comes from old LaPlateformeDeLInclusionGateway
  private async convertLaPlateformeDeLInclusionResultToEstablishment(
    laPlateFormeDeLInclusionResult: LaPlateformeDeLInclusionResult,
  ): Promise<EstablishmentAggregate> {
    const siret = laPlateFormeDeLInclusionResult.siret;

    const { addresse_ligne_1, addresse_ligne_2, code_postal, ville } =
      laPlateFormeDeLInclusionResult;

    const sirenResponse = await this.sirenGateway.get(siret);

    if (!sirenResponse)
      throw `Could not find LaBonneBoite company with siret ${siret} in Siren Gateway`;

    const { naf, numberEmployeesRange } =
      inferExtraEstabishmentInfosFromSirenResponse(sirenResponse);

    if (!naf) throw `Could not retrieve naf from siret ${siret}. `;

    const address = `${addresse_ligne_1} ${addresse_ligne_2} ${code_postal} ${ville}`;
    const position = await this.getPosition(address);
    if (!position)
      throw `Could not retrieve position from address ${address}. Hence, cannot add establishment with siret ${siret}`;

    return {
      address,
      score: 6, // This is arbitraty /!\
      voluntaryToImmersion: false,
      siret,
      dataSource: "api_laplateformedelinclusion",
      name: laPlateFormeDeLInclusionResult.enseigne,
      immersionOffers: laPlateFormeDeLInclusionResult.postes.map((poste) => ({
        id: uuidV4(), // TODO : this should be injected (for test purposes)
        rome: poste.rome,
      })),
      contacts: [],
      position,
      naf,
      numberEmployeesRange,
    };
  }
}
