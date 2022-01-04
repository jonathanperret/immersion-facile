import React, { createContext } from "react";
import { ErrorDisplay, useApiCall } from "src/app/admin/ApiDataContainer";
import { immersionApplicationGateway } from "src/app/dependencies";
import { AgencyId } from "src/shared/agencies";
import {
  ApplicationStatus,
  ImmersionApplicationDto,
} from "src/shared/ImmersionApplicationDto";

export const AllImmersionApplicationsContext = createContext<
  ImmersionApplicationDto[]
>([]);

type AllImmersionApplicationsProviderProps = {
  statusFilter?: ApplicationStatus;
  agency?: AgencyId;
  children: React.ReactNode;
  jwt?: string;
};

export const AllImmersionApplicationsProvider = ({
  children,
  jwt,
  agency,
  statusFilter,
}: AllImmersionApplicationsProviderProps): React.ReactElement => {
  const { data, error } = useApiCall(() =>
    immersionApplicationGateway.getAll(agency, statusFilter),
  );

  if (error) return <ErrorDisplay error={error} jwt={jwt} />;
  return (
    <AllImmersionApplicationsContext.Provider value={data ?? []}>
      {children}
    </AllImmersionApplicationsContext.Provider>
  );
};
