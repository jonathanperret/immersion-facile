import { Subject } from "rxjs";
import {
  AbsoluteUrl,
  AdminToken,
  FeatureFlags,
  SetFeatureFlagParams,
} from "shared";
import { TechnicalGateway } from "src/core-logic/ports/TechnicalGateway";

export class TestTechnicalGateway implements TechnicalGateway {
  getAllFeatureFlags = () => this.featureFlags$;
  setFeatureFlag = (params: SetFeatureFlagParams, _adminToken: AdminToken) => {
    this.setFeatureFlagLastCalledWith = params;
    return this.setFeatureFlagResponse$;
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  uploadLogo = async (file: File): Promise<AbsoluteUrl> => {
    // eslint-disable-next-line no-console
    console.log("file uploaded : ", file);
    return `http://${file.name}-url`;
  };

  // test purposes only
  public featureFlags$ = new Subject<FeatureFlags>();
  public setFeatureFlagResponse$ = new Subject<void>();
  public setFeatureFlagLastCalledWith: SetFeatureFlagParams | undefined =
    undefined;
}
