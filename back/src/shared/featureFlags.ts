import { makeGetBooleanVariable, ProcessEnv } from "./envHelpers";

export const getFeatureFlags = (processEnv: ProcessEnv) => {
  const getBooleanVariable = makeGetBooleanVariable(processEnv);

  return {
    enableAdminUi: getBooleanVariable("ENABLE_ADMIN_UI"),
    enableEnterpriseSignature: getBooleanVariable("ENABLE_ENTERPRISE_SIGNATURE"),
  };
};

export type FeatureFlags = Partial<ReturnType<typeof getFeatureFlags>>;
