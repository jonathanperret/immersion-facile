import { InMemoryImmersionOfferRepository } from "../../../adapters/secondary/immersionOffer/InMemoryImmersonOfferRepository";
import { SearchImmersion } from "../../../domain/immersionOffer/useCases/SearchImmersion";
import { SearchImmersionResultDto } from "../../../shared/SearchImmersionDto";
import { EstablishmentEntityBuilder } from "./../../../_testBuilders/EstablishmentEntityBuilder";
import { ImmersionOfferEntityBuilder } from "./../../../_testBuilders/ImmersionOfferEntityBuilder";

describe("SearchImmersion", () => {
  test("Search immersion, give contact details only if authenticated", async () => {
    const immersionOfferRepository = new InMemoryImmersionOfferRepository();
    const searchImmersion = new SearchImmersion(immersionOfferRepository);

    const siret = "12354678901234";
    const immersionOffer = new ImmersionOfferEntityBuilder()
      .withRome("M1607")
      .withPosition({ lat: 43.8666, lon: 8.3333 })
      .withEstablishment(
        new EstablishmentEntityBuilder()
          .withSiret(siret)
          .withRomes([])
          .withNaf("8539A")
          .withContact({
            id: "37dd0b5e-3270-11ec-8d3d-0242ac130003",
            lastName: "Dupont",
            firstName: "Pierre",
            email: "test@email.fr",
            role: "Directeur",
            siretEstablishment: siret,
            phone: "0640295453",
          })
          .build(),
      )
      .build();

    await immersionOfferRepository.insertImmersions([immersionOffer]);

    const unauthenticatedResponse = await searchImmersion.execute({
      rome: "M1607",
      nafDivision: "85",
      distance_km: 30,
      location: {
        lat: 49.119146,
        lon: 6.17602,
      },
    });

    const expectedResponse: SearchImmersionResultDto[] = [
      {
        id: "13df03a5-a2a5-430a-b558-ed3e2f03512d",
        rome: "M1607",
        naf: "8539A",
        siret,
        name: "Company inside repository",
        voluntaryToImmersion: false,
        location: { lat: 43.8666, lon: 8.3333 },
        address: "30 avenue des champs Elysées, 75017 Paris",
        contactId: "37dd0b5e-3270-11ec-8d3d-0242ac130003",
        contactMode: "EMAIL",
        distance_m: 752564,
        city: "xxxx",
        nafLabel: "xxxx",
        romeLabel: "xxxx",
        contactDetails: undefined,
      },
    ];
    expect(unauthenticatedResponse).toEqual(expectedResponse);

    const searches = immersionOfferRepository.searches;
    expect(searches).toEqual([
      {
        rome: "M1607",
        nafDivision: "85",
        lat: 49.119146,
        lon: 6.17602,
        distance_km: 30,
      },
    ]);

    const authenticatedResponse = await searchImmersion.execute(
      {
        rome: "M1607",
        nafDivision: "85",
        distance_km: 30,
        location: {
          lat: 49.119146,
          lon: 6.17602,
        },
      },
      {
        name: "passeEmploi",
        id: "my-valid-apikey-id",
        exp: new Date("2022-01-01").getTime(),
        iat: new Date("2021-12-20").getTime(),
      },
    );
    const expectedAuthResponse: SearchImmersionResultDto = {
      ...expectedResponse[0],
      contactDetails: {
        id: "37dd0b5e-3270-11ec-8d3d-0242ac130003",
        firstName: "Pierre",
        lastName: "Dupont",
        email: "test@email.fr",
        role: "Directeur",
        phone: "0640295453",
      },
    };
    expect(authenticatedResponse).toEqual([expectedAuthResponse]);
  });
});
