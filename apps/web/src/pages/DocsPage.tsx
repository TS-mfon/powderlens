import { appConfig } from "../config";

export function DocsPage() {
  return (
    <main className="docs-layout">
      <aside className="panel docs-sidebar">
        <div className="eyebrow">Documentation</div>
        <h2>{appConfig.name}</h2>
        <p className="copy">{appConfig.docsIntro}</p>
        <div className="table table-tight">
          {appConfig.docs.map((section) => (
            <a key={section.id} className="docs-link" href={`#${section.id}`}>
              {section.title}
            </a>
          ))}
        </div>
      </aside>
      <section className="page-stack">
        {appConfig.docs.map((section) => (
          <article key={section.id} id={section.id} className="panel story-card">
            <div className="eyebrow">{section.title}</div>
            <h2>{section.title}</h2>
            <p className="copy">{section.body}</p>
            <ul className="bullet-list">
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
