import { FeatureFlag, FeatureFlags } from "shared";
import { FeatureFlagRepository } from "../../domain/core/ports/FeatureFlagRepository";

const defaultFlags: FeatureFlags = {
  enableAdminUi: true,
  enableInseeApi: true,
  enablePeConnectApi: true,
  enableLogoUpload: false,
  enablePeConventionBroadcast: true,
  enableTemporaryOperation: false,
};

export class InMemoryFeatureFlagRepository implements FeatureFlagRepository {
  private readonly featureFlags: FeatureFlags;

  constructor(featureFlags: Partial<FeatureFlags> = {}) {
    this.featureFlags = { ...defaultFlags, ...featureFlags };
  }

  async getAll(): Promise<FeatureFlags> {
    return this.featureFlags;
  }

  async set(params: { flagName: FeatureFlag; value: boolean }): Promise<void> {
    this.featureFlags[params.flagName] = params.value;
  }
}
