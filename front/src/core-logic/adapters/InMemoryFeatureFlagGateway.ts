import { FeatureFlagsGateway } from "src/core-logic/ports/FeatureFlagsGateway";
import { FeatureFlags } from "shared/src/featureFlags";

export class InMemoryFeatureFlagGateway implements FeatureFlagsGateway {
  private _featureFlags: FeatureFlags = {
    enableAdminUi: true,
    enableInseeApi: true,
    enablePeConnectApi: true,
  };

  getAll = async () => this._featureFlags;
}
