import AppRouter from "./routes/AppRouter";
import { ToastProvider } from "./components/feedback/ToastProvider";
import OfflineBanner from "./components/feedback/OfflineBanner";

function App() {
  return (
    <ToastProvider>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <OfflineBanner />
      <AppRouter />
    </ToastProvider>
  );
}

export default App;
