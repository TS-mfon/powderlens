import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { NavLink, Route, Routes } from "react-router-dom";

import { HealthBanner } from "./components/HealthBanner";
import { ToastHost } from "./components/ToastHost";
import { TourModal } from "./components/TourModal";
import { appConfig } from "./config";
import { useServiceHealth } from "./hooks/useServiceHealth";
import { useWalletSession } from "./hooks/useWalletSession";
import { DashboardPage } from "./pages/DashboardPage";
import { DocsPage } from "./pages/DocsPage";
import { GuidePage } from "./pages/GuidePage";
import { LandingPage } from "./pages/LandingPage";
import { OpsPage } from "./pages/OpsPage";
import { StatusPage } from "./pages/StatusPage";
import type { StarterCard, ToastItem } from "./types";

const tourStorageKey = `${appConfig.slug}:tour-complete`;

const shorten = (value: string) => `${value.slice(0, 6)}…${value.slice(-4)}`;

export function App() {
  const health = useServiceHealth();
  const wallet = useWalletSession();
  const [starterDraft, setStarterDraft] = useState<StarterCard | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [tourStep, setTourStep] = useState(0);
  const [tourOpen, setTourOpen] = useState(false);

  useEffect(() => {
    if (!wallet.isConnected) {
      return;
    }

    const completed = window.localStorage.getItem(tourStorageKey);
    if (!completed) {
      setTourOpen(true);
    }
  }, [wallet.isConnected]);

  const themeStyle = useMemo(
    () =>
      ({
        "--bg": appConfig.theme.bg,
        "--surface": appConfig.theme.surface,
        "--surface-strong": appConfig.theme.surfaceStrong,
        "--line": appConfig.theme.line,
        "--text": appConfig.theme.text,
        "--muted": appConfig.theme.muted,
        "--accent": appConfig.theme.accent,
        "--accent-soft": appConfig.theme.accentSoft,
        "--accent-strong": appConfig.theme.accentStrong,
        "--glow-a": appConfig.theme.glowA,
        "--glow-b": appConfig.theme.glowB,
        "--brand-gradient": appConfig.theme.gradient
      }) as CSSProperties,
    []
  );

  const pushToast = (toast: Omit<ToastItem, "id">) => {
    const next: ToastItem = {
      id: `${Date.now()}-${Math.random()}`,
      ...toast
    };

    setToasts((current) => [...current, next]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== next.id));
    }, 7000);
  };

  const closeTour = () => {
    window.localStorage.setItem(tourStorageKey, "true");
    setTourOpen(false);
    setTourStep(0);
  };

  const connect = async () => {
    try {
      const account = await wallet.connect();
      pushToast({
        title: "Wallet connected",
        body: `Connected ${shorten(account)} on Mantle.`,
        tone: "success"
      });
    } catch (error) {
      pushToast({
        title: "Wallet connection failed",
        body: error instanceof Error ? error.message : "Try again from a supported wallet.",
        tone: "error"
      });
    }
  };

  return (
    <div className={`shell theme-${appConfig.slug}`} style={themeStyle}>
      <HealthBanner backendAvailable={health.backendAvailable} message={health.message} />
      <ToastHost items={toasts} onDismiss={(id) => setToasts((current) => current.filter((item) => item.id !== id))} />
      <TourModal
        isOpen={tourOpen}
        title={`Welcome to ${appConfig.name}`}
        steps={appConfig.guideSteps}
        currentStep={tourStep}
        onNext={() => setTourStep((current) => Math.min(current + 1, appConfig.guideSteps.length - 1))}
        onClose={closeTour}
      />

      <header className="topbar">
        <div className="brand">
          <span className="brand-name">{appConfig.name}</span>
          <span className="brand-copy">{appConfig.tagline}</span>
        </div>
        <nav className="nav">
          <NavLink to="/">Landing</NavLink>
          <NavLink to="/app">Dashboard</NavLink>
          <NavLink to="/guide">Guide</NavLink>
          <NavLink to="/docs">Docs</NavLink>
          <NavLink to="/ops">Ops</NavLink>
          <NavLink to="/status">Status</NavLink>
        </nav>
        <div className="topbar-actions">
          <span className={`health-pill ${health.backendAvailable ? "healthy" : "degraded"}`}>
            {health.backendAvailable
              ? health.runtimeOrigin === "render"
                ? "Render fallback"
                : "Backend live"
              : "Backend degraded"}
          </span>
          <button className="button" onClick={() => void connect()}>
            {wallet.isConnected && wallet.account ? shorten(wallet.account) : wallet.isConnecting ? "Connecting..." : "Connect wallet"}
          </button>
        </div>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              onUseStarter={setStarterDraft}
              onConnectWallet={() => void connect()}
              isConnected={wallet.isConnected}
            />
          }
        />
        <Route
          path="/app"
          element={
            <DashboardPage
              backendAvailable={health.backendAvailable}
              starterDraft={starterDraft}
              onClearStarter={() => setStarterDraft(null)}
              onUseStarter={setStarterDraft}
              onToast={pushToast}
            />
          }
        />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/ops" element={<OpsPage backendAvailable={health.backendAvailable} />} />
        <Route path="/status" element={<StatusPage health={health} />} />
      </Routes>
    </div>
  );
}
