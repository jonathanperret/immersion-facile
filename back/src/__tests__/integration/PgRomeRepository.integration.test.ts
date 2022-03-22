import { Pool, PoolClient } from "pg";
import { expectTypeToMatchAndEqual } from "../../_testBuilders/test.helpers";
import { PgRomeRepository } from "../../adapters/secondary/pg/PgRomeRepository";
import { getTestPgPool } from "../../_testBuilders/getTestPgPool";

describe("Postgres implementation of Rome Gateway", () => {
  let pool: Pool;

  let client: PoolClient;
  let pgRomeRepository: PgRomeRepository;

  beforeAll(async () => {
    //We do not empty the data because the table data is static as it public data
    pool = getTestPgPool();
    client = await pool.connect();
    pgRomeRepository = new PgRomeRepository(client);
  });

  afterAll(async () => {
    client.release();
    await pool.end();
  });

  describe("appellationToCodeMetier", () => {
    test("Conversion of appellation to ROME works", async () => {
      expect(await pgRomeRepository.appellationToCodeMetier("10868")).toBe(
        "D1102",
      );
    });
  });

  describe("searchMetier", () => {
    test("Search of metier works", async () => {
      const result = await pgRomeRepository.searchMetier("boulangère");
      expectTypeToMatchAndEqual(result, [
        { codeRome: "D1102", libelleRome: "Boulangerie - viennoiserie" },
      ]);
    });

    test("Correctly handles search queries with multiple words", async () => {
      const result = await pgRomeRepository.searchMetier(
        "recherche en sciences",
      );
      expectTypeToMatchAndEqual(result, [
        {
          codeRome: "K2401",
          libelleRome: "Recherche en sciences de l'homme et de la société",
        },
        {
          codeRome: "K2402",
          libelleRome:
            "Recherche en sciences de l'univers, de la matière et du vivant",
        },
      ]);
    });
  });

  describe("searchAppellation", () => {
    test("Conversion of appellation to ROME works", async () => {
      expect(await pgRomeRepository.searchAppellation("boulang")).toHaveLength(
        13,
      );

      const result = await pgRomeRepository.searchAppellation("Aide-boulanger");
      expectTypeToMatchAndEqual(result, [
        {
          codeAppellation: "10868",
          libelleAppellation: "Aide-boulanger / Aide-boulangère",
          codeRome: "D1102",
          libelleRome: "Bob",
        },
      ]);
    });

    test("Correctly handles search queries with multiple words", async () => {
      const result = await pgRomeRepository.searchAppellation("Chef de boule");
      expectTypeToMatchAndEqual(result, [
        {
          codeAppellation: "12071",
          libelleAppellation: "Chef de boule",
          codeRome: "G1206",
          libelleRome: "to add",
        },
        {
          codeAppellation: "12197",
          libelleAppellation: "Chef de partie de boule",
          codeRome: "G1206",
          libelleRome: "to add",
        },
      ]);
    });
  });
});
