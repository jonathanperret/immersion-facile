import "src/assets/css/index.css";
import "src/assets/dsfr/dsfr.min.css";
import "src/assets/dsfr/utility/icons/icons.min.css";

import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { App } from "src/app/App";
import { store } from "src/config/dependencies";
import { MetaContent } from "./components/layout/MetaContent";
import { HelmetProvider } from "react-helmet-async";

import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";

startReactDsfr({ defaultColorScheme: "light" });
import { RouteProvider } from "./routes/routes";

ReactDOM.render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <RouteProvider>
          <MetaContent />
          <App />
        </RouteProvider>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);
