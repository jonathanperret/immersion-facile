import SearchIcon from "@mui/icons-material/Search";
import React from "react";
import { PeConnect } from "src/app/components/PeConnect";
import { EstablishmentSubTitle } from "src/app/pages/Home/components/EstablishmentSubTitle";
import { EstablishmentTitle } from "src/app/pages/Home/components/EstablishmentTitle";
import { routes } from "src/app/routing/routes";

export const ImmersionHomeMenu = () => (
  <div
    className={`border-2 border-red-200 bg-red-50 flex flex-col items-center rounded justify-between px-4 p-1 m-2 w-48`}
    style={{ width: "400px", height: "250px" }}
  >
    <div className="flex flex-col">
      <EstablishmentTitle type={"candidate"} text="CANDIDAT À UNE IMMERSION" />
      <EstablishmentSubTitle
        type={"candidate"}
        text="Vous voulez essayer un métier en conditions réelles ?"
      />
    </div>
    <div className="flex flex-col w-full h-full items-center justify-center">
      <a
        {...routes.search().link}
        className="no-underline shadow-none bg-immersionRed py-3 px-2 mt-1 mb-2 rounded-md text-white font-semibold  w-full text-center h-15 text-sm "
      >
        Trouver une entreprise accueillante <SearchIcon />
      </a>

      <div>J'ai trouvé mon immersion : </div>

      <a
        {...routes.immersionApplication().link}
        className="no-underline shadow-none bg-immersionRed py-3 px-2 rounded-md text-white font-semibold  w-full text-center h-15 text-sm "
      >
        Initier une demande de convention libre
      </a>
      <PeConnect />
    </div>
  </div>
);
