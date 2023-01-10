import "src/assets/css/index.css";
import "src/assets/dsfr/dsfr.min.css";
import "src/assets/dsfr/utility/icons/icons.min.css";

import React from "react";
//import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { App } from "src/app/App";
import { store } from "src/config/dependencies";
import { MetaContent } from "./components/layout/MetaContent";
import { HelmetProvider } from "react-helmet-async";

import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";

startReactDsfr({ defaultColorScheme: "light" });
import { RouteProvider } from "./routes/routes";

const container: HTMLElement | null = document.getElementById("root");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(
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
);

// ReactDOM.render(
//   <React.StrictMode>
//     <Provider store={store}>
//       <RouteProvider>
//         <MetaContent />
//         <App />
//       </RouteProvider>
//     </Provider>
//   </React.StrictMode>,
//   document.getElementById("root"),
// );
