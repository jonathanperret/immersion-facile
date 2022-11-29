import React from "react";
import { MainWrapper } from "src/../../libs/react-design-system";
import { Route } from "type-route";
import { HeaderFooterLayout } from "../layouts/HeaderFooterLayout";
import { routes } from "../routing/routes";

export const PageStandard = ({
  route,
}: {
  route: Route<typeof routes.pages>;
}) => (
  <HeaderFooterLayout>
    <MainWrapper layout="boxed">{route.params.pageSlug}</MainWrapper>
  </HeaderFooterLayout>
);
