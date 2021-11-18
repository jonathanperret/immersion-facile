import { ALWAYS_REJECT } from "../../domain/auth/AuthChecker";
import { InMemoryAuthChecker } from "../../domain/auth/InMemoryAuthChecker";
import { GenerateJwtFn, makeGenerateJwt } from "../../domain/auth/jwt";
import {
  EventBus,
  makeCreateNewEvent,
} from "../../domain/core/eventBus/EventBus";
import { EventCrawler } from "../../domain/core/eventBus/EventCrawler";
import { EmailFilter } from "../../domain/core/ports/EmailFilter";
import { OutboxRepository } from "../../domain/core/ports/OutboxRepository";
import {
  AddImmersionApplication,
  AddImmersionApplicationML,
} from "../../domain/immersionApplication/useCases/AddImmersionApplication";
import { GenerateMagicLink } from "../../domain/immersionApplication/useCases/GenerateMagicLink";
import { GetImmersionApplication } from "../../domain/immersionApplication/useCases/GetImmersionApplication";
import { ListAgencies } from "../../domain/immersionApplication/useCases/ListAgencies";
import { ListImmersionApplication } from "../../domain/immersionApplication/useCases/ListImmersionApplication";
import { ConfirmToBeneficiaryThatApplicationCorrectlySubmitted } from "../../domain/immersionApplication/useCases/notifications/ConfirmToBeneficiaryThatApplicationCorrectlySubmitted";
import { ConfirmToMentorThatApplicationCorrectlySubmitted } from "../../domain/immersionApplication/useCases/notifications/ConfirmToMentorThatApplicationCorrectlySubmitted";
import { NotifyAllActorsOfFinalApplicationValidation } from "../../domain/immersionApplication/useCases/notifications/NotifyAllActorsOfFinalApplicationValidation";
import { NotifyBeneficiaryAndEnterpriseThatApplicationIsRejected } from "../../domain/immersionApplication/useCases/notifications/NotifyBeneficiaryAndEnterpriseThatApplicationIsRejected";
import { NotifyBeneficiaryAndEnterpriseThatApplicationNeedsModification } from "../../domain/immersionApplication/useCases/notifications/NotifyBeneficiaryAndEnterpriseThatApplicationNeedsModification";
import { NotifyNewApplicationNeedsReview } from "../../domain/immersionApplication/useCases/notifications/NotifyNewApplicationNeedsReview";
import { NotifyToTeamApplicationSubmittedByBeneficiary } from "../../domain/immersionApplication/useCases/notifications/NotifyToTeamApplicationSubmittedByBeneficiary";
import { UpdateImmersionApplication } from "../../domain/immersionApplication/useCases/UpdateImmersionApplication";
import { UpdateImmersionApplicationStatus } from "../../domain/immersionApplication/useCases/UpdateImmersionApplicationStatus";
import { ValidateImmersionApplication } from "../../domain/immersionApplication/useCases/ValidateImmersionApplication";
import { AddFormEstablishment } from "../../domain/immersionOffer/useCases/AddFormEstablishment";
import { SearchImmersion } from "../../domain/immersionOffer/useCases/SearchImmersion";
import { TransformFormEstablishmentIntoSearchData } from "../../domain/immersionOffer/useCases/TransformFormEstablishmentIntoSearchData";
import { RomeSearch } from "../../domain/rome/useCases/RomeSearch";
import { ImmersionApplicationId } from "../../shared/ImmersionApplicationDto";
import {
  createMagicLinkPayload,
  Role,
} from "../../shared/tokens/MagicLinkPayload";
import { createLogger } from "../../utils/logger";
import { RealClock } from "../secondary/core/ClockImplementations";
import {
  AllowListEmailFilter,
  AlwaysAllowEmailFilter,
} from "../secondary/core/EmailFilterImplementations";
import {
  BasicEventCrawler,
  RealEventCrawler,
} from "../secondary/core/EventCrawlerImplementations";
import { InMemoryEventBus } from "../secondary/core/InMemoryEventBus";
import { ThrottledSequenceRunner } from "../secondary/core/ThrottledSequenceRunner";
import { UuidV4Generator } from "../secondary/core/UuidGeneratorImplementations";
import { PoleEmploiRomeGateway } from "../secondary/immersionOffer/PoleEmploiRomeGateway";
import { InMemoryAgencyRepository } from "../secondary/InMemoryAgencyRepository";
import { InMemoryEmailGateway } from "../secondary/InMemoryEmailGateway";
import { InMemoryFormEstablishmentRepository } from "../secondary/InMemoryFormEstablishmentRepository";
import { InMemoryRomeGateway } from "../secondary/InMemoryRomeGateway";
import { PgAgencyRepository } from "../secondary/pg/PgAgencyRepository";
import { PgFormEstablishmentRepository } from "../secondary/pg/PgFormEstablishmentRepository";
import { SendinblueEmailGateway } from "../secondary/SendinblueEmailGateway";
import { AppConfig } from "./appConfig";
import { createAuthMiddleware } from "./authMiddleware";
import { DependencyInjector } from "./dependencyInjector";

