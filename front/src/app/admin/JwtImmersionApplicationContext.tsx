import React, { createContext } from "react";
import { ErrorDisplay, useApiCall } from "src/app/admin/ApiDataContainer";
import { immersionApplicationGateway } from "src/app/dependencies";
import { ImmersionApplicationDto } from "src/shared/ImmersionApplicationDto";

export const JwtImmersionApplicationContext =
  createContext<ImmersionApplicationDto | null>(null);

type JwtImmersionApplicationProviderProps = {
  children: React.ReactNode;
  jwt: string;
};

export const JwtImmersionApplicationProvider = ({
  children,
  jwt,
}: JwtImmersionApplicationProviderProps): React.ReactElement => {
  const { data, error } = useApiCall(() =>
    immersionApplicationGateway.getML(jwt),
  );

  if (error) return <ErrorDisplay error={error} jwt={jwt} />;
  return (
    <JwtImmersionApplicationContext.Provider value={data}>
      {children}
    </JwtImmersionApplicationContext.Provider>
  );
};
