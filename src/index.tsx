import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "rsuite/dist/rsuite.min.css";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { CustomProvider } from "rsuite";
import { HashRouter } from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <CustomProvider theme="light">
      <HashRouter>
        <App />
      </HashRouter>
    </CustomProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
