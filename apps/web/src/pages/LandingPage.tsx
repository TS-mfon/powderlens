import { Link } from "react-router-dom";

import { appConfig } from "../config";
import type { StarterCard } from "../types";

type LandingPageProps = {
  onUseStarter: (starter: StarterCard) => void;
  onConnectWallet: () => void;
  isConnected: boolean;
};

export function LandingPage({ onUseStarter, onConnectWallet, isConnected }: LandingPageProps) {
  return (
    <main className="page-stack">
      <section className="hero-shell">
        <div className="hero-copy panel premium">
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
      </section>

      <section className="grid metrics-grid">
        {appConfig.metrics.map((metric) => (
          <article key={metric.label} className="panel metric-panel">
            <div className="metric-label">{metric.label}</div>
            <div className="metric">{metric.value}</div>
            <div className="muted">{metric.detail}</div>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Starter workflows</div>
            <h2>Open with a ready-to-use operator play</h2>
          </div>
          <Link className="button secondary" to="/guide">
            How to use
          </Link>
        </div>
        <div className="card-grid">
          {appConfig.starterCards.map((card) => (
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
