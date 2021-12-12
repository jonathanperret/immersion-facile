import { FakeLaBonneBoiteAPI } from "../../../adapters/secondary/immersionOffer/FakeLaBonneBoiteAPI";
import { FakeLaPlateformeDeLInclusionAPI } from "../../../adapters/secondary/immersionOffer/FakeLaPlateformeDeLInclusionAPI";
import { InMemoryEstablishmentRepository } from "../../../adapters/secondary/immersionOffer/InMemoryEstabishmentRepository";
import { InMemorySearchRepository } from "../../../adapters/secondary/immersionOffer/InMemorySearchRepository";
import {
  InMemorySirenGateway,
  TEST_ESTABLISHMENT1_SIRET,
  TEST_ESTABLISHMENT2_SIRET,
} from "../../../adapters/secondary/InMemorySirenGateway";
import { UpdateEstablishmentsAndImmersionOffersFromLastSearchesV2 } from "../../../domain/immersionOffer/useCases/UpdateEstablishmentsAndImmersionOffersFromLastSearchesV2";
import { fakeGetPosition } from "../../../_testBuilders/FakeHttpCalls";
import { EstablishmentFromLaBonneBoiteBuilder } from "../../../_testBuilders/LaBonneBoiteResponseBuilder";
import { LaPlateFormeDeLInclusionPosteBuilder } from "../../../_testBuilders/LaPlateFormeDeLInclusionPosteBuilder";
import { LaPlateformeDeLInclusionResultBuilder } from "../../../_testBuilders/PlateformInclusionResponseBuilder";

const inMemorySirenGateway = new InMemorySirenGateway();

describe("UpdateEstablishmentsAndImmersionOffersFromLastSearchesV2", () => {
  let updateEstablishmentsAndImmersionOffersFromLastSearches: UpdateEstablishmentsAndImmersionOffersFromLastSearchesV2;
  let establishmentRepo: InMemoryEstablishmentRepository;
  let searchRepo: InMemorySearchRepository;
  let laBonneBoiteAPI: FakeLaBonneBoiteAPI;
  let laPlateformeDeLInclusionAPI: FakeLaPlateformeDeLInclusionAPI;

  beforeEach(() => {
    establishmentRepo = new InMemoryEstablishmentRepository();
    searchRepo = new InMemorySearchRepository();
    laBonneBoiteAPI = new FakeLaBonneBoiteAPI();
    laPlateformeDeLInclusionAPI = new FakeLaPlateformeDeLInclusionAPI();

    updateEstablishmentsAndImmersionOffersFromLastSearches =
      new UpdateEstablishmentsAndImmersionOffersFromLastSearchesV2(
        laBonneBoiteAPI,
        laPlateformeDeLInclusionAPI,
        fakeGetPosition,
        inMemorySirenGateway,
        establishmentRepo,
        searchRepo,
      );
  });
  describe("There isn't any new search to process", () => {
    it("shouldn't do anything", async () => {
      searchRepo.searches = [];
      await updateEstablishmentsAndImmersionOffersFromLastSearches.execute();
    });
  });
  describe("There are some unprocessed searches (with rome and location) and establishment repo is empty", () => {
    // Question : what about Naf Division and Siret ?
    beforeEach(() => {
      searchRepo.searches = [
        {
          madeAt: new Date(2020),
          processed: false,
          searchParams: {
            rome: "A1203",
            distance_km: 10.0,
            lat: 10.0,
            lon: 20.0,
          },
        },
      ];
    });
    it("should insert the estabishment from 'La Bonne Boite' with related offers and mark  the searches as processed ", async () => {
      // Prepare
      laBonneBoiteAPI.setNextResults([
        new EstablishmentFromLaBonneBoiteBuilder()
          .withSiret(TEST_ESTABLISHMENT1_SIRET)
          .build(),
        new EstablishmentFromLaBonneBoiteBuilder()
          .withSiret(TEST_ESTABLISHMENT2_SIRET)
          .build(),
      ]);
      // Execute
      await updateEstablishmentsAndImmersionOffersFromLastSearches.execute();
      // Assert
      expect(establishmentRepo.establishments).toHaveLength(2);
      // TODO : eventually check that inserted establishment have correct fields
      expect(searchRepo.searches.map((search) => search.processed)).toEqual([
        true,
      ]);
    });
    it("should insert the estabishment from 'Plateforme de l'Inclusion' with related offers", async () => {
      // Prepare
      laPlateformeDeLInclusionAPI.setNextResults([
        new LaPlateformeDeLInclusionResultBuilder()
          .withSiret(TEST_ESTABLISHMENT1_SIRET)
          .withPostes([
            new LaPlateFormeDeLInclusionPosteBuilder().build(),
            new LaPlateFormeDeLInclusionPosteBuilder().build(),
          ])
          .build(),
        new LaPlateformeDeLInclusionResultBuilder()
          .withSiret(TEST_ESTABLISHMENT2_SIRET)
          .build(),
      ]);
      // Execute
      await updateEstablishmentsAndImmersionOffersFromLastSearches.execute();
      // Assert
      expect(establishmentRepo.establishments).toHaveLength(2);
      // TODO : eventually check that inserted establishment have correct fields
      expect(searchRepo.searches.map((search) => search.processed)).toEqual([
        true,
      ]);
    });
  });
  describe("There are some unprocessed searches leading to establishment already present in estbalishment repo", () => {
    it("should not overwrite the establishment with dataSource=form", () => {
      return;
    });
    it("should update the offers and eventually other informations from establishment with dataSource!=form", () => {
      return;
    });
  });
});
