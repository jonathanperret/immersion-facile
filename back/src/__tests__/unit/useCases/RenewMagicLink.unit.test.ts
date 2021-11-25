import {
  CreateNewEvent,
  makeCreateNewEvent,
} from "./../../../domain/core/eventBus/EventBus";
import { InMemoryOutboxRepository } from "./../../../adapters/secondary/core/InMemoryOutboxRepository";
import { RenewMagicLink } from "./../../../domain/immersionApplication/useCases/RenewMagicLink";
import { InMemoryAgencyRepository } from "../../../adapters/secondary/InMemoryAgencyRepository";
import { InMemoryEmailGateway } from "../../../adapters/secondary/InMemoryEmailGateway";
import { EmailFilter } from "../../../domain/core/ports/EmailFilter";
import {
  ImmersionApplicationDto,
  RenewMagicLinkRequestDto,
} from "../../../shared/ImmersionApplicationDto";
import { AgencyConfigBuilder } from "../../../_testBuilders/AgencyConfigBuilder";
import { ImmersionApplicationEntityBuilder } from "../../../_testBuilders/ImmersionApplicationEntityBuilder";
import { AlwaysAllowEmailFilter } from "../../../adapters/secondary/core/EmailFilterImplementations";
import { AgencyConfig } from "../../../domain/immersionApplication/ports/AgencyRepository";
import { InMemoryImmersionApplicationRepository } from "../../../adapters/secondary/InMemoryImmersionApplicationRepository";
import { CustomClock } from "../../../adapters/secondary/core/ClockImplementations";
import { TestUuidGenerator } from "../../../adapters/secondary/core/UuidGeneratorImplementations";
import { GenerateJwtFn } from "../../../domain/auth/jwt";
import {
  createMagicLinkPayload,
  MagicLinkPayload,
} from "../../../shared/tokens/MagicLinkPayload";
import {
  BadRequestError,
  NotFoundError,
} from "../../../adapters/primary/helpers/sendHttpResponse";
import { expectPromiseToFailWithError } from "../../../_testBuilders/test.helpers";

const validDemandeImmersion: ImmersionApplicationDto =
  new ImmersionApplicationEntityBuilder().build().toDto();

const defaultAgencyConfig = AgencyConfigBuilder.create(
  validDemandeImmersion.agencyId,
).build();

describe("RenewMagicLink use case", () => {
  let emailFilter: EmailFilter;
  let emailGw: InMemoryEmailGateway;
  let agencyConfig: AgencyConfig;
  let applicationRepository: InMemoryImmersionApplicationRepository;
  let outboxRepository: InMemoryOutboxRepository;
  let clock: CustomClock;
  let uuidGenerator: TestUuidGenerator;
  let createNewEvent: CreateNewEvent;
  let agencyRepository: InMemoryAgencyRepository;

  const generateJwtFn: GenerateJwtFn = (payload: MagicLinkPayload) => {
    return payload.applicationId + "; " + payload.roles.join(",");
  };

  beforeEach(() => {
    emailFilter = new AlwaysAllowEmailFilter();
    emailGw = new InMemoryEmailGateway();
    agencyConfig = defaultAgencyConfig;
    applicationRepository = new InMemoryImmersionApplicationRepository();
    outboxRepository = new InMemoryOutboxRepository();
    clock = new CustomClock();
    uuidGenerator = new TestUuidGenerator();
    createNewEvent = makeCreateNewEvent({ clock, uuidGenerator });
    agencyRepository = new InMemoryAgencyRepository([agencyConfig]);

    const entity = new ImmersionApplicationEntityBuilder().build();
    applicationRepository.setDemandesImmersion({ [entity.id]: entity });
  });

  const createUseCase = () => {
    return new RenewMagicLink(
      applicationRepository,
      createNewEvent,
      outboxRepository,
      agencyRepository,
      generateJwtFn,
    );
  };

  it("requires a valid application id", async () => {
    const request: RenewMagicLinkRequestDto = {
      applicationId: "not-a-valid-id",
      role: "counsellor",
      linkFormat: "immersionfacile.com/%jwt%",
    };

    await expectPromiseToFailWithError(
      createUseCase().execute(request),
      new NotFoundError("not-a-valid-id"),
    );
  });

  it("requires a known agency id", async () => {
    const storedUnknownId = "some unknown agency id";
    const entity = new ImmersionApplicationEntityBuilder()
      .withAgencyId(storedUnknownId)
      .build();
    applicationRepository.setDemandesImmersion({ [entity.id]: entity });

    const request: RenewMagicLinkRequestDto = {
      applicationId: validDemandeImmersion.id,
      role: "counsellor",
      linkFormat: "immersionfacile.fr/%jwt%",
    };

    await expectPromiseToFailWithError(
      createUseCase().execute(request),
      new BadRequestError(storedUnknownId),
    );
  });

  // Admins use non-magic-link based authentication, so no need to renew these.
  it("Refuses to generate admin magic links", async () => {
    const request: RenewMagicLinkRequestDto = {
      applicationId: validDemandeImmersion.id,
      role: "admin",
      linkFormat: "immersionfacile.fr/%jwt%",
    };

    await expectPromiseToFailWithError(
      createUseCase().execute(request),
      new BadRequestError("L'admin n'a pas de liens magiques."),
    );
  });

  it("requires a link format that includes %jwt% string", async () => {
    const request: RenewMagicLinkRequestDto = {
      applicationId: validDemandeImmersion.id,
      role: "counsellor",
      linkFormat: "immersionfacile.fr/",
    };

    await expectPromiseToFailWithError(
      createUseCase().execute(request),
      new BadRequestError(request.linkFormat),
    );
  });

  it("Posts an event to deliver a correct JWT for correct responses", async () => {
    const linkFormat = "immersionfacile.fr/%jwt%";
    const request: RenewMagicLinkRequestDto = {
      applicationId: validDemandeImmersion.id,
      role: "beneficiary",
      linkFormat,
    };

    await createUseCase().execute(request);

    const expectedJWT = generateJwtFn(
      createMagicLinkPayload(validDemandeImmersion.id, "beneficiary"),
    );

    expect(outboxRepository.events).toEqual([
      createNewEvent({
        topic: "MagicLinkRenewalRequested",
        payload: {
          emails: [validDemandeImmersion.email],
          magicLink: "immersionfacile.fr/" + expectedJWT,
        },
      }),
    ]);
  });
});