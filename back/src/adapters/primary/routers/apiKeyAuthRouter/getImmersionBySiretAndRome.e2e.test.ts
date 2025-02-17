import { SuperTest, Test } from "supertest";
import {
  rueSaintHonore,
  rueSaintHonoreDto,
} from "../../../../_testBuilders/addressDtos";
import { AppConfigBuilder } from "../../../../_testBuilders/AppConfigBuilder";
import { buildTestApp } from "../../../../_testBuilders/buildTestApp";
import { ContactEntityV2Builder } from "../../../../_testBuilders/ContactEntityV2Builder";
import { EstablishmentAggregateBuilder } from "../../../../_testBuilders/EstablishmentAggregateBuilder";
import { EstablishmentEntityV2Builder } from "../../../../_testBuilders/EstablishmentEntityV2Builder";
import { ImmersionOfferEntityV2Builder } from "../../../../_testBuilders/ImmersionOfferEntityV2Builder";
import { InMemoryUnitOfWork } from "../../config/uowConfig";
import { SearchImmersionResultPublicV1 } from "../DtoAndSchemas/v1/output/SearchImmersionResultPublicV1.dto";
import {
  TEST_APPELLATION_LABEL,
  TEST_NAF_LABEL,
  TEST_POSITION,
  TEST_ROME_LABEL,
} from "../../../secondary/immersionOffer/InMemoryEstablishmentAggregateRepository";
import {
  GenerateApiConsumerJtw,
  makeGenerateJwtES256,
} from "../../../../domain/auth/jwt";
import { immersionOffersRoute } from "shared";

const authorizedApiKeyId = "my-authorized-id";
const immersionOfferRome = "B1805";
const immersionOfferSiret = "78000403200019";

describe(`Route to get ImmersionSearchResultDto by siret and rome - /v1/${immersionOffersRoute}/:siret/:rome`, () => {
  let request: SuperTest<Test>;
  let inMemoryUow: InMemoryUnitOfWork;
  let generateApiJwt: GenerateApiConsumerJtw;

  beforeEach(async () => {
    const config = new AppConfigBuilder()
      .withRepositories("IN_MEMORY")
      .withAuthorizedApiKeyIds([authorizedApiKeyId])
      .build();
    ({ request, inMemoryUow } = await buildTestApp(config));
    generateApiJwt = makeGenerateJwtES256(config.apiJwtPrivateKey);

    await inMemoryUow.establishmentAggregateRepository.insertEstablishmentAggregates(
      [
        new EstablishmentAggregateBuilder()
          .withEstablishment(
            new EstablishmentEntityV2Builder()
              .withSiret(immersionOfferSiret)
              .withPosition(TEST_POSITION)
              .withNumberOfEmployeeRange("10-19")
              .withAddress(rueSaintHonoreDto)
              .build(),
          )
          .withContact(
            new ContactEntityV2Builder().withContactMethod("EMAIL").build(),
          )
          .withImmersionOffers([
            new ImmersionOfferEntityV2Builder()
              .withRomeCode(immersionOfferRome)
              .build(),
          ])
          .build(),
      ],
    );
  });

  it("rejects unauthenticated requests", async () => {
    await request
      .get(
        `/v1/${immersionOffersRoute}/${immersionOfferSiret}/${immersionOfferRome}`,
      )
      .expect(401);
  });

  it("accepts valid authenticated requests", async () => {
    // /!\ Those fields come from Builder (should probably not.)
    const expectedResult: SearchImmersionResultPublicV1 = {
      rome: immersionOfferRome,
      naf: "8539A",
      siret: "78000403200019",
      name: "Company inside repository",
      voluntaryToImmersion: true,
      position: TEST_POSITION,
      numberOfEmployeeRange: "10-19",
      address: rueSaintHonore,
      contactMode: "EMAIL",
      contactDetails: {
        id: "3ca6e619-d654-4d0d-8fa6-2febefbe953d",
        lastName: "Prost",
        firstName: "Alain",
        email: "alain.prost@email.fr",
        phone: "0612345678",
        job: "le big boss",
      },
      romeLabel: TEST_ROME_LABEL,
      appellationLabels: [TEST_APPELLATION_LABEL],
      nafLabel: TEST_NAF_LABEL,
      city: rueSaintHonoreDto.city,
    };

    const authToken = generateApiJwt({
      id: authorizedApiKeyId,
    });

    await request
      .get(
        `/v1/${immersionOffersRoute}/${immersionOfferSiret}/${immersionOfferRome}`,
      )
      .set("Authorization", authToken)
      .expect(200, expectedResult);
  });
  it("returns 404 if no offer can be found with such siret & rome", async () => {
    const siretNotInDB = "11000403200019";
    const authToken = generateApiJwt({
      id: authorizedApiKeyId,
    });
    await request
      .get(`/v1/${immersionOffersRoute}/${siretNotInDB}/${immersionOfferRome}`)
      .set("Authorization", authToken)
      .expect(
        404,
        `{"errors":"No offer found for siret ${siretNotInDB} and rome ${immersionOfferRome}"}`,
      );
  });
});
