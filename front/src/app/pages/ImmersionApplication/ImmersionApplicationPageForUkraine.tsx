import React from "react";
import { agencyGateway } from "src/app/config/dependencies";
import { ImmersionApplicationAddFormUkraine } from "src/app/pages/ImmersionApplication/components/ImmersionApplicationAddFormUkraine";
import { immersionApplicationInitialValuesFromUrl } from "src/app/pages/ImmersionApplication/immersionApplication.hooks";
import { getAgencyIdBehavior$ } from "src/app/pages/ImmersionApplication/ImmersionApplication.presenter";
import { ImmersionApplicationFormContainerLayout } from "src/app/pages/ImmersionApplication/layout/ImmersionApplicationFormContainerLayout";
import { routes } from "src/app/routing/routes";
import { AgencyId } from "src/shared/agency/agency.dto";
import { useObservable } from "src/useObservable";
import { Route } from "type-route";

export type ImmersionApplicationUkrainePageRoute = Route<
  typeof routes.immersionApplicationForUkraine
>;

interface ImmersionApplicationPageForUkraineProps {
  route: ImmersionApplicationUkrainePageRoute;
}

export const ImmersionApplicationPageForUkraine = ({
  route,
}: ImmersionApplicationPageForUkraineProps) => {
  const agencyId = useObservable<AgencyId | false>(
    getAgencyIdBehavior$(agencyGateway),
    false,
  );

  return (
    <ImmersionApplicationFormContainerLayout>
      {agencyId ? (
        <ImmersionApplicationAddFormUkraine
          properties={{
            ...immersionApplicationInitialValuesFromUrl(route),
            agencyId,
          }}
        />
      ) : (
        <ImmersionFacileAgencyNotActive />
      )}
    </ImmersionApplicationFormContainerLayout>
  );
};

const ImmersionFacileAgencyNotActive = () => (
  <div role="alert" className="fr-alert fr-alert--info w-5/6 m-auto mt-10">
    <p className="fr-alert__title">
      L'agence 'Immersion Facile' n'est pas active.
    </p>
    <p>
      Veuillez contacter l'équipe immersion facile{" "}
      <a>contact@immersion-facile@beta.gouv.fr</a> pour le support utilisateur.
    </p>
  </div>
);
