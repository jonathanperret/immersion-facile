import supertest, { SuperTest, Test } from "supertest";
import { createApp } from "../../adapters/primary/server";
import { AppConfigBuilder } from "../../_testBuilders/AppConfigBuilder";
import { SearchImmersionResultDto } from "../../shared/SearchImmersionDto";

describe("/get-immersion-by-id route", () => {
  let request: SuperTest<Test>;

  beforeEach(async () => {
    const { app } = await createApp(new AppConfigBuilder().build());
    request = supertest(app);
  });

  test("accepts valid requests", async () => {
    const expectedResult: SearchImmersionResultDto = {
      id: "13df03a5-a2a5-430a-b558-ed3e2f03512d",
      rome: "M1907",
      naf: "8539A",
      siret: "78000403200019",
      name: "Company inside repository",
      voluntaryToImmersion: false,
      location: { lat: 35, lon: 50 },
      address: "55 rue de Faubourg Sante Honoré",
      contactMode: "EMAIL",
      contactId: "3ca6e619-d654-4d0d-8fa6-2febefbe953d",
      romeLabel: "xxxx",
      nafLabel: "xxxx",
      city: "xxxx",
    };

    await request
      .get("/get-immersion-by-id/13df03a5-a2a5-430a-b558-ed3e2f03512d")
      .expect(200, expectedResult);
  });

  test("rejects requests with missing id", async () => {
    await request.get("/get-immersion-by-id/sfdfdsdf").expect(404);
  });

  test("rejects requests with wrong id", async () => {
    await request.get("/get-immersion-by-id/").expect(404);
  });
});
