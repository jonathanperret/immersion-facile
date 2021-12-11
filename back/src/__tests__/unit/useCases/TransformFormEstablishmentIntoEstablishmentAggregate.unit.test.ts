import { TestUuidGenerator } from "../../../adapters/secondary/core/UuidGeneratorImplementations";
import { InMemoryEstablishmentRepository } from "../../../adapters/secondary/immersionOffer/InMemoryEstabishmentRepository";
import { InMemoryRomeGateway } from "../../../adapters/secondary/InMemoryRomeGateway";
import { InMemorySirenGateway } from "../../../adapters/secondary/InMemorySirenGateway";
import { SequenceRunner } from "../../../domain/core/ports/SequenceRunner";
import { EstablishmentAggregate } from "../../../domain/immersionOffer/entities/EstablishmentAggregate";
import { Position } from "../../../domain/immersionOffer/ports/GetPosition";
import { TransformFormEstablishmentIntoEstablishmentAggregate } from "../../../domain/immersionOffer/useCases/TransformFormEstablishmentIntoEstablishmentAggregate";
import { SirenEstablishment } from "../../../domain/sirene/ports/SirenGateway";
import { FormEstablishmentDto } from "../../../shared/FormEstablishmentDto";
import { FormEstablishmentDtoBuilder } from "../../../_testBuilders/FormEstablishmentDtoBuilder";

class TestSequenceRunner implements SequenceRunner {
  public run<Input, Output>(array: Input[], cb: (a: Input) => Promise<Output>) {
    return Promise.all(array.map(cb));
  }
}

const fakePosition: Position = { lat: 49.119146, lon: 6.17602 };
const buildSirenEstablishmentFromFormEstablishment = (
  formEstablishment: FormEstablishmentDto,
): SirenEstablishment => ({
  siret: formEstablishment.siret,
  uniteLegale: {
    denominationUniteLegale: formEstablishment.businessName,
    activitePrincipaleUniteLegale: "85.59A",
    trancheEffectifsUniteLegale: "01",
  },
  adresseEtablissement: {
    numeroVoieEtablissement: formEstablishment.businessAddress,
    typeVoieEtablissement: formEstablishment.businessAddress,
    libelleVoieEtablissement: formEstablishment.businessAddress,
    codePostalEtablissement: formEstablishment.businessAddress,
    libelleCommuneEtablissement: formEstablishment.businessAddress,
  },
});

describe("Transform FormEstablishment into EstablishmentAggregate", () => {
  let sirenRepo: InMemorySirenGateway;
  let establishmentRepo: InMemoryEstablishmentRepository;
  let transformFormEstablishmentIntoEstablishmentAggregate: TransformFormEstablishmentIntoEstablishmentAggregate;
  let uuidGenerator: TestUuidGenerator;

  beforeEach(() => {
    sirenRepo = new InMemorySirenGateway();
    establishmentRepo = new InMemoryEstablishmentRepository();
    uuidGenerator = new TestUuidGenerator();

    const getPosition = async () => fakePosition;
    const inMemoryRomeGateway = new InMemoryRomeGateway();
    const sequencerRunner = new TestSequenceRunner();

    transformFormEstablishmentIntoEstablishmentAggregate =
      new TransformFormEstablishmentIntoEstablishmentAggregate(
        establishmentRepo,
        getPosition,
        sirenRepo,
        inMemoryRomeGateway,
        sequencerRunner,
        uuidGenerator,
      );
  });

  it("converts Form Establishment when siret in sirenGateway and correct given ROME code metier", async () => {
    // prepare
    const romeCode = "D1102";
    const formEstablishment = FormEstablishmentDtoBuilder.valid()
      .withProfessions([
        {
          description: "boulanger",
          romeCodeMetier: romeCode,
        },
      ])
      .build();
    const sirenEstablishment =
      buildSirenEstablishmentFromFormEstablishment(formEstablishment);
    sirenRepo.setEstablishment(sirenEstablishment);
    uuidGenerator.setNextUuids(["my-contact-id", "my-immersion-offer-id"]);

    // act
    await transformFormEstablishmentIntoEstablishmentAggregate.execute(
      formEstablishment,
    );

    // assert
    const establishments = await establishmentRepo.establishments;
    expect(establishments).toHaveLength(1);

    const establishment = establishments[0];

    expectEstablishmentToEqual(establishment, {
      siret: formEstablishment.siret,
      name: formEstablishment.businessName,
      address: formEstablishment.businessAddress,
      voluntaryToImmersion: true,
      dataSource: "form",
      score: 10,
      position: fakePosition,
      naf: "8559A",
      numberEmployeesRange: 1,
      immersionOffers: [
        {
          id: "my-immersion-offer-id",
          rome: romeCode,
        },
      ],
      contacts: [
        {
          id: "my-contact-id",
          lastName: formEstablishment.businessContacts[0].lastName,
          firstName: formEstablishment.businessContacts[0].firstName,
          email: formEstablishment.businessContacts[0].email,
          phone: formEstablishment.businessContacts[0].phone,
          job: formEstablishment.businessContacts[0].job,
        },
      ],
    });
  });

  it("converts Form Establishment when siret in sirenGateway and correct given ROME code metier", async () => {
    // prepare
    const romeAppelation = "11987";
    const formEstablishment = FormEstablishmentDtoBuilder.valid()
      .withProfessions([
        {
          description: "boulanger",
          romeCodeAppellation: romeAppelation,
        },
      ])
      .build();
    const sirenEstablishment =
      buildSirenEstablishmentFromFormEstablishment(formEstablishment);
    sirenRepo.setEstablishment(sirenEstablishment);
    uuidGenerator.setNextUuids(["my-contact-id", "my-immersion-offer-id"]);

    // act
    await transformFormEstablishmentIntoEstablishmentAggregate.execute(
      formEstablishment,
    );

    // assert
    const establishments = await establishmentRepo.establishments;
    expect(establishments).toHaveLength(1);

    const establishment = establishments[0];
    expect(establishment.immersionOffers).toEqual([
      { id: "my-immersion-offer-id", rome: "A1101" },
    ]);
  });

  const expectEstablishmentToEqual = (
    value: EstablishmentAggregate,
    expected: EstablishmentAggregate,
  ) => {
    expect(value).toEqual(expected);
  };
});
