import { FeatureFlags } from "shared/src/featureFlags";

export interface FeatureFlagsGateway {
  getAll: () => Promise<FeatureFlags>;
}
