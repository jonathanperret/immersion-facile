import React from "react";
import { DsfrTitle } from "react-design-system/immersionFacile";
import "src/assets/admin.css";
import { AgencyAutocomplete } from "./AgencyAutocomplete";

export const EditAgency = () => {
  const _selectedAgency = 3;

  return (
    <>
      <DsfrTitle level={5} text="Editer une agence" />
      <div
        className="w-2/3 p-5"
        style={{
          backgroundColor: "#E5E5F4",
        }}
      >
        <AgencyAutocomplete
          title="Je recherche une agence"
          placeholder={"Ex : Agence de Berry"}
          className="searchdropdown-header inputLabel"
        />
      </div>
      {/*{selectedAgency && (*/}
      {/*  <div className="p-4 flex flex-col gap-4">*/}
      {/*    <AgencyDetails agency={selectedAgency} />*/}
      {/*    <button*/}
      {/*      disabled={activationButtonDisabled}*/}
      {/*      className="fr-btn flex"*/}
      {/*      onClick={() => selectedAgency && validateAgency(selectedAgency)}*/}
      {/*    >*/}
      {/*      Activer cette agence*/}
      {/*    </button>*/}
      {/*    {activationResult && (*/}
      {/*      <Notification*/}
      {/*        type={activationResult.status}*/}
      {/*        title={activationResult.text}*/}
      {/*      >*/}
      {/*        {activationResult.message}*/}
      {/*      </Notification>*/}
      {/*    )}*/}
      {/*  </div>*/}
      {/*)} */}
    </>
  );
};
