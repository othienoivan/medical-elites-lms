import AppRouter from "./routes/AppRouter";
import { ToastProvider } from "./components/feedback/ToastProvider";
import OfflineBanner from "./components/feedback/OfflineBanner";
import { useEffect } from "react";
import { installGlobalDiagnosticsListeners } from "./utils/appDiagnostics";
import CreatorAttribution from "./components/CreatorAttribution";

function App() {
  useEffect(() => installGlobalDiagnosticsListeners(), []);

  return (
    <ToastProvider>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <OfflineBanner />
      <AppRouter />
      <CreatorAttribution />
    </ToastProvider>
  );
}

export default App;
