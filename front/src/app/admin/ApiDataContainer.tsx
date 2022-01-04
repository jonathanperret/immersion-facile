import React, { useEffect, useState } from "react";
import { RenewExpiredLinkContent } from "src/helpers/RenewExpiredLink";

// Inspired by https://itnext.io/centralizing-api-error-handling-in-react-apps-810b2be1d39d
type CallApi<T> = () => Promise<T>;

export function useApiCall<T>(callApi: CallApi<T>) {
  const [error, setError] = useState<any | null>(null);
  const [apiData, setApiData] = useState<T | null>(null);

  useEffect(() => {
    callApi()
      .then((apiData) => {
        console.log(apiData);
        setApiData(apiData);
      })
      .catch((e) => {
        setError(e);
      });
  }, [callApi]);

  return { data: apiData, error };
}

interface ErrorDisplayProps {
  error: any;
  jwt?: string;
}

export const ErrorDisplay = ({ error, jwt }: ErrorDisplayProps) => {
  if (error.response) {
    if (error.response.status === 403) {
      if (jwt && error.response.data.needsNewMagicLink) {
        const originalURL = location.href.replaceAll(jwt, "%jwt%");
        return (
          <RenewExpiredLinkContent expiredJwt={jwt} originalURL={originalURL} />
        );
      }
      return <h1>403 Accès refusé</h1>;
    }

    if (error.response.status === 404) {
      return <h1>404 Page non trouvé</h1>;
    }
  }
  return <h1>{JSON.stringify(error)}</h1>;
};
