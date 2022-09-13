import { FeatureFlags } from "shared";

export type GetFeatureFlags = () => Promise<FeatureFlags>;
