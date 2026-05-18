import type { ToastItem } from "../types";

type ToastHostProps = {
  items: ToastItem[];
  onDismiss: (id: string) => void;
};

export function ToastHost({ items, onDismiss }: ToastHostProps) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="toast-host" aria-live="polite">
      {items.map((item) => (
        <div key={item.id} className={`toast toast-${item.tone}`}>
          <div className="toast-copy">
            <strong>{item.title}</strong>
            <span>{item.body}</span>
            {item.href ? (
              <a href={item.href} target="_blank" rel="noreferrer">
                View transaction
              </a>
            ) : null}
          </div>
          <button className="icon-button" onClick={() => onDismiss(item.id)} aria-label="Dismiss toast">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
