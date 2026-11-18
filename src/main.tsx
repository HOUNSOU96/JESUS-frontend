import './index.css'
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { OperationProgressProvider } from "./components/OperationProgress";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <OperationProgressProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </OperationProgressProvider>
  </React.StrictMode>
);
