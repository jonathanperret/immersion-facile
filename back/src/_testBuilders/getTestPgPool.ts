import { AppConfig } from "../adapters/primary/appConfig";
import { DependencyInjector } from "./../adapters/primary/dependencyInjector";
import { AppConfigBuilder } from "./AppConfigBuilder";

export const getTestPgPool = () => {
  const configFromEnv = AppConfig.createFromEnv();

  const config = new AppConfigBuilder()
    .withRepositories("PG")
    .withPgUrl(configFromEnv.pgImmersionDbUrl)
    .build();

  return new DependencyInjector(config).pgPool;
};
