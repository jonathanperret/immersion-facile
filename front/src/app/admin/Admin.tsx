import React, { useContext, useEffect, useState } from "react";
import {
  AllImmersionApplicationsContext,
  AllImmersionApplicationsProvider,
} from "src/app/admin/AllImmersionApplicationsContext";
import { routes, useRoute } from "src/app/routes";
import { FormAccordion } from "src/components/admin/FormAccordion";
import { FormMagicLinks } from "src/components/admin/FormMagicLinks";
import { MarianneHeader } from "src/components/MarianneHeader";
import { AgencyId } from "src/shared/agencies";
import { Route } from "type-route";
import "./Admin.css";
import {
  ApplicationStatus,
  validApplicationStatus,
} from "src/shared/ImmersionApplicationDto";
import { ArrayDropdown } from "src/components/admin/ArrayDropdown";

interface AdminProps {
  route: Route<typeof routes.admin> | Route<typeof routes.agencyAdmin>;
}

export const Admin = ({ route }: AdminProps) => {
  const [statusFilter, setStatusFilter] = useState<
    ApplicationStatus | undefined
  >();

  let agency =
    "agencyId" in route.params
      ? (route.params.agencyId as AgencyId)
      : undefined;

  const filterChanged = (selectedIndex: number) => {
    setStatusFilter(validApplicationStatus[selectedIndex]);
  };

  return (
    <>
      <MarianneHeader />

      <div className="fr-grid-row fr-grid-row--center fr-grid-row--gutters">
        <div className="fr-col-lg-8 fr-p-2w" style={{ width: "95%" }}>
          <AllImmersionApplicationsProvider
            agency={agency}
            statusFilter={statusFilter}
          >
            <h2>Backoffice</h2>
            <div className="fr-text">
              Bienvenue dans le backoffice ! <br />
              Veuillez autentifier pour acceder aux donnes. <br />
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "30px",
                  backgroundColor: "#E5E5F4",
                  padding: "10px",
                }}
              >
                <p>filtres</p>
                <ArrayDropdown
                  labels={validApplicationStatus}
                  didPick={filterChanged}
                />
              </div>
            </div>

            <ImmersionApplicationList />
          </AllImmersionApplicationsProvider>
        </div>
      </div>
    </>
  );
};

const ImmersionApplicationList = () => {
  const immersionApplications = useContext(AllImmersionApplicationsContext);
  const route = useRoute();

  return (
    <ul className="fr-accordions-group">
      {immersionApplications.map((item) => (
        <li key={item.id}>
          <FormAccordion immersionApplication={item} />
          {route.name === "admin" && (
            <FormMagicLinks immersionApplication={item} />
          )}
          <hr />
        </li>
      ))}
    </ul>
  );
};
