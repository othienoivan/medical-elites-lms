import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
<<<<<<< HEAD
import App from "./App";
import AppErrorBoundary from "./components/AppErrorBoundary";
=======
import "./firebase/testConnection";

import App from "./App";
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
import { AuthProvider } from "./contexts/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
<<<<<<< HEAD
    <AppErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AppErrorBoundary>
=======
    <AuthProvider>
      <App />
    </AuthProvider>
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
  </StrictMode>
);