const logger = createLogger(__filename);

const clock = new RealClock();
const uuidGenerator = new UuidV4Generator();
const sequenceRunner = new ThrottledSequenceRunner(1500, 3);

export const createLegacyAppDependencies = async (
  config: AppConfig,
  injector: DependencyInjector,
) => {
  const repositories = await createRepositories(config, injector);
  const eventBus = createEventBus();
  const generateJwtFn = createGenerateJwtFn(config);
  const generateMagicLinkFn = createGenerateVerificationMagicLink(config);
  const emailFilter = config.skipEmailAllowlist
    ? new AlwaysAllowEmailFilter()
    : new AllowListEmailFilter(config.emailAllowList);

  return {
    useCases: createUseCases(
      config,
      injector,
      repositories,
      generateJwtFn,
      generateMagicLinkFn,
      emailFilter,
    ),
    authChecker: createAuthChecker(config),
    authMiddleware: createAuthMiddleware(config),
    generateJwtFn,
    eventBus,
    eventCrawler: createEventCrawler(
      config,
      injector.outboxRepository,
      eventBus,
    ),
  };
};

export type LegacyAppDependencies = ReturnType<
  typeof createLegacyAppDependencies
> extends Promise<infer T>
  ? T
  : never;

const createNewEvent = makeCreateNewEvent({ clock, uuidGenerator });

// prettier-ignore
type Repositories = ReturnType<typeof createRepositories> extends Promise<infer T>
  ? T
  : never;

const createRepositories = async (
  config: AppConfig,
  injector: DependencyInjector,
) => {
  logger.info({
    emailGateway: config.emailGateway,
    romeGateway: config.romeGateway,
  });

  return {
    formEstablishment:
      config.repositories === "PG"
        ? new PgFormEstablishmentRepository(await injector.pgPool.connect())
        : new InMemoryFormEstablishmentRepository(),

    agency:
      config.repositories === "PG"
        ? new PgAgencyRepository(await injector.pgPool.connect())
        : new InMemoryAgencyRepository(),

    email:
      config.emailGateway === "SENDINBLUE"
        ? SendinblueEmailGateway.create(config.sendinblueApiKey)
        : new InMemoryEmailGateway(),

    rome:
      config.romeGateway === "POLE_EMPLOI"
        ? new PoleEmploiRomeGateway(
            injector.poleEmploiAccessTokenGateway,
            config.poleEmploiClientId,
          )
        : new InMemoryRomeGateway(),
  };
};

export const createAuthChecker = (config: AppConfig) => {
  if (!config.backofficeUsername || !config.backofficePassword) {
    logger.warn("Missing backoffice credentials. Disabling backoffice access.");
    return ALWAYS_REJECT;
  }
  return InMemoryAuthChecker.create(
    config.backofficeUsername,
    config.backofficePassword,
  );
};

export const createGenerateJwtFn = (config: AppConfig): GenerateJwtFn =>
  makeGenerateJwt(config.jwtPrivateKey);

export type GenerateVerificationMagicLink = ReturnType<
  typeof createGenerateVerificationMagicLink
>;
// Visible for testing.
export const createGenerateVerificationMagicLink = (config: AppConfig) => {
  const generateJwt = createGenerateJwtFn(config);

  return (id: ImmersionApplicationId, role: Role, targetRoute: string) => {
    const baseUrl = config.immersionFacileBaseUrl;
    const jwt = generateJwt(createMagicLinkPayload(id, role));
    return `${baseUrl}/${targetRoute}?jwt=${jwt}`;
  };
};

