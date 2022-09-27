import { useEffect } from "react";
import { ConventionInUrl } from "src/app/routing/route-params";
import { routes, useRoute } from "src/app/routing/routes";

export const useConventionWatchValuesInUrl = (
  watchedValues: ConventionInUrl,
) => {
  const {
    schedule,
    immersionAppellation,
    ...watchedValuesExceptScheduleAndAppellation
  } = watchedValues;

  const route = useRoute();
  useEffect(() => {
    if (route.name !== "conventionImmersion" || !!route.params.jwt) return;
    routes.conventionImmersion(watchedValues).replace();
  }, [
    ...Object.values(watchedValuesExceptScheduleAndAppellation),
    JSON.stringify(schedule),
    JSON.stringify(immersionAppellation),
  ]);
};
