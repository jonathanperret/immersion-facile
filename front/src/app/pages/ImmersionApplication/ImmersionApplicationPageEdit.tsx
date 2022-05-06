import React from "react";
import { HeaderFooterLayout } from "src/app/layouts/HeaderFooterLayout";
import { ImmersionApplicationFormContainerLayout } from "src/app/pages/ImmersionApplication/ImmersionApplicationFormContainerLayout";
import { ImmersionApplicationFormEdit } from "src/app/pages/ImmersionApplication/ImmersionApplicationFormEdit";
import { immersionApplicationInitialValuesFromUrl } from "src/app/pages/ImmersionApplication/immersionApplicationHelpers";

import { routes } from "src/app/routing/routes";
import { ImmersionApplicationDto } from "shared/src/ImmersionApplication/ImmersionApplication.dto";
import { Route } from "type-route";
import { ImmersionApplicationAddForm } from "./ImmersionApplicationAddForm";

export type ImmersionApplicationEditPageRoute = Route<
  typeof routes.immersionApplicationEdit
>;

export interface ImmersionApplicationEditPageProps {
  route: ImmersionApplicationEditPageRoute;
}

export type ImmersionApplicationPresentation = Exclude<
  Partial<ImmersionApplicationDto>,
  "id" | "rejectionJustification" | "legacySchedule"
> & {
  beneficiaryAccepted: boolean;
  enterpriseAccepted: boolean;
};

export const ImmersionApplicationPageEdit = ({
  route,
}: ImmersionApplicationEditPageProps) => (
  <HeaderFooterLayout>
    <ImmersionApplicationFormContainerLayout>
      <ImmersionApplicationFormEdit
        properties={immersionApplicationInitialValuesFromUrl(route)}
        routeParams={route.params}
      />
    </ImmersionApplicationFormContainerLayout>
  </HeaderFooterLayout>
);
