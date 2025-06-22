import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { PedidoProvider } from "./context/PedidoContext";
import { IdiomaProvider } from "./context/IdiomaContext";
import "./styles/index.css"; // Asegúrate de que existe y está en la carpeta correcta

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <IdiomaProvider>
      <PedidoProvider>
        <App />
      </PedidoProvider>
    </IdiomaProvider>
  </React.StrictMode>
);
