import { Link } from "react-router-dom";

import { getJson } from "../api";
import { appConfig } from "../config";
import { useApi } from "../hooks/useApi";
import type { StarterCard } from "../types";

type LandingPageProps = {
  onUseStarter: (starter: StarterCard) => void;
  onConnectWallet: () => void;
  isConnected: boolean;
};

export function LandingPage({ onUseStarter, onConnectWallet, isConnected }: LandingPageProps) {
  const { data: starterCards, error } = useApi(() => getJson<StarterCard[]>("/starter-workflows"));

  const cards = starterCards ?? [];

  return (
    <main className={`page-stack landing landing-${appConfig.slug}`}>
      <section className="hero-split">
        <div className="hero-copy panel premium hero-manifesto">
          <div className="eyebrow">{appConfig.tag}</div>
          <h1 className="headline">{appConfig.valueProp}</h1>
          <p className="copy">{appConfig.aiAwakeningFit}</p>
          <div className="cta-row">
            <Link className="button" to="/app">
              {appConfig.launchLabel}
            </Link>
            <Link className="button secondary" to="/docs">
              {appConfig.docsLabel}
            </Link>
            {!isConnected ? (
              <button className="button ghost" onClick={onConnectWallet}>
                Connect wallet
              </button>
            ) : null}
          </div>
        </div>
        <div className="hero-aside">
          <div className="panel hero-rail">
            <div className="eyebrow">Live profile</div>
            <div className="stat-column">
              {appConfig.heroStats.map((item) => (
                <div key={item.label} className="hero-stat">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="panel hero-note">
            <div className="eyebrow">What it does</div>
            <p className="copy">
              {appConfig.guideIntro}
            </p>
          </div>
        </div>
      </section>

      <section className="editorial-metrics">
        <article className="panel metric-feature">
          <div className="eyebrow">Why it matters on Mantle</div>
          <h2>{appConfig.metrics[0]?.value}</h2>
          <p className="copy">{appConfig.metrics[0]?.detail}</p>
        </article>
        <div className="metric-stack">
          {appConfig.metrics.slice(1).map((metric) => (
            <article key={metric.label} className="panel metric-panel">
              <div className="metric-label">{metric.label}</div>
              <div className="metric">{metric.value}</div>
              <div className="muted">{metric.detail}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel starter-panel">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Starter workflows</div>
            <h2>Open with a real backend workflow</h2>
          </div>
          <Link className="button secondary" to="/guide">
            How to use
          </Link>
        </div>
        {error ? <p className="copy">Backend starter workflows are currently unavailable.</p> : null}
        <div className="starter-editorial-grid">
          {cards.map((card) => (
            <article key={card.id} className="story-card">
              <h3>{card.title}</h3>
              <p className="copy">{card.summary}</p>
              <div className="cta-row">
                <button className="button secondary" onClick={() => onUseStarter(card)}>
                  {card.cta}
                </button>
                <Link className="text-link" to="/app">
                  Open dashboard
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
