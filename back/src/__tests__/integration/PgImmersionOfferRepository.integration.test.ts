import { Pool, PoolClient } from "pg";
import { EstablishmentEntityBuilder } from "../../_testBuilders/EstablishmentEntityBuilder";
import { PgImmersionOfferRepository } from "../../adapters/secondary/pg/PgImmersionOfferRepository";
import {
  EstablishmentEntity,
  ImmersionEstablishmentContact,
} from "../../domain/immersionOffer/entities/EstablishmentEntity";
import { ImmersionOfferEntity } from "../../domain/immersionOffer/entities/ImmersionOfferEntity";
import { getTestPgPool } from "../../_testBuilders/getTestPgPool";
import { ImmersionOfferEntityBuilder } from "../../_testBuilders/ImmersionOfferEntityBuilder";
import { ImmersionEstablishmentContactBuilder } from "../../_testBuilders/ImmersionEstablishmentContactBuilder";

// Repo methods :
// --------------
// insertEstablishmentContact  ==> Does this one becomes private ?
// insertSearch
// insertImmersions
// insertEstablishments
// markPendingResearchesAsProcessedAndRetrieveThem => This one is not tested here /!\
// getImmersionFromUuid
// getFromSearch => This one is not tested here /!\

describe("Postgres implementation of ImmersionOfferRepository", () => {
  let pool: Pool;
  let client: PoolClient;
  let pgImmersionOfferRepository: PgImmersionOfferRepository;

  beforeAll(async () => {
    pool = getTestPgPool();
    client = await pool.connect();
  });

  beforeEach(async () => {
    await client.query("TRUNCATE searches_made CASCADE");
    await client.query("TRUNCATE immersion_contacts CASCADE");
    await client.query("TRUNCATE establishments CASCADE");
    await client.query("TRUNCATE immersion_offers CASCADE");
    pgImmersionOfferRepository = new PgImmersionOfferRepository(client);
  });

  afterAll(async () => {
    client.release();
    await pool.end();
  });

  describe("Method insertSearch", () => {
    beforeEach(async () => {
      await pgImmersionOfferRepository.insertSearch({
        rome: "M1607",
        distance_km: 30,
        lat: 49.119146,
        lon: 6.17602,
      });
      await pgImmersionOfferRepository.insertSearch({
        rome: "M1607",
        distance_km: 30,
        lat: 48.119146,
        lon: 6.17602,
      });
      await pgImmersionOfferRepository.insertSearch({
        rome: "M1607",
        distance_km: 30,
        lat: 48.119146,
        lon: 5.17602,
      });
      await pgImmersionOfferRepository.insertSearch({
        rome: "M1607",
        distance_km: 30,
        lat: 48.119146,
        lon: 4.17602,
      });
      await pgImmersionOfferRepository.insertSearch({
        rome: "M1607",
        distance_km: 30,
        lat: 48.129146,
        lon: 4.17602,
      });
      await pgImmersionOfferRepository.insertSearch({
        rome: "M1608",
        distance_km: 30,
        lat: 48.129146,
        lon: 4.17602,
      });
    });
    afterEach(async () => {
      // We empty the searches for the next tests
      await pgImmersionOfferRepository.markPendingResearchesAsProcessedAndRetrieveThem();
    });
    test("Should insert search in database", async () => {
      // TODO : do not use a (private ?) repo method to test that the entity has been saved !
      expect(
        (
          await pgImmersionOfferRepository.getSearchInDatabase({
            rome: "M1607",
            distance_km: 30,
            lat: 49.119146,
            lon: 6.17602,
          })
        )[0].rome,
      ).toBe("M1607");
    });

    test("Should group searches close geographically", async () => {
      // We expect that two of the 6 searches have been grouped by
      expect(
        await pgImmersionOfferRepository.markPendingResearchesAsProcessedAndRetrieveThem(),
      ).toHaveLength(5);

      // We expect then that all searches have been retrieved
      expect(
        await pgImmersionOfferRepository.markPendingResearchesAsProcessedAndRetrieveThem(),
      ).toHaveLength(0);

      // We expect that all searches are not to be searched anymore
      const allSearches = (await pgImmersionOfferRepository.getAllSearches())
        .rows;
      allSearches.map((row) => {
        expect(row.needstobesearched).toBe(false);
      });
    });
  });

  describe("Method getFromSearch", () => {
    const targetRome = "M1907";
    const targetNafDivision = "85";

    const establishment_targetRome_insideCoordinates =
      new EstablishmentEntityBuilder()
        .withRomes([targetRome])
        .withPosition({ lat: 10, lon: 15 })
        .withNaf(targetNafDivision)
        .build();

    const establishment_targetRome_oustideCoordinates =
      new EstablishmentEntityBuilder()
        .withRomes([targetRome])
        .withPosition({ lat: 100, lon: 300 })
        .withNaf(targetNafDivision)
        .build();

    const immersionOffer_match1 = new ImmersionOfferEntityBuilder()
      .withEstablishment(establishment_targetRome_insideCoordinates)
      .withPosition(establishment_targetRome_insideCoordinates.getPosition())
      .withRome(targetRome)
      .build();

    const immersionOffer_match2 = new ImmersionOfferEntityBuilder()
      .withEstablishment(establishment_targetRome_insideCoordinates)
      .withPosition(establishment_targetRome_insideCoordinates.getPosition())
      .withRome(targetRome)
      .build();

    const immersionOffer_noPositionMatch = new ImmersionOfferEntityBuilder()
      .withEstablishment(establishment_targetRome_oustideCoordinates)
      .withPosition(establishment_targetRome_oustideCoordinates.getPosition())
      .withRome(targetRome)
      .build();

    const immersionOffer_noRomeMatch = new ImmersionOfferEntityBuilder()
      .withEstablishment(establishment_targetRome_insideCoordinates)
      .withPosition(establishment_targetRome_insideCoordinates.getPosition())
      .withRome("M1908")
      .build();

    beforeEach(() => {
      pgImmersionOfferRepository.insertEstablishments([
        establishment_targetRome_insideCoordinates,
        establishment_targetRome_oustideCoordinates,
      ]);
      pgImmersionOfferRepository.insertImmersions([
        immersionOffer_match1,
        immersionOffer_match2,
        immersionOffer_noPositionMatch,
        immersionOffer_noRomeMatch,
      ]);
    });
    test("Should return offers within given a perimeter, given a ROME and a nafDivision", async () => {
      const searchResult = await pgImmersionOfferRepository.getFromSearch({
        rome: targetRome,
        distance_km: 30,
        lat: 10.5,
        lon: 16.6,
        nafDivision: "85",
      });
      expect(searchResult).toHaveLength(2);
    });
  });
  test("Insert immersions and retrieves them back", async () => {
    await pgImmersionOfferRepository.insertEstablishments([
      new EstablishmentEntity({
        id: "13df03a5-a2a5-430a-b558-111111111111",
        address: "fake address establishment 1",
        name: "Fake Establishment from la plate forme de l'inclusion",
        voluntaryToImmersion: false,
        score: 5,
        romes: ["M1907"],
        siret: "78000403200029",
        dataSource: "api_laplateformedelinclusion",
        numberEmployeesRange: 1,
        position: { lat: 10, lon: 15 },
        naf: "8539A",
        contactMode: "EMAIL",
      }),
    ]);
    await pgImmersionOfferRepository.insertEstablishments([
      new EstablishmentEntity({
        id: "13df03a5-a2a5-430a-b558-222222222222",
        address: "fake address establishment 2",
        name: "Fake Establishment from la plate forme de l'inclusion",
        voluntaryToImmersion: false,
        score: 5,
        romes: ["M1907"],
        siret: "78000403200040",
        dataSource: "api_laplateformedelinclusion",
        numberEmployeesRange: 1,
        position: { lat: 11, lon: 16 },
        naf: "8539A",
        contactMode: "PHONE",
      }),
    ]);

    const contactInEstablishment: ImmersionEstablishmentContact = {
      id: "93144fe8-56a7-4807-8990-726badc6332b",
      lastName: "Doe",
      firstName: "John",
      email: "joe@mail.com",
      role: "super job",
      siretEstablishment: "78000403200040",
      phone: "0640404040",
    };

    //   await pgImmersionOfferRepository.insertEstablishmentContact(
    //     contactInEstablishment,
    //   );

    //   await pgImmersionOfferRepository.insertImmersions([
    //     new ImmersionOfferEntity({
    //       id: "13df03a5-a2a5-430a-b558-111111111122",
    //       rome: "M1907",
    //       // naf: "8539A",
    //       // siret: "78000403200029",
    //       name: "Company from la bonne boite for search",
    //       voluntaryToImmersion: false,
    //       dataSource: "api_labonneboite",
    //       contactInEstablishment: undefined,
    //       score: 4.5,
    //       position: { lat: 49, lon: 6 },
    //     }),
    //   ]);

    //   await pgImmersionOfferRepository.insertImmersions([
    //     new ImmersionOfferEntity({
    //       id: "13df03a5-a2a5-430a-b558-333333333344",
    //       rome: "M1907",
    //       // naf: "8539A",
    //       // siret: "78000403200040",
    //       name: "Company from api sirene for search",
    //       voluntaryToImmersion: false,
    //       dataSource: "api_sirene",
    //       contactInEstablishment,
    //       score: 4.5,
    //       position: { lat: 49.05, lon: 6.05 },
    //     }),
    //   ]);

    //   const searchResult = await pgImmersionOfferRepository.getFromSearch({
    //     rome: "M1907",
    //     distance_km: 30,
    //     lat: 49.1,
    //     lon: 6.1,
    //     nafDivision: "85",
    //   });
    //   expect(searchResult).toHaveLength(2);
    //   const expectedResult1: SearchImmersionResultDto = {
    //     id: "13df03a5-a2a5-430a-b558-333333333344",
    //     address: "fake address establishment 2",
    //     name: "Company from api sirene for search",
    //     naf: "8539A",
    //     contactMode: "PHONE",
    //     location: { lat: 49.05, lon: 6.05 },
    //     voluntaryToImmersion: false,
    //     rome: "M1907",
    //     siret: "78000403200040",
    //     distance_m: 6653,
    //     city: "xxxx",
    //     nafLabel: "xxxx",
    //     romeLabel: "xxxx",
    //   };
    //   const expectedResult2: SearchImmersionResultDto = {
    //     id: "13df03a5-a2a5-430a-b558-111111111122",
    //     address: "fake address establishment 1",
    //     name: "Company from la bonne boite for search",
    //     voluntaryToImmersion: false,
    //     rome: "M1907",
    //     siret: "78000403200029",
    //     location: { lat: 49, lon: 6 },
    //     distance_m: 13308,
    //     naf: "8539A",
    //     contactMode: "EMAIL",
    //     city: "xxxx",
    //     nafLabel: "xxxx",
    //     romeLabel: "xxxx",
    //   };

    //   expect(
    //     searchResult.sort((a, b) => a.distance_m! - b.distance_m!),
    //   ).toMatchObject([expectedResult1, expectedResult2]);

    //   const searchResuts = await pgImmersionOfferRepository.getFromSearch({
    //     rome: "M1907",
    //     distance_km: 30,
    //     lat: 49.1,
    //     lon: 6.1,
    //     nafDivision: "85",
    //     siret: "78000403200040",
    //   });
    //   expect(searchResuts).toHaveLength(1);
    //   expect(searchResuts[0].siret).toBe("78000403200040");
    //   expect(searchResuts[0].contactDetails).toBeUndefined();

    //   const searchResultsWithDetails =
    //     await pgImmersionOfferRepository.getFromSearch(
    //       {
    //         rome: "M1907",
    //         distance_km: 30,
    //         lat: 49.1,
    //         lon: 6.1,
    //         nafDivision: "85",
    //         siret: "78000403200040",
    //       },
    //     );
    //   expect(searchResultsWithDetails).toHaveLength(1);
    //   expect(searchResultsWithDetails[0].siret).toBe("78000403200040");

    //   const expectedContactDetails: SearchContact = {
    //     id: "93144fe8-56a7-4807-8990-726badc6332b",
    //     lastName: "Doe",
    //     firstName: "John",
    //     email: "joe@mail.com",
    //     role: "super job",
    //     phone: "0640404040",
    //   };
    //   expect(searchResultsWithDetails[0].contactDetails).toEqual(
    //     expectedContactDetails,
    //   );
    // });
  });

  describe("Method insertImmersions", () => {
    test("Should not crash if empty array is provided", async () => {
      await pgImmersionOfferRepository.insertImmersions([]);
    });
    test("Should insert immersion", async () => {
      const newImmersion = new ImmersionOfferEntityBuilder().build();
      await pgImmersionOfferRepository.insertImmersions([newImmersion]);
      const retrieved = selectAllOffersRows();
      expect(retrieved).toHaveLength(1);
    });
    test("Should insert immersion related establishment when refering to a new establishment", () => {
      return;
    });
    test("Should update establishment if immersion refers to an existing establishment", () => {
      return;
    });
  });
  describe("Method insertEstablishments should update establishment and establishment_contact tables", () => {
    const siret = "78000403200019";
    const name = "Google";
    const initialEstablishmentAdress = "5 avenue des champs elysees";
    const initialContactId = "93144fe8-56a7-4807-8990-726badc6332b";
    const initialContactEmail = "clem@gmail.com";

    const initialEstablishment = new EstablishmentEntityBuilder()
      .withName(name)
      .withSiret(siret)
      .withAddress(initialEstablishmentAdress)
      .withContact(
        new ImmersionEstablishmentContactBuilder()
          .withSiret(siret)
          .withId(initialContactId)
          .withEmail(initialContactEmail)
          .build(),
      )
      .build();

    beforeEach(async () => {
      await pgImmersionOfferRepository.insertEstablishments([
        initialEstablishment,
      ]);
    });
    test("Insertion of a new establishment", async () => {
      const establishments = await selectEstablishmentRowsWhereSiretEquals(
        siret,
      );
      const establishmentContacts =
        await selectEstablishmentContactRowsWhereSiretEquals(siret);

      expect(establishments).toHaveLength(1);
      expect(establishments[0].address).toBe(initialEstablishmentAdress);
      console.log(establishments[0]);

      expect(establishmentContacts).toHaveLength(1);
      console.log("establishmentContacts: ", establishmentContacts);

      expect(establishmentContacts[0].uuid).toBe(initialContactId);
      expect(establishmentContacts[0].email).toBe(initialContactEmail);
    });
    test("Update establishment address ", async () => {
      const updatedEstablishmentAddress = "33 avenue des champs elysees";
      const updatedEstablishment = new EstablishmentEntityBuilder(
        initialEstablishment,
      )
        .withAddress(updatedEstablishmentAddress)
        .build();

      await pgImmersionOfferRepository.insertEstablishments([
        updatedEstablishment,
      ]);
      const establishmentsAfterUpdate =
        await selectEstablishmentRowsWhereSiretEquals(siret);
      expect(establishmentsAfterUpdate[0].address).toBe(
        updatedEstablishmentAddress,
      );
    });

    test("Update contact email", async () => {
      const updatedContactEmail = "clem92@gmail.com";
      const updatedEstablishment = new EstablishmentEntityBuilder(
        initialEstablishment,
      )
        .withContact(
          new ImmersionEstablishmentContactBuilder(
            initialEstablishment.getContact(),
          )
            .withEmail(updatedContactEmail)
            .build(),
        )
        .build();

      await pgImmersionOfferRepository.insertEstablishments([
        updatedEstablishment,
      ]);
      const establishmentContactsAfterUpdate =
        await selectEstablishmentContactRowsWhereSiretEquals(siret);
      expect(establishmentContactsAfterUpdate[0].email).toBe(
        updatedContactEmail,
      );
    });
    test("Update contact (someone new !)", async () => {
      const newContactId = "88884fe8-56a7-4807-8990-726badc6332b";
      const updatedEstablishment = new EstablishmentEntityBuilder(
        initialEstablishment,
      )
        .withContact(
          new ImmersionEstablishmentContactBuilder()
            .withId(newContactId)
            .withSiret(siret)
            .build(),
        )
        .build();
      await pgImmersionOfferRepository.insertEstablishments([
        updatedEstablishment,
      ]);
      const establishmentContactsAfterUpdate =
        await selectEstablishmentContactRowsWhereSiretEquals(siret);
      expect(establishmentContactsAfterUpdate).toHaveLength(2);
    });
  });
  test("Method getImmersionFromUuid", async () => {
    const immersionOfferId = "11111111-1111-1111-1111-111111111111";
    const siret = "11112222333344";

    const contactInEstablishment: ImmersionEstablishmentContact = {
      id: "11111111-0000-0000-0000-111111111111",
      lastName: "Doe",
      firstName: "John",
      email: "joe@mail.com",
      role: "super job",
      siretEstablishment: siret,
      phone: "0640295453",
    };

    const establishment = new EstablishmentEntityBuilder()
      .withSiret(siret)
      .withContact(contactInEstablishment)
      .build();

    await pgImmersionOfferRepository.insertEstablishments([establishment]);

    await pgImmersionOfferRepository.insertImmersions([
      new ImmersionOfferEntity({
        id: immersionOfferId,
        rome: "M1607",
        name: "Company from la bonne boite",
        voluntaryToImmersion: false,
        dataSource: "api_labonneboite",
        establishment,
        score: 4.5,
        position: { lat: 43.8666, lon: 8.3333 },
      }),
    ]);
    const immersionSearchResult =
      await pgImmersionOfferRepository.getImmersionFromUuid(immersionOfferId);
    expect(immersionSearchResult).toBeDefined();
    expect(immersionSearchResult!.getProps().name).toBe(
      "Company from la bonne boite",
    );

    expect(
      immersionSearchResult!.getProps().establishment.getContact(),
    ).toEqual(contactInEstablishment);
  });

  describe("Method insertEstablishmentContact", () => {
    const siret = "11112222333355";
    const establishmentContact: ImmersionEstablishmentContact = {
      id: "84007f00-f1fb-4458-a41f-492143ffc8df",
      email: "some@mail.com",
      firstName: "Bob",
      lastName: "MyName",
      role: "Chauffeur",
      siretEstablishment: siret,
      phone: "0640295453",
    };

    beforeEach(async () => {
      await pgImmersionOfferRepository.insertEstablishments([
        new EstablishmentEntityBuilder().withSiret(siret).build(),
      ]);
    });

    test("Inserts contact of existing establishment siret", async () => {
      await pgImmersionOfferRepository.insertEstablishmentContact(
        establishmentContact,
      );
      const rows = selectEstablishmentContactRowsWhereSiretEquals(siret);
      expect(rows).toHaveLength(1);
      expect(rows).toEqual([
        {
          uuid: establishmentContact.id,
          name: establishmentContact.lastName,
          firstname: establishmentContact.firstName,
          email: establishmentContact.email,
          role: establishmentContact.role,
          siret_establishment: siret,
          phone: establishmentContact.phone,
        },
      ]);
    });

    test("Updates contact informations", async () => {
      await pgImmersionOfferRepository.insertEstablishmentContact(
        establishmentContact,
      );
      await pgImmersionOfferRepository.insertEstablishmentContact(
        new ImmersionEstablishmentContactBuilder(establishmentContact)
          .withEmail("updated@email.com")
          .build(),
      );
      const rows = selectEstablishmentContactRowsWhereSiretEquals(siret);
      expect(rows).toHaveLength(1);
      expect(rows).toEqual([
        {
          uuid: establishmentContact.id,
          name: establishmentContact.lastName,
          firstname: establishmentContact.firstName,
          email: "updated@email.com",
          role: establishmentContact.role,
          siret_establishment: siret,
          phone: establishmentContact.phone,
        },
      ]);
    });
  });

  const selectEstablishmentRowsWhereSiretEquals = (siret: string) =>
    client
      .query("SELECT * FROM establishments WHERE siret=$1", [siret])
      .then((res) => res.rows);

  const selectEstablishmentContactRowsWhereSiretEquals = (siret: string) =>
    client
      .query("SELECT * FROM immersion_contacts WHERE siret_establishment=$1", [
        siret,
      ])
      .then((res) => res.rows);

  const selectAllOffersRows = () =>
    client.query("SELECT * FROM immersion_offers;").then((res) => res.rows);
});
