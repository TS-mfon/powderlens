import { appConfig } from "../config";

export function GuidePage() {
  return (
    <main className="page-stack">
      <section className="panel premium">
        <div className="eyebrow">How to use</div>
        <h1>Operate PowderLens in three clean steps</h1>
        <p className="copy">{appConfig.guideIntro}</p>
      </section>
      <section className="card-grid">
        {appConfig.guideSteps.map((step, index) => (
          <article key={step.title} className="story-card">
            <span className="index-chip">0{index + 1}</span>
            <h2>{step.title}</h2>
            <p className="copy">{step.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
