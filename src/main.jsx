import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { ItemsProvider } from "./context/ItemsContext.jsx";
import { UsersProvider } from "./context/UsersContext.jsx";
import { ToastProvider } from "./components/ToastHost.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ToastProvider>
      <ItemsProvider>
        <UsersProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </UsersProvider>
      </ItemsProvider>
    </ToastProvider>
  </React.StrictMode>
);
