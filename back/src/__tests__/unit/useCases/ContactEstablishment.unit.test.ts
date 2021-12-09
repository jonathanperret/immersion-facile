import { NotFoundError } from "../../../adapters/primary/helpers/sendHttpResponse";
import { CustomClock } from "../../../adapters/secondary/core/ClockImplementations";
import { InMemoryOutboxRepository } from "../../../adapters/secondary/core/InMemoryOutboxRepository";
import { TestUuidGenerator } from "../../../adapters/secondary/core/UuidGeneratorImplementations";
import { InMemoryImmersionOfferRepository } from "../../../adapters/secondary/immersionOffer/InMemoryImmersonOfferRepository";
import { makeCreateInMemoryUow } from "../../../adapters/secondary/InMemoryUnitOfWork";
import { InMemoryUowPerformer } from "../../../adapters/secondary/InMemoryUowPerformer";
import { makeCreateNewEvent } from "../../../domain/core/eventBus/EventBus";
import { UnitOfWorkPerformer } from "../../../domain/core/ports/UnitOfWork";
import { ContactEstablishment } from "../../../domain/immersionOffer/useCases/ContactEstablishment";
import { ContactEstablishmentRequestDto } from "../../../shared/contactEstablishment";
import { ImmersionOfferEntityBuilder } from "../../../_testBuilders/ImmersionOfferEntityBuilder";
import { expectPromiseToFailWithError } from "../../../_testBuilders/test.helpers";
import { BadRequestError } from "./../../../adapters/primary/helpers/sendHttpResponse";
import { ImmersionEstablishmentContact } from "./../../../domain/immersionOffer/entities/EstablishmentEntity";
import { EstablishmentEntityBuilder } from "./../../../_testBuilders/EstablishmentEntityBuilder";

const siret = "12354678901234";
const contact: ImmersionEstablishmentContact = {
  id: "37dd0b5e-3270-11ec-8d3d-0242ac130003",
  name: "Dupont",
  firstname: "Pierre",
  email: "test@email.fr",
  role: "Directeur",
  siretEstablishment: siret,
  phone: "0640295453",
};
const establishment = new EstablishmentEntityBuilder()
  .withSiret(siret)
  .withRomes([])
  .withNaf("8539A")
  .withContact(contact)
  .withContactMode("EMAIL")
  .build();
const immersionOffer = new ImmersionOfferEntityBuilder()
  .withRome("M1607")
  .withPosition({ lat: 43.8666, lon: 8.3333 })
  .withEstablishment(establishment)
  .build();

const validRequest: ContactEstablishmentRequestDto = {
  immersionOfferId: immersionOffer.getId(),
  contactMode: "EMAIL",
  senderName: "sender_name",
  senderEmail: "sender@email.fr",
  message: "message_to_send",
};

describe("ContactEstablishment", () => {
  let contactEstablishment: ContactEstablishment;
  let immersionOfferRepository: InMemoryImmersionOfferRepository;
  let outboxRepository: InMemoryOutboxRepository;
  let uowPerformer: UnitOfWorkPerformer;
  let uuidGenerator: TestUuidGenerator;
  let clock: CustomClock;

  beforeEach(() => {
    immersionOfferRepository = new InMemoryImmersionOfferRepository();
    outboxRepository = new InMemoryOutboxRepository();
    uowPerformer = new InMemoryUowPerformer(
      makeCreateInMemoryUow({
        immersionOfferRepo: immersionOfferRepository,
        outboxRepo: outboxRepository,
      }),
    );
    clock = new CustomClock();
    uuidGenerator = new TestUuidGenerator();
    const createNewEvent = makeCreateNewEvent({ clock, uuidGenerator });

    contactEstablishment = new ContactEstablishment(
      uowPerformer,
      createNewEvent,
    );
  });

  test("schedules event for valid EMAIL contact request", async () => {
    await immersionOfferRepository.insertImmersions([immersionOffer]);

    const eventId = "event_id";
    uuidGenerator.setNextUuid(eventId);

    const now = new Date("2021-12-08T15:00");
    clock.setNextDate(now);

    await contactEstablishment.execute(validRequest);

    expect(outboxRepository.events).toEqual([
      {
        id: eventId,
        occurredAt: now.toISOString(),
        topic: "EmailContactRequestedByBeneficiary",
        wasPublished: false,
        wasQuarantined: false,
        payload: validRequest,
      },
    ]);
  });

  test("schedules no event for valid PHONE contact requests", async () => {
    await immersionOfferRepository.insertImmersions([immersionOffer]);
    await immersionOfferRepository.insertEstablishments([
      new EstablishmentEntityBuilder(establishment)
        .withContactMode("PHONE")
        .build(),
    ]);

    await contactEstablishment.execute({
      ...validRequest,
      contactMode: "PHONE",
    });

    expect(outboxRepository.events).toHaveLength(0);
  });

  test("schedules no event for valid IN_PERSON contact requests", async () => {
    await immersionOfferRepository.insertImmersions([immersionOffer]);
    await immersionOfferRepository.insertEstablishments([
      new EstablishmentEntityBuilder(establishment)
        .withContactMode("IN_PERSON")
        .build(),
    ]);

    await contactEstablishment.execute({
      ...validRequest,
      contactMode: "IN_PERSON",
    });

    expect(outboxRepository.events).toHaveLength(0);
  });

  test("throws NotFoundError for missing immersion offer", async () => {
    // No immersion offer

    await expectPromiseToFailWithError(
      contactEstablishment.execute({
        ...validRequest,
        immersionOfferId: "missing_offer_id",
      }),
      new NotFoundError("missing_offer_id"),
    );
  });

  test("throws BadRequestError for contact mode mismatch", async () => {
    await immersionOfferRepository.insertImmersions([immersionOffer]);
    await immersionOfferRepository.insertEstablishments([
      new EstablishmentEntityBuilder(establishment)
        .withContactMode("PHONE")
        .build(),
    ]);

    await expectPromiseToFailWithError(
      contactEstablishment.execute({
        ...validRequest,
        contactMode: "IN_PERSON",
      }),
      new BadRequestError(
        `contact mode mismatch: IN_PERSON in immersion offer: ${validRequest.immersionOfferId}`,
      ),
    );
  });

  test("throws BadRequestError immersion offer without contact id", async () => {
    await immersionOfferRepository.insertImmersions([
      new ImmersionOfferEntityBuilder(immersionOffer.getProps())
        .withEstablishment(
          new EstablishmentEntityBuilder(establishment).clearContact().build(),
        )
        .build(),
    ]);

    await expectPromiseToFailWithError(
      contactEstablishment.execute(validRequest),
      new BadRequestError(
        `no contact id in immersion offer: ${validRequest.immersionOfferId}`,
      ),
    );
  });
});
