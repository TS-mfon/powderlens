import { getJson } from "../api";
import { useApi } from "../hooks/useApi";
import type { Review } from "../types";

export function AdminPage() {
  const { data, error, isLoading } = useApi(() => getJson<Review[]>("/admin/reviews"));

  if (isLoading) {
    return <main className="panel">Loading admin review queue...</main>;
  }

  if (error) {
    return <main className="panel">Failed to load admin queue: {error}</main>;
  }

  return (
    <main className="panel">
      <div className="eyebrow">Operator console</div>
      <h1>Review queue</h1>
      <div className="table">
        {data?.map((review) => (
          <div key={review.id} className="row">
            <div>{review.headline}</div>
            <div>{review.confidence}%</div>
            <div>{review.severity}</div>
            <div>{review.status}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
