import React from "react";
import { routes } from "src/app/routes/routes";
import { Route } from "type-route";
import { ConventionForm } from "./ConventionForm";
import { ConventionFormContainerLayout } from "./ConventionFormContainerLayout";
import { conventionInitialValuesFromUrl } from "./conventionHelpers";

export type ConventionMiniStagePageRoute = Route<
  typeof routes.conventionMiniStage
>;

interface ConventionMiniStagePageProps {
  route: ConventionMiniStagePageRoute;
}

export const ConventionMiniStagePage = ({
  route,
}: ConventionMiniStagePageProps) => (
  <ConventionFormContainerLayout>
    <ConventionForm
      properties={conventionInitialValuesFromUrl({
        route,
        internshipKind: "mini-stage-cci",
      })}
      routeParams={route.params}
    />
  </ConventionFormContainerLayout>
);
