import { createLogger } from "../../utils/logger";
import { AppConfig } from "./appConfig";
import { DependencyInjector } from "./dependencyInjector";

const logger = createLogger(__filename);

const main = async () => {
  logger.info(`Executing pipeline: establishment-backfill`);

  const config = AppConfig.createFromEnv();
  const injector = new DependencyInjector(config);

  await injector.updateEstablishmentsAndImmersionOffersFromLastSearchesUseCase.execute();
};

main();
