import { PoolClient } from "pg";
import {
  UnitOfWork,
  UnitOfWorkPerformer,
} from "../../../domain/core/ports/UnitOfWork";
import { InMemoryOutboxQueries } from "../../secondary/core/InMemoryOutboxQueries";
import { InMemoryOutboxRepository } from "../../secondary/core/InMemoryOutboxRepository";
import { InMemoryDiscussionAggregateRepository } from "../../secondary/immersionOffer/InMemoryDiscussionAggregateRepository";
import { InMemoryEstablishmentAggregateRepository } from "../../secondary/immersionOffer/InMemoryEstablishmentAggregateRepository";
import { InMemoryLaBonneBoiteRequestRepository } from "../../secondary/immersionOffer/InMemoryLaBonneBoiteRequestRepository";
import { InMemorySearchMadeRepository } from "../../secondary/immersionOffer/InMemorySearchMadeRepository";
import { InMemoryAgencyRepository } from "../../secondary/InMemoryAgencyRepository";
import { InMemoryAuthenticatedUserRepository } from "../../secondary/InMemoryAuthenticatedUserRepository";
import { InMemoryConventionPoleEmploiAdvisorRepository } from "../../secondary/InMemoryConventionPoleEmploiAdvisorRepository";
import { InMemoryConventionQueries } from "../../secondary/InMemoryConventionQueries";
import { InMemoryConventionRepository } from "../../secondary/InMemoryConventionRepository";
import { InMemoryExportQueries } from "../../secondary/InMemoryExportQueries";
import { InMemoryFeatureFlagRepository } from "../../secondary/InMemoryFeatureFlagRepository";
import { InMemoryFormEstablishmentRepository } from "../../secondary/InMemoryFormEstablishmentRepository";
import { InMemoryImmersionAssessmentRepository } from "../../secondary/InMemoryImmersionAssessmentRepository";
import { InMemoryOngoingOAuthRepository } from "../../secondary/InMemoryOngoingOAuthRepository";
import { InMemoryRomeRepository } from "../../secondary/InMemoryRomeRepository";
import { InMemoryUowPerformer } from "../../secondary/InMemoryUowPerformer";
import { PgAgencyRepository } from "../../secondary/pg/PgAgencyRepository";
import { PgAuthenticatedUserRepository } from "../../secondary/pg/PgAuthenticatedUserRepository";
import { PgConventionPoleEmploiAdvisorRepository } from "../../secondary/pg/PgConventionPoleEmploiAdvisorRepository";
import { PgConventionQueries } from "../../secondary/pg/PgConventionQueries";
import { PgConventionRepository } from "../../secondary/pg/PgConventionRepository";
import { PgDiscussionAggregateRepository } from "../../secondary/pg/PgDiscussionAggregateRepository";
import { PgEstablishmentAggregateRepository } from "../../secondary/pg/PgEstablishmentAggregateRepository";
import { PgExportQueries } from "../../secondary/pg/PgExportQueries";
import { PgFeatureFlagRepository } from "../../secondary/pg/PgFeatureFlagRepository";
import { PgFormEstablishmentRepository } from "../../secondary/pg/PgFormEstablishmentRepository";
import { PgImmersionAssessmentRepository } from "../../secondary/pg/PgImmersionAssessmentRepository";
import { PgLaBonneBoiteRequestRepository } from "../../secondary/pg/PgLaBonneBoiteRequestRepository";
import { PgOngoingOAuthRepository } from "../../secondary/pg/PgOngoingOAuthRepository";
import { PgOutboxQueries } from "../../secondary/pg/PgOutboxQueries";
import { PgOutboxRepository } from "../../secondary/pg/PgOutboxRepository";
import { PgPostalCodeDepartmentRegionQueries } from "../../secondary/pg/PgPostalCodeDepartmentRegionQueries";
import { PgRomeRepository } from "../../secondary/pg/PgRomeRepository";
import { PgSearchMadeRepository } from "../../secondary/pg/PgSearchMadeRepository";
import { PgUowPerformer } from "../../secondary/pg/PgUowPerformer";
import { stubPostalCodeDepartmentRegionQueries } from "../../secondary/StubPostalCodeDepartmentRegionQueries";
import { AppConfig } from "./appConfig";
import { GetPgPoolFn } from "./createGateways";
import { InMemoryApiConsumerRepository } from "../../secondary/InMemoryApiConsumerRepository";
import { PgApiConsumerRepository } from "../../secondary/pg/PgApiConsumerRepository";

