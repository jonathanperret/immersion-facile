import { createInMemoryUow } from "../../../adapters/primary/config";
import { BadRequestError } from "../../../adapters/primary/helpers/httpErrors";
import { InMemoryEstablishmentAggregateRepository } from "../../../adapters/secondary/immersionOffer/InMemoryEstablishmentAggregateRepository";
import { InMemoryUowPerformer } from "../../../adapters/secondary/InMemoryUowPerformer";
import { RetrieveFormEstablishmentFromAggregates } from "../../../domain/immersionOffer/useCases/RetrieveFormEstablishmentFromAggregates";
import { FormEstablishmentDto } from "shared/src/formEstablishment/FormEstablishment.dto";
import { EstablishmentJwtPayload } from "shared/src/tokens/MagicLinkPayload";
import { ContactEntityV2Builder } from "../../../_testBuilders/ContactEntityV2Builder";
import { EstablishmentAggregateBuilder } from "../../../_testBuilders/EstablishmentAggregateBuilder";
import { EstablishmentEntityV2Builder } from "../../../_testBuilders/EstablishmentEntityV2Builder";
import { ImmersionOfferEntityV2Builder } from "../../../_testBuilders/ImmersionOfferEntityV2Builder";
import { expectPromiseToFailWithError } from "../../../_testBuilders/test.helpers";

const prepareUseCase = () => {
  const establishmentAggregateRepo =
    new InMemoryEstablishmentAggregateRepository();
  const uowPerformer = new InMemoryUowPerformer({
    ...createInMemoryUow(),
    establishmentAggregateRepo,
  });
  const useCase = new RetrieveFormEstablishmentFromAggregates(uowPerformer);
  return { useCase, establishmentAggregateRepo };
};

describe("Retrieve Form Establishment From Aggregate when payload is valid", () => {
  const siret = "12345678901234";
  const jwtPayload: EstablishmentJwtPayload = {
    siret,
    exp: 2,
    iat: 1,
    version: 1,
  };
  it("throws an error if there is no establishment with this siret", async () => {
    const { useCase } = prepareUseCase();
    await expectPromiseToFailWithError(
      useCase.execute(undefined, jwtPayload),
      new BadRequestError(
        "No establishment found with siret 12345678901234 and form data source. ",
      ),
    );
  });
  it("throws an error if there is no establishment from form with this siret", async () => {
    // Prepare : there is an establishment with the siret, but from LBB
    const { useCase, establishmentAggregateRepo } = prepareUseCase();
    await establishmentAggregateRepo.insertEstablishmentAggregates([
      new EstablishmentAggregateBuilder()
        .withEstablishment(
          new EstablishmentEntityV2Builder()
            .withSiret(siret)
            .withDataSource("api_labonneboite")
            .build(),
        )
        .build(),
    ]);
    // Act and assert
    await expectPromiseToFailWithError(
      useCase.execute(undefined, jwtPayload),
      new BadRequestError(
        "No establishment found with siret 12345678901234 and form data source. ",
      ),
    );
  });
  it("returns a reconstructed form if establishment with siret exists with dataSource=form", async () => {
    const { useCase, establishmentAggregateRepo } = prepareUseCase();
    const establishment = new EstablishmentEntityV2Builder()
      .withSiret(siret)
      .withDataSource("form")
      .build();
    const contact = new ContactEntityV2Builder().build();
    const offer = new ImmersionOfferEntityV2Builder()
      .withRomeCode("A1101")
      .withAppellationCode("11987")
      .build();

    await establishmentAggregateRepo.insertEstablishmentAggregates([
      new EstablishmentAggregateBuilder()
        .withEstablishment(establishment)
        .withContact(contact)
        .withImmersionOffers([offer])
        .build(),
    ]);
    // Act
    const retrievedForm = await useCase.execute(undefined, jwtPayload);

    // Assert
    expect(retrievedForm).toBeDefined();
    const expectedForm: FormEstablishmentDto = {
      siret,
      source: "immersion-facile",
      businessName: establishment.name,
      businessNameCustomized: establishment.customizedName,
      businessAddress: establishment.address,
      isEngagedEnterprise: establishment.isCommited,
      naf: establishment.nafDto,
      isSearchable: establishment.isSearchable,
      appellations: [
        {
          appellationLabel: "test_appellation_label",
          romeLabel: "test_rome_label",
          romeCode: "A1101",
          appellationCode: "11987",
        },
      ],
      businessContact: contact,
    };
    expect(retrievedForm).toMatchObject(expectedForm);
  });
});
