import bodyParser from "body-parser";
import express, { Express, Router } from "express";
import PinoHttp from "pino-http";
import {
  immersionApplicationSchema,
  listImmersionApplicationRequestDtoSchema,
} from "../../shared/ImmersionApplicationDto";
import { romeSearchRequestSchema } from "../../shared/rome";
import {
  agenciesRoute,
  generateMagicLinkRoute,
  immersionApplicationsRoute,
  immersionOffersRoute,
  romeRoute,
  searchImmersionRoute,
  siretRoute,
  validateDemandeRoute,
} from "../../shared/routes";
import { searchImmersionRequestSchema } from "../../shared/SearchImmersionDto";
import { getSiretRequestSchema } from "../../shared/siret";
import { createLogger } from "../../utils/logger";
import { AppConfig } from "./appConfig";
import { createLegacyAppDependencies } from "./config";
import { DependencyInjector } from "./dependencyInjector";
import { callUseCase } from "./helpers/callUseCase";
import { sendHttpResponse } from "./helpers/sendHttpResponse";
import { createMagicLinkRouter } from "./MagicLinkRouter";
import { subscribeToEvents } from "./subscribeToEvents";
import expressPrometheusMiddleware = require("express-prometheus-middleware");

const logger = createLogger(__filename);

const metrics = expressPrometheusMiddleware({
  metricsPath: "/__metrics",
  collectDefaultMetrics: true,
});

export const createApp = async (config: AppConfig): Promise<Express> => {
  const app = express();
  const router = Router();
  app.use(PinoHttp({ logger }));

  app.use(metrics);

  app.use(bodyParser.json());

  router.route("/").get((req, res) => {
    return res.json({ message: "Hello World !" });
  });

  const injector = new DependencyInjector(config);
  const legacyDependencies = await createLegacyAppDependencies(
    config,
    injector,
  );

  router
    .route(`/${immersionApplicationsRoute}`)
    .post(async (req, res) =>
      sendHttpResponse(req, res, () =>
        injector.addImmersionApplicationUseCase.execute(req.body),
      ),
    )
    .get(async (req, res) => {
      sendHttpResponse(
        req,
        res,
        () =>
          callUseCase({
            useCase: legacyDependencies.useCases.listDemandeImmersion,
            validationSchema: listImmersionApplicationRequestDtoSchema,
            useCaseParams: req.query,
          }),
        legacyDependencies.authChecker,
      );
    });

  router.route(`/${validateDemandeRoute}/:id`).get(async (req, res) => {
    sendHttpResponse(
      req,
      res,
      () =>
        legacyDependencies.useCases.validateDemandeImmersion.execute(
          req.params.id,
        ),
      legacyDependencies.authChecker,
    );
  });

  router.route(`/admin/${generateMagicLinkRoute}`).get(async (req, res) => {
    sendHttpResponse(
      req,
      res,
      () =>
        legacyDependencies.useCases.generateMagicLink.execute({
          applicationId: req.query.id,
          role: req.query.role,
        } as any),
      legacyDependencies.authChecker,
    );
  });

  const demandeImmersionRouter = Router({ mergeParams: true });
  router.use(`/admin`, demandeImmersionRouter);

  demandeImmersionRouter
    .route(`/${immersionApplicationsRoute}/:id`)
    .get(async (req, res) =>
      sendHttpResponse(
        req,
        res,
        () =>
          legacyDependencies.useCases.getDemandeImmersion.execute(req.params),
        legacyDependencies.authChecker,
      ),
    );

  router
    .route(`/${immersionOffersRoute}`)
    .post(async (req, res) =>
      sendHttpResponse(req, res, () =>
        legacyDependencies.useCases.addFormEstablishment.execute(req.body),
      ),
    );

  router.route(`/${searchImmersionRoute}`).post(async (req, res) =>
    sendHttpResponse(req, res, () =>
      callUseCase({
        useCase: legacyDependencies.useCases.searchImmersion,
        validationSchema: searchImmersionRequestSchema,
        useCaseParams: req.body,
      }),
    ),
  );

  router.route(`/${romeRoute}`).get(async (req, res) => {
    sendHttpResponse(req, res, async () => {
      logger.info(req);
      return callUseCase({
        useCase: legacyDependencies.useCases.romeSearch,
        validationSchema: romeSearchRequestSchema,
        useCaseParams: req.query.searchText,
      });
    });
  });

  router.route(`/${siretRoute}/:siret`).get(async (req, res) =>
    sendHttpResponse(req, res, async () =>
      callUseCase({
        useCase: injector.getSiretUseCase,
        validationSchema: getSiretRequestSchema,
        useCaseParams: req.params,
      }),
    ),
  );

  router.route(`/${immersionApplicationsRoute}`).post(async (req, res) =>
    sendHttpResponse(req, res, () =>
      callUseCase({
        useCase: legacyDependencies.useCases.addDemandeImmersionML,
        validationSchema: immersionApplicationSchema,
        useCaseParams: req.body,
      }),
    ),
  );

  router
    .route(`/${agenciesRoute}`)
    .get(async (req, res) =>
      sendHttpResponse(req, res, () =>
        legacyDependencies.useCases.listAgencies.execute(),
      ),
    );

  app.use(router);
  app.use("/auth", createMagicLinkRouter(legacyDependencies));

  subscribeToEvents(legacyDependencies);

  legacyDependencies.eventCrawler.startCrawler();

  return app;
};
