import { useState } from "react";
import type { DeliverySnapshot } from "../entities/delivery";
import { shortDate } from "../utils/deliveryFormat";

export function DeliveryTrend({ trend }: { trend: DeliverySnapshot["trend"] }) {
  const [period, setPeriod] = useState(7);
  const days = trend.slice(-period);
  const bucketSize = period / 7;
  const buckets = Array.from({ length: Math.ceil(days.length / bucketSize) }, (_, index) => {
    const bucket = days.slice(index * bucketSize, (index + 1) * bucketSize);
    const label =
      bucketSize === 1
        ? shortDate(bucket[0].date)
        : `${shortDate(bucket[0].date)}–${shortDate(bucket[bucket.length - 1].date)}`;
    return {
      label,
      created: bucket.reduce((sum, day) => sum + day.created, 0),
      completed: bucket.reduce((sum, day) => sum + day.completed, 0),
    };
  });
  const peak = Math.max(1, ...buckets.flatMap((bucket) => [bucket.created, bucket.completed]));
  const created = days.reduce((sum, day) => sum + day.created, 0);
  const completed = days.reduce((sum, day) => sum + day.completed, 0);

  return (
    <section className="delivery-panel delivery-trend" aria-labelledby="delivery-trend-title">
      <div className="delivery-panel-heading">
        <div>
          <h2 id="delivery-trend-title">Delivery flow</h2>
        </div>
        <label className="delivery-period">
          <span className="sr-only">Delivery period</span>
          <select value={period} onChange={(event) => setPeriod(Number(event.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={28}>Last 28 days</option>
          </select>
        </label>
      </div>
      <div className="delivery-chart-summary">
        <span>
          <i className="delivery-chart-key added" />
          <b>{created}</b> added
        </span>
        <span>
          <i className="delivery-chart-key finished" />
          <b>{completed}</b> completed
        </span>
      </div>
      {created || completed ? (
        <div className="delivery-chart" aria-hidden="true">
          {buckets.map((bucket) => (
            <div key={bucket.label} className="delivery-chart-group">
              <div
                className="delivery-chart-bars"
                title={`${bucket.label}: ${bucket.created} added, ${bucket.completed} completed`}
              >
                <span
                  className="delivery-bar added"
                  style={{ height: `${(bucket.created / peak) * 100}%` }}
                >
                  {bucket.created > 0 && <small>{bucket.created}</small>}
                </span>
                <span
                  className="delivery-bar finished"
                  style={{ height: `${(bucket.completed / peak) * 100}%` }}
                >
                  {bucket.completed > 0 && <small>{bucket.completed}</small>}
                </span>
              </div>
              <span className="delivery-chart-label">{bucket.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="delivery-empty">No work was added or completed in this period.</p>
      )}
      <details className="delivery-chart-table">
        <summary>View chart data</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Dates</th>
              <th scope="col">Added</th>
              <th scope="col">Completed</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map((bucket) => (
              <tr key={bucket.label}>
                <th scope="row">{bucket.label}</th>
                <td>{bucket.created}</td>
                <td>{bucket.completed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
