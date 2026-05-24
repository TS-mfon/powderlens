import { FormEvent, useEffect, useMemo, useState } from "react";

import { getJson, postJson } from "../api";
import { appConfig } from "../config";
import { useApi } from "../hooks/useApi";
import { createThesisOnChain, recordSignalOnChain } from "../onchain";
import type { AIDecision, AlertRule, Signal, StarterCard, ToastItem, TxState } from "../types";

type DashboardPageProps = {
  backendAvailable: boolean;
  starterDraft: StarterCard | null;
  onClearStarter: () => void;
  onUseStarter: (starter: StarterCard) => void;
  onToast: (toast: Omit<ToastItem, "id">) => void;
};

export function DashboardPage({
  backendAvailable,
  starterDraft,
  onClearStarter,
  onUseStarter,
  onToast
}: DashboardPageProps) {
  const { data, error, isLoading } = useApi(() => getJson<Signal[]>("/signals"));
  const { data: alertRules, isLoading: alertsLoading } = useApi(() => getJson<AlertRule[]>("/alerts"));
  const { data: starterWorkflows } = useApi(() => getJson<StarterCard[]>("/starter-workflows"));
  const { data: aiDecisionData, isLoading: aiLoading } = useApi(() => getJson<AIDecision[]>("/ai-decisions"));
  const [selectedSignalId, setSelectedSignalId] = useState("");
  const [thesis, setThesis] = useState("");
  const [alertChannel, setAlertChannel] = useState("telegram");
  const [alertCondition, setAlertCondition] = useState("");
  const [txState, setTxState] = useState<TxState>({ status: "idle" });
  const [aiDecisions, setAiDecisions] = useState<AIDecision[]>([]);
  const [aiActionId, setAiActionId] = useState<string | null>(null);

  const signals = useMemo(() => data ?? [], [data]);
  const starters = useMemo(() => starterWorkflows ?? [], [starterWorkflows]);
  useEffect(() => {
    setAiDecisions(aiDecisionData ?? []);
  }, [aiDecisionData]);

  const selectedDecision =
    aiDecisions.find((decision) => decision.signalId === selectedSignalId) ?? aiDecisions[0];
  const selectedSignal =
    signals.find((signal) => signal.id === selectedSignalId) ??
    (selectedDecision?.signalId
      ? signals.find((signal) => signal.id === selectedDecision.signalId)
      : undefined) ??
    (starterDraft?.signalId
      ? signals.find((signal) => signal.id === starterDraft.signalId)
      : undefined) ??
    signals[0];

  useEffect(() => {
    if (!starterDraft) {
      return;
    }

    setThesis(starterDraft.thesis);
    if (starterDraft.signalId) {
      setSelectedSignalId(starterDraft.signalId);
    }
  }, [starterDraft]);

  useEffect(() => {
    if (selectedSignal) {
      setAlertCondition(`Notify when ${selectedSignal.headline.toLowerCase()} changes materially.`);
    }
  }, [selectedSignal?.id]);

  const recordSignal = async (signal: Signal) => {
    setTxState({ status: "pending", message: `Recording ${signal.headline}...` });

    try {
      const result = await recordSignalOnChain(signal);
      setTxState({
        status: "success",
        message: "Signal recorded on Mantle.",
        hash: result.hash,
        explorerUrl: result.explorerUrl
      });
      onToast({
        title: "Signal recorded",
        body: signal.headline,
        tone: "success",
        href: result.explorerUrl
      });
    } catch (txError) {
      const message =
        txError instanceof Error ? txError.message : "Signal transaction failed.";
      setTxState({ status: "error", message });
      onToast({
        title: "Signal transaction failed",
        body: message,
        tone: "error"
      });
    }
  };

  const publishThesis = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedSignal) {
      return;
    }

    setTxState({ status: "pending", message: "Publishing thesis on Mantle..." });

    try {
      const saved = await postJson<{
        id: string;
        replication?: { status: string; error?: string };
      }>("/theses", {
        signalId: selectedSignal.id,
        thesis
      });
      const result = await createThesisOnChain(selectedSignal, thesis);
      setTxState({
        status: "success",
        message: `Thesis saved to backend, ${saved.replication?.status ?? "replication queued"}, and published on Mantle.`,
        hash: result.hash,
        explorerUrl: result.explorerUrl
      });
      onToast({
        title: "Thesis published",
        body: `${selectedSignal.headline} (${saved.replication?.status ?? "backend saved"})`,
        tone: "success",
        href: result.explorerUrl
      });
    } catch (txError) {
      const message =
        txError instanceof Error ? txError.message : "Thesis save or transaction failed.";
      setTxState({ status: "error", message });
      onToast({
        title: "Thesis publish failed",
        body: message,
        tone: "error"
      });
    }
  };

  const createAlert = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await postJson("/alerts", {
        channel: alertChannel,
        condition: alertCondition
      });
      onToast({
        title: "Alert created",
        body: `${alertChannel} rule saved to the VPS backend.`,
        tone: "success"
      });
      window.location.reload();
    } catch (alertError) {
      onToast({
        title: "Alert creation failed",
        body: alertError instanceof Error ? alertError.message : "Try again.",
        tone: "error"
      });
    }
  };

  const sendAiFeedback = async (decision: AIDecision, verdict: "accepted" | "rejected") => {
    setAiActionId(`${decision.id}:${verdict}`);

    try {
      const response = await postJson<{
        verdict: "accepted" | "rejected";
        replication?: { status: string; error?: string };
      }>(`/ai-decisions/${decision.id}/feedback`, {
        verdict,
        note:
          verdict === "accepted"
            ? "Operator accepted the AI recommendation for on-chain execution."
            : "Operator marked the AI recommendation as noisy or premature."
      });

      setAiDecisions((current) =>
        current.map((item) =>
          item.id === decision.id
            ? {
                ...item,
                feedback: {
                  ...item.feedback,
                  accepted: item.feedback.accepted + (verdict === "accepted" ? 1 : 0),
                  rejected: item.feedback.rejected + (verdict === "rejected" ? 1 : 0)
                }
              }
            : item
        )
      );
      onToast({
        title: verdict === "accepted" ? "AI decision accepted" : "AI decision rejected",
        body: `Feedback persisted with ${response.replication?.status ?? "backend"} replication status.`,
        tone: "success"
      });
    } catch (feedbackError) {
      onToast({
        title: "AI feedback failed",
        body: feedbackError instanceof Error ? feedbackError.message : "Feedback could not be saved.",
        tone: "error"
      });
    } finally {
      setAiActionId(null);
    }
  };

  if (isLoading) {
    return <main className="panel">Loading Mantle intelligence...</main>;
  }

  if (error) {
    return <main className="panel">Failed to load signals: {error}</main>;
  }

  return (
    <main className={`dashboard dashboard-${appConfig.slug}`}>
      <section className="panel dashboard-lead">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Dashboard</div>
            <h1>{appConfig.dashboardTitle}</h1>
            <p className="copy">{appConfig.dashboardSubtitle}</p>
          </div>
          <span className={`health-pill ${backendAvailable ? "healthy" : "degraded"}`}>
            {backendAvailable ? "Indexer live" : "Indexer degraded"}
          </span>
        </div>
        <div className="signal-board">
          {signals.map((signal) => (
            <button
              key={signal.id}
              className={`signal-row ${selectedSignal?.id === signal.id ? "active" : ""}`}
              onClick={() => setSelectedSignalId(signal.id)}
            >
              <div>
                <strong>{signal.headline}</strong>
                <div className="muted">
                  {signal.sourceAsset} → {signal.destinationAsset}
                </div>
              </div>
              <span>{signal.confidence}%</span>
            </button>
          ))}
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="panel detail-panel">
          <div className="eyebrow">Selected signal</div>
          <h2>{selectedSignal?.headline}</h2>
          <p className="copy">{selectedSignal?.summary}</p>
          <div className="meta-grid">
            <div>
              <span className="muted">Source</span>
              <strong>{selectedSignal?.sourceProtocol}</strong>
            </div>
            <div>
              <span className="muted">Destination</span>
              <strong>{selectedSignal?.destinationProtocol}</strong>
            </div>
            <div>
              <span className="muted">Asset path</span>
              <strong>
                {selectedSignal?.sourceAsset} → {selectedSignal?.destinationAsset}
              </strong>
            </div>
            <div>
              <span className="muted">Severity</span>
              <strong>{selectedSignal?.severity}</strong>
            </div>
          </div>
          {selectedSignal?.evidence?.length ? (
            <div className="evidence-stack">
              {selectedSignal.evidence.map((item) => (
                <article key={item.id} className="evidence-card">
                  <div className="eyebrow">{item.type}</div>
                  <h3>{item.title}</h3>
                  <p className="copy">{item.body}</p>
                </article>
              ))}
            </div>
          ) : null}
          <div className="cta-row">
            {selectedSignal ? (
              <button className="button" onClick={() => void recordSignal(selectedSignal)}>
                Record signal on Mantle
              </button>
            ) : null}
            {starterDraft ? (
              <button className="button secondary" onClick={onClearStarter}>
                Clear starter
              </button>
            ) : null}
          </div>
        </article>

        <article className="panel composer-panel">
          <div className="eyebrow">Thesis composer</div>
          <h2>Publish operator conviction</h2>
          <form className="stack" onSubmit={publishThesis}>
            <select
              className="input"
              value={selectedSignal?.id ?? ""}
              onChange={(event) => setSelectedSignalId(event.target.value)}
            >
              {signals.map((signal) => (
                <option key={signal.id} value={signal.id}>
                  {signal.headline}
                </option>
              ))}
            </select>
            <textarea
              className="textarea"
              value={thesis}
              onChange={(event) => setThesis(event.target.value)}
              aria-label="Mantle thesis"
              minLength={20}
              required
            />
            <button className="button" type="submit">
              Publish thesis on Mantle
            </button>
          </form>
          {txState.status !== "idle" ? (
            <div className="status-block">
              <strong>{txState.message}</strong>
              {txState.explorerUrl ? (
                <a href={txState.explorerUrl} target="_blank" rel="noreferrer">
                  View on Mantle Explorer
                </a>
              ) : null}
            </div>
          ) : null}
        </article>
      </section>

      <section className="panel ai-decision-panel">
        <div className="section-heading">
          <div>
            <div className="eyebrow">AI Awakening layer</div>
            <h2>Agent decisions from live Mantle backend data</h2>
            <p className="copy">
              Each recommendation is computed from indexed signals, evidence density, severity, protocol path, and persisted operator feedback.
            </p>
          </div>
          <span className="health-pill healthy">
            {aiLoading ? "Model loading" : `${aiDecisions.length} decisions`}
          </span>
        </div>
        <div className="ai-decision-grid">
          {aiDecisions.map((decision) => (
            <article key={decision.id} className="ai-decision-card">
              <div className="ai-score">{decision.score}</div>
              <div>
                <div className="eyebrow">{decision.track}</div>
                <h3>{decision.decisionType}</h3>
                <p className="copy">{decision.rationale}</p>
                <div className="chip-row">
                  {decision.drivers.map((driver) => (
                    <span key={driver} className="mini-chip">
                      {driver}
                    </span>
                  ))}
                </div>
                <div className="decision-body">
                  <strong>Recommended action</strong>
                  <span>{decision.recommendedAction}</span>
                </div>
                <div className="decision-body">
                  <strong>Expected outcome</strong>
                  <span>{decision.expectedOutcome}</span>
                </div>
                <div className="chip-row risk-row">
                  {decision.riskFlags.map((flag) => (
                    <span key={flag} className="mini-chip risk">
                      {flag}
                    </span>
                  ))}
                </div>
                <div className="cta-row">
                  <button
                    className="button"
                    disabled={aiActionId === `${decision.id}:accepted`}
                    onClick={() => void sendAiFeedback(decision, "accepted")}
                  >
                    {aiActionId === `${decision.id}:accepted` ? "Saving..." : "Accept AI call"}
                  </button>
                  <button
                    className="button secondary"
                    disabled={aiActionId === `${decision.id}:rejected`}
                    onClick={() => void sendAiFeedback(decision, "rejected")}
                  >
                    {aiActionId === `${decision.id}:rejected` ? "Saving..." : "Mark false positive"}
                  </button>
                </div>
                <div className="muted">
                  Feedback: {decision.feedback.accepted} accepted / {decision.feedback.rejected} rejected
                </div>
              </div>
            </article>
          ))}
          {!aiLoading && aiDecisions.length === 0 ? (
            <p className="copy">No AI decisions are available until the backend indexes Mantle signals.</p>
          ) : null}
        </div>
      </section>

      <section className="dashboard-grid dashboard-grid-secondary">
        <article className="panel">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Alert routes</div>
              <h2>Persist watcher rules to the backend</h2>
            </div>
          </div>
          <form className="stack" onSubmit={createAlert}>
            <select className="input" value={alertChannel} onChange={(event) => setAlertChannel(event.target.value)}>
              <option value="telegram">Telegram</option>
              <option value="discord">Discord</option>
              <option value="email">Email</option>
            </select>
            <textarea
              className="textarea"
              value={alertCondition}
              onChange={(event) => setAlertCondition(event.target.value)}
              minLength={8}
              required
            />
            <button className="button secondary" type="submit">
              Save alert rule
            </button>
          </form>
          <div className="alert-list">
            {(alertRules ?? []).map((rule) => (
              <div key={rule.id} className="alert-row">
                <strong>{rule.channel}</strong>
                <span className="copy">{rule.condition}</span>
              </div>
            ))}
            {alertsLoading ? <p className="copy">Loading alert rules…</p> : null}
          </div>
        </article>
        <article className="panel">
          <div className="section-heading">
          <div>
            <div className="eyebrow">Starter library</div>
            <h2>Open a ready-made operator move</h2>
          </div>
          </div>
          <div className="starter-editorial-grid">
          {starters.map((card) => (
            <article key={card.id} className="story-card">
              <h3>{card.title}</h3>
              <p className="copy">{card.summary}</p>
              <button className="button secondary" onClick={() => onUseStarter(card)}>
                {card.cta}
              </button>
            </article>
          ))}
          </div>
        </article>
      </section>
    </main>
  );
}
