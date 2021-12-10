import { AppConfig } from "../../adapters/primary/appConfig";
import { RealClock } from "../../adapters/secondary/core/ClockImplementations";
import { HttpsSirenGateway } from "../../adapters/secondary/HttpsSirenGateway";
import { SirenGateway } from "../../domain/sirene/ports/SirenGateway";
import { PoleEmploiRomeGateway } from "../../adapters/secondary/immersionOffer/PoleEmploiRomeGateway";
import { PoleEmploiAccessTokenGateway } from "../../adapters/secondary/immersionOffer/PoleEmploiAccessTokenGateway";

describe("PoleEmploiRomeGateway", () => {
  let poleEmploiRomeGateway: PoleEmploiRomeGateway;

  beforeEach(() => {
    const config = AppConfig.createFromEnv();
    const accessTokenGateway = new PoleEmploiAccessTokenGateway(
      config.poleEmploiAccessTokenConfig,
    );
    poleEmploiRomeGateway = new PoleEmploiRomeGateway(
      accessTokenGateway,
      config.poleEmploiClientId,
    );
  });

  test("returns open establishments", async () => {
    const response = await poleEmploiRomeGateway.appellationToCodeMetier(
      "11158",
    );
    expect(response).toBe("B1101");
  });
});