const createUseCases = (
  config: AppConfig,
  injector: DependencyInjector,
  repositories: Repositories,
  generateJwtFn: GenerateJwtFn,
  generateMagicLinkFn: GenerateVerificationMagicLink,
  emailFilter: EmailFilter,
) => {
  return {
    addDemandeImmersion: new AddImmersionApplication(
      injector.immersionApplicationRepository,
      createNewEvent,
      injector.outboxRepository,
      injector.getSiretUseCase,
    ),
    addDemandeImmersionML: new AddImmersionApplicationML(
      injector.immersionApplicationRepository,
      createNewEvent,
      injector.outboxRepository,
      generateJwtFn,
      injector.getSiretUseCase,
    ),
    getDemandeImmersion: new GetImmersionApplication(
      injector.immersionApplicationRepository,
    ),
    listDemandeImmersion: new ListImmersionApplication(
      injector.immersionApplicationRepository,
    ),
    updateDemandeImmersion: new UpdateImmersionApplication(
      createNewEvent,
      injector.outboxRepository,
      injector.immersionApplicationRepository,
      config.featureFlags,
    ),
    validateDemandeImmersion: new ValidateImmersionApplication(
      injector.immersionApplicationRepository,
      createNewEvent,
      injector.outboxRepository,
    ),
    updateImmersionApplicationStatus: new UpdateImmersionApplicationStatus(
      injector.immersionApplicationRepository,
      createNewEvent,
      injector.outboxRepository,
    ),
    generateMagicLink: new GenerateMagicLink(generateJwtFn),

    // immersionOffer
    searchImmersion: new SearchImmersion(injector.immersionOfferRepository),

    addFormEstablishment: new AddFormEstablishment(
      repositories.formEstablishment,
      createNewEvent,
      injector.outboxRepository,
    ),

    tranformFormEstablishmentToSearchData:
      new TransformFormEstablishmentIntoSearchData(
        repositories.formEstablishment,
        injector.immersionOfferRepository,
        injector.addressGateway.getGPSFromAddressAPIAdresse,
        injector.sireneRepository,
        repositories.rome,
        sequenceRunner,
      ),

    // rome
    romeSearch: new RomeSearch(repositories.rome),

    // agencies
    listAgencies: new ListAgencies(repositories.agency),

    // notifications
    confirmToBeneficiaryThatApplicationCorrectlySubmitted:
      new ConfirmToBeneficiaryThatApplicationCorrectlySubmitted(
        emailFilter,
        repositories.email,
      ),
    confirmToMentorThatApplicationCorrectlySubmitted:
      new ConfirmToMentorThatApplicationCorrectlySubmitted(
        emailFilter,
        repositories.email,
      ),
    notifyAllActorsOfFinalApplicationValidation:
      new NotifyAllActorsOfFinalApplicationValidation(
        emailFilter,
        repositories.email,
        repositories.agency,
      ),
    notifyNewApplicationNeedsReview: new NotifyNewApplicationNeedsReview(
      repositories.email,
      repositories.agency,
      generateMagicLinkFn,
    ),
    notifyToTeamApplicationSubmittedByBeneficiary:
      new NotifyToTeamApplicationSubmittedByBeneficiary(
        repositories.email,
        repositories.agency,
        generateMagicLinkFn,
      ),
    notifyBeneficiaryAndEnterpriseThatApplicationIsRejected:
      new NotifyBeneficiaryAndEnterpriseThatApplicationIsRejected(
        emailFilter,
        repositories.email,
        repositories.agency,
      ),
    notifyBeneficiaryAndEnterpriseThatApplicationNeedsModifications:
      new NotifyBeneficiaryAndEnterpriseThatApplicationNeedsModification(
        emailFilter,
        repositories.email,
        repositories.agency,
        generateMagicLinkFn,
      ),
  };
};

const createEventBus = () => new InMemoryEventBus();

const createEventCrawler = (
  config: AppConfig,
  outbox: OutboxRepository,
  eventBus: EventBus,
): EventCrawler =>
  config.eventCrawlerPeriodMs > 0
    ? new RealEventCrawler(eventBus, outbox, config.eventCrawlerPeriodMs)
    : new BasicEventCrawler(eventBus, outbox);
