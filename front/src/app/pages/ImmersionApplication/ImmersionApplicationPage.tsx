import React from "react";
import { HeaderFooterLayout } from "src/app/layouts/HeaderFooterLayout";
import { ImmersionApplicationAddForm } from "src/app/pages/ImmersionApplication/components/ImmersionApplicationAddForm";
import { immersionApplicationInitialValuesFromUrl } from "src/app/pages/ImmersionApplication/immersionApplication.hooks";
import { ImmersionApplicationFormContainerLayout } from "src/app/pages/ImmersionApplication/layout/ImmersionApplicationFormContainerLayout";

import { routes } from "src/app/routing/routes";
import { ImmersionApplicationDto } from "src/shared/ImmersionApplication/ImmersionApplication.dto";
import { Route } from "type-route";

export type ImmersionApplicationPageRoute = Route<
  typeof routes.immersionApplication
>;

export interface ImmersionApplicationPageProps {
  route: ImmersionApplicationPageRoute;
}

export type ImmersionApplicationPresentation = Exclude<
  Partial<ImmersionApplicationDto>,
  "id" | "rejectionJustification" | "legacySchedule"
> & {
  beneficiaryAccepted: boolean;
  enterpriseAccepted: boolean;
};

export const ImmersionApplicationPage = ({
  route,
}: ImmersionApplicationPageProps) => (
  <HeaderFooterLayout>
    <ImmersionApplicationFormContainerLayout>
      <ImmersionApplicationAddForm
        properties={immersionApplicationInitialValuesFromUrl(route)}
      />
    </ImmersionApplicationFormContainerLayout>
  </HeaderFooterLayout>
);
