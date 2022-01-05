import { random, sleep } from "../../shared/utils";
import { CachingAccessTokenGateway } from "../secondary/core/CachingAccessTokenGateway";
import { RealClock } from "../secondary/core/ClockImplementations";
import {
  defaultMaxBackoffPeriodMs,
  defaultRetryDeadlineMs,
  ExponentialBackoffRetryStrategy,
} from "../secondary/core/ExponentialBackoffRetryStrategy";
import { QpsRateLimiter } from "../secondary/core/QpsRateLimiter";
import { HttpLaBonneBoiteAPI } from "../secondary/immersionOffer/HttpLaBonneBoiteAPI";
import { PoleEmploiAccessTokenGateway } from "../secondary/immersionOffer/PoleEmploiAccessTokenGateway";
import { AppConfig } from "./appConfig";

const MAX_QPS_LA_BONNE_BOITE_GATEWAY = 1;

export const getHttpLaBonneBoiteAPI = (config: AppConfig, clock: RealClock) => {
  const poleEmploiAccessTokenGateway = new CachingAccessTokenGateway(
    new PoleEmploiAccessTokenGateway(config.poleEmploiAccessTokenConfig),
  );

  return new HttpLaBonneBoiteAPI(
    poleEmploiAccessTokenGateway,
    config.poleEmploiClientId,
    new QpsRateLimiter(MAX_QPS_LA_BONNE_BOITE_GATEWAY, clock, sleep),
    new ExponentialBackoffRetryStrategy(
      defaultMaxBackoffPeriodMs,
      defaultRetryDeadlineMs,
      clock,
      sleep,
      random,
    ),
  );
};