export type InMemoryUnitOfWork = ReturnType<typeof createInMemoryUow>;
export const createInMemoryUow = () => {
  const outboxRepository = new InMemoryOutboxRepository();
  const outboxQueries = new InMemoryOutboxQueries(outboxRepository);
  const conventionRepository = new InMemoryConventionRepository();

  return {
    agencyRepository: new InMemoryAgencyRepository(),
    apiConsumerRepository: new InMemoryApiConsumerRepository(),
    authenticatedUserRepository: new InMemoryAuthenticatedUserRepository(),
    conventionQueries: new InMemoryConventionQueries(
      conventionRepository,
      outboxRepository,
    ),
    conventionRepository,
    conventionPoleEmploiAdvisorRepository:
      new InMemoryConventionPoleEmploiAdvisorRepository(),
    discussionAggregateRepository: new InMemoryDiscussionAggregateRepository(),
    establishmentAggregateRepository:
      new InMemoryEstablishmentAggregateRepository(),
    exportQueries: new InMemoryExportQueries(),
    featureFlagRepository: new InMemoryFeatureFlagRepository(),
    formEstablishmentRepository: new InMemoryFormEstablishmentRepository(),
    immersionAssessmentRepository: new InMemoryImmersionAssessmentRepository(),
    laBonneBoiteRequestRepository: new InMemoryLaBonneBoiteRequestRepository(),
    ongoingOAuthRepository: new InMemoryOngoingOAuthRepository(),
    outboxRepository,
    outboxQueries,
    postalCodeDepartmentRegionQueries: stubPostalCodeDepartmentRegionQueries,
    romeRepository: new InMemoryRomeRepository(),
    searchMadeRepository: new InMemorySearchMadeRepository(),
  };
};

// for typechecking only
const _isAssignable = (inMemoryUow: InMemoryUnitOfWork): UnitOfWork =>
  inMemoryUow;

export const createPgUow = (client: PoolClient): UnitOfWork => ({
  agencyRepository: new PgAgencyRepository(client),
  apiConsumerRepository: new PgApiConsumerRepository(client),
  authenticatedUserRepository: new PgAuthenticatedUserRepository(client),
  conventionRepository: new PgConventionRepository(client),
  conventionQueries: new PgConventionQueries(client),
  conventionPoleEmploiAdvisorRepository:
    new PgConventionPoleEmploiAdvisorRepository(client),
  discussionAggregateRepository: new PgDiscussionAggregateRepository(client),
  establishmentAggregateRepository: new PgEstablishmentAggregateRepository(
    client,
  ),
  exportQueries: new PgExportQueries(client),
  featureFlagRepository: new PgFeatureFlagRepository(client),
  formEstablishmentRepository: new PgFormEstablishmentRepository(client),
  immersionAssessmentRepository: new PgImmersionAssessmentRepository(client),
  laBonneBoiteRequestRepository: new PgLaBonneBoiteRequestRepository(client),
  ongoingOAuthRepository: new PgOngoingOAuthRepository(client),
  outboxRepository: new PgOutboxRepository(client),
  outboxQueries: new PgOutboxQueries(client),
  postalCodeDepartmentRegionQueries: new PgPostalCodeDepartmentRegionQueries(
    client,
  ),
  romeRepository: new PgRomeRepository(client),
  searchMadeRepository: new PgSearchMadeRepository(client),
});

export const createUowPerformer = (
  config: AppConfig,
  getPgPoolFn: GetPgPoolFn,
): { uowPerformer: UnitOfWorkPerformer; inMemoryUow?: InMemoryUnitOfWork } =>
  config.repositories === "PG"
    ? { uowPerformer: new PgUowPerformer(getPgPoolFn(), createPgUow) }
    : makeInMemoryUowPerformer(createInMemoryUow());

const makeInMemoryUowPerformer = (inMemoryUow: InMemoryUnitOfWork) => ({
  inMemoryUow,
  uowPerformer: new InMemoryUowPerformer(inMemoryUow),
});
