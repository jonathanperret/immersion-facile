import { Pool } from "pg";
import { makeCreateNewEvent } from "../../domain/core/eventBus/EventBus";
import { OutboxRepository } from "../../domain/core/ports/OutboxRepository";
import { ImmersionApplicationRepository } from "../../domain/immersionApplication/ports/ImmersionApplicationRepository";
import { AddImmersionApplication } from "../../domain/immersionApplication/useCases/AddImmersionApplication";
import { EstablishmentsGateway } from "../../domain/immersionOffer/ports/EstablishmentsGateway";
import { SireneRepository } from "../../domain/sirene/ports/SireneRepository";
import { GetSiret } from "../../domain/sirene/useCases/GetSiret";
import { createLogger } from "../../utils/logger";
import { CachingAccessTokenGateway } from "../secondary/core/CachingAccessTokenGateway";
import { RealClock } from "../secondary/core/ClockImplementations";
import { InMemoryOutboxRepository } from "../secondary/core/InMemoryOutboxRepository";
import { UuidV4Generator } from "../secondary/core/UuidGeneratorImplementations";
import { HttpsSireneRepository } from "../secondary/HttpsSireneRepository";
import { APIAdresseGateway } from "../secondary/immersionOffer/APIAdresseGateway";
import { InMemoryImmersionOfferRepository } from "../secondary/immersionOffer/InMemoryImmersonOfferRepository";
import { LaBonneBoiteGateway } from "../secondary/immersionOffer/LaBonneBoiteGateway";
import { LaPlateFormeDeLInclusionGateway } from "../secondary/immersionOffer/LaPlateFormeDeLInclusionGateway";
import { PoleEmploiAccessTokenGateway } from "../secondary/immersionOffer/PoleEmploiAccessTokenGateway";
import { InMemoryImmersionApplicationRepository } from "../secondary/InMemoryImmersionApplicationRepository";
import { InMemorySireneRepository } from "../secondary/InMemorySireneRepository";
import { PgImmersionApplicationRepository } from "../secondary/pg/PgImmersionApplicationRepository";
import { PgImmersionOfferRepository } from "../secondary/pg/PgImmersionOfferRepository";
import { PgOutboxRepository } from "../secondary/pg/PgOutboxRepository";
import { AccessTokenGateway } from "./../../domain/core/ports/AccessTokenGateway";
import { UpdateEstablishmentsAndImmersionOffersFromLastSearches } from "./../../domain/immersionOffer/useCases/UpdateEstablishmentsAndImmersionOffersFromLastSearches";
import { AppConfig } from "./appConfig";

const logger = createLogger(__filename);

export class DependencyInjector {
  private readonly dependencyCache: any = {};

  public constructor(private readonly config: AppConfig) {}

  // Use Cases

  public get addImmersionApplicationUseCase(): AddImmersionApplication {
    return this.getOrCreate(
      "addImmersionApplicationUseCase",
      () =>
        new AddImmersionApplication(
          this.immersionApplicationRepository,
          this.createNewEvent,
          this.outboxRepository,
          this.getSiretUseCase,
        ),
    );
  }

  public get getSiretUseCase(): GetSiret {
    return this.getOrCreate(
      "getSiretUseCase",
      () => new GetSiret(this.sireneRepository),
    );
  }

  public get updateEstablishmentsAndImmersionOffersFromLastSearchesUseCase(): UpdateEstablishmentsAndImmersionOffersFromLastSearches {
    return this.getOrCreate(
      "updateEstablishmentsAndImmersionOffersFromLastSearchesUseCase",
      () =>
        new UpdateEstablishmentsAndImmersionOffersFromLastSearches(
          this.laBonneBoiteGateway,
          this.laPlateFormeDeLInclusionGateway,
          this.addressGateway.getGPSFromAddressAPIAdresse,
          this.sireneRepository,
          this.immersionOfferRepository,
        ),
    );
  }

  // Repositories

  public get immersionApplicationRepository(): ImmersionApplicationRepository {
    return this.getOrCreate("immersionApplicationRepository", () => {
      logger.info({ immersionApplicationRepository: this.config.repositories });
      return this.config.repositories === "PG"
        ? new PgImmersionApplicationRepository(this.pgPool)
        : new InMemoryImmersionApplicationRepository();
    });
  }

  public get immersionOfferRepository() {
    return this.getOrCreate("immersionOfferRepository", () => {
      logger.info({ immersionOfferRepository: this.config.repositories });
      return this.config.repositories === "PG"
        ? new PgImmersionOfferRepository(this.pgPool)
        : new InMemoryImmersionOfferRepository();
    });
  }

  public get outboxRepository(): OutboxRepository {
    return this.getOrCreate("outboxRepository", () => {
      logger.info({ outboxRepository: this.config.repositories });
      return this.config.repositories === "PG"
        ? new PgOutboxRepository(this.pgPool)
        : new InMemoryOutboxRepository();
    });
  }

  public get sireneRepository(): SireneRepository {
    return this.getOrCreate("sireneRepository", () => {
      logger.info({ sireneRepository: this.config.sireneRepository });
      return this.config.sireneRepository === "HTTPS"
        ? HttpsSireneRepository.create(
            this.config.sireneHttpsConfig,
            this.clock,
          )
        : new InMemorySireneRepository();
    });
  }

  // Gateways

  public get addressGateway(): APIAdresseGateway {
    return this.getOrCreate("addressGateway", () => new APIAdresseGateway());
  }

  public get laBonneBoiteGateway() {
    return this.getOrCreate(
      "laBonneBoiteGateway",
      () =>
        new LaBonneBoiteGateway(
          this.poleEmploiAccessTokenGateway,
          this.config.poleEmploiClientId,
        ),
    );
  }

  public get laPlateFormeDeLInclusionGateway(): EstablishmentsGateway {
    return this.getOrCreate(
      "laPlateFormeDeLInclusionGateway",
      () => new LaPlateFormeDeLInclusionGateway(),
    );
  }

  public get poleEmploiAccessTokenGateway(): AccessTokenGateway {
    return this.getOrCreate(
      "poleEmploiAccessTokenGateway",
      () =>
        new CachingAccessTokenGateway(
          new PoleEmploiAccessTokenGateway(
            this.config.poleEmploiAccessTokenConfig,
          ),
        ),
    );
  }

  // Event Handling

  public get createNewEvent() {
    return this.getOrCreate("createNewEvent", () =>
      makeCreateNewEvent({
        uuidGenerator: this.uuidGenerator,
        clock: this.clock,
      }),
    );
  }

  // Internal dependencies

  private get clock() {
    return this.getOrCreate("clock", () => new RealClock());
  }

  private get uuidGenerator() {
    return this.getOrCreate("uuidGenerator", () => new UuidV4Generator());
  }

  public get pgPool(): Pool {
    return this.getOrCreate("pgPool", () => {
      if (this.config.repositories !== "PG")
        throw new Error(
          `No pool provided if repositories are not PG, received ${this.config.repositories}`,
        );
      return new Pool({ connectionString: this.config.pgImmersionDbUrl });
    });
  }

  // Helpers

  private getOrCreate<T>(name: string, factoryFn: () => T): T {
    if (!this.dependencyCache[name]) {
      this.dependencyCache[name] = factoryFn();
    }
    return this.dependencyCache[name];
  }
}
