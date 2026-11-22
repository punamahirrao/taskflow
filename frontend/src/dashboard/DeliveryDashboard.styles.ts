import { createGlobalStyle } from "styled-components";

export const DeliveryDashboardStyles = createGlobalStyle`
.delivery-dashboard {
  --delivery-link: #433bb7;
  --delivery-added: #a395e6;
  --delivery-finished: #16866f;
  --delivery-subtle: color-mix(in srgb, var(--delivery-link) 5%, var(--theme-surface));
  max-width: 1580px;
  margin-inline: auto;
  padding: clamp(1rem, 2.5vw, 2.25rem);
  color: var(--theme-text);
  min-width: 0;
}
[data-theme="night"] .delivery-dashboard {
  --delivery-link: #c3bafc;
  --delivery-added: #ab97f3;
  --delivery-finished: #48c6a5;
}
.delivery-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.delivery-header h1 {
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  line-height: 1.1;
  font-weight: 760;
  letter-spacing: -0.055em;
}
.delivery-period select {
  background: var(--theme-surface);
  color: var(--theme-text);
  border: 1px solid var(--theme-border);
  border-radius: 0.45rem;
  padding: 0.45rem 0.65rem;
  font-size: 0.8rem;
  max-width: 100%;
}
.delivery-dashboard :is(button, a, select, summary, [tabindex]):focus-visible {
  outline: 2px solid var(--delivery-link);
  outline-offset: 2px;
}
.delivery-content,
.delivery-stack {
  display: grid;
  gap: 1rem;
  min-width: 0;
}
.delivery-stack {
  align-content: start;
}
.delivery-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-radius: 0.9rem;
  padding: clamp(1rem, 2.75vw, 2rem);
  background:
    radial-gradient(ellipse at 95% 18%, #404687, transparent 70%),
    linear-gradient(115deg, #151d38, #25234c);
  color: #f8f9ff;
}
.delivery-hero::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: 0;
  background: radial-gradient(circle at 1px 1px, #a4afee4d 1px, transparent 1px) 0 0 / 12px 12px;
  mask-image: linear-gradient(95deg, transparent 46%, black);
}
.delivery-hero-copy {
  min-width: 0;
  overflow-wrap: anywhere;
}
.delivery-hero-label {
  color: #b9c3fa;
  font-size: 0.76rem;
  font-weight: 650;
}
.delivery-hero h2 {
  font-size: clamp(1.4rem, 3.1vw, 2.5rem);
  line-height: 1.08;
  margin: 0.32rem 0 0.5rem;
  font-weight: 760;
  letter-spacing: -0.055em;
}
.delivery-hero p {
  color: #d6dcf7;
  font-size: 0.875rem;
}
.delivery-hero-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.85rem;
  color: #adf2d6;
  font-size: 0.8rem;
  font-weight: 700;
}
.delivery-hero-link:focus-visible {
  outline-color: #adf2d6 !important;
}
.delivery-hero-ring {
  flex-shrink: 0;
  width: clamp(5.7rem, 10vw, 8rem);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 50%;
}
.delivery-hero-ring > div {
  width: 83%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #222b4b;
  display: grid;
  place-content: center;
  justify-items: center;
}
.delivery-hero-ring strong {
  font-size: clamp(1.25rem, 2.4vw, 2rem);
  line-height: 1;
  letter-spacing: -0.06em;
}
.delivery-hero-ring span {
  margin-top: 0.22rem;
  color: #d6dcf7;
  font-size: 0.69rem;
}
.delivery-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}
.delivery-metric,
.delivery-panel {
  border: 1px solid var(--theme-border);
  border-radius: 0.75rem;
  background: var(--theme-surface);
  min-width: 0;
  box-shadow: 0 2px 5px rgb(28 30 64 / 4%);
}
.delivery-metric {
  padding: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
}
.delivery-metric-icon,
.delivery-activity-icon {
  display: grid;
  place-items: center;
  width: 2.5rem;
  aspect-ratio: 1;
  flex-shrink: 0;
  border-radius: 0.55rem;
}
.delivery-metric-icon.violet,
.delivery-activity-icon {
  background: #eee6fc;
  color: #6446af;
}
.delivery-metric-icon.teal {
  background: #d8f1e8;
  color: #126a56;
}
.delivery-metric-icon.blue {
  background: #e0ecff;
  color: #2e55ac;
}
.delivery-metric-icon.amber {
  background: #faeccc;
  color: #815412;
}
.delivery-metric h3 {
  font-size: 0.74rem;
  font-weight: 650;
}
.delivery-metric strong {
  display: block;
  font-size: 1.65rem;
  line-height: 1.18;
  font-weight: 750;
  letter-spacing: -0.04em;
}
.delivery-panel-heading p {
  color: var(--theme-muted);
  font-size: 0.735rem;
}
.delivery-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
  align-items: stretch;
  gap: 1rem;
}
.delivery-panel-heading {
  padding: 0.85rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.delivery-panel-heading h2 {
  font-size: 1rem;
  font-weight: 750;
  letter-spacing: -0.025em;
}
.delivery-panel-heading > div {
  min-width: 0;
}
.delivery-panel-heading h2 > span {
  border-radius: 0.25rem;
  background: var(--delivery-subtle);
  color: var(--theme-muted);
  padding: 0.15rem 0.38rem;
  font-size: 0.73rem;
  margin-left: 0.15rem;
}
.delivery-panel-heading p {
  margin-top: 0.16rem;
}
.delivery-heading-icon,
.delivery-open {
  color: var(--delivery-link);
  flex-shrink: 0;
}
.delivery-open {
  display: inline-grid;
  place-items: center;
  border-radius: 0.35rem;
  width: 1.8rem;
  height: 1.8rem;
  border: 1px solid var(--theme-border);
}
.delivery-open:hover {
  background: var(--delivery-subtle);
}
.delivery-link {
  color: var(--delivery-link);
  font-size: 0.77rem;
  font-weight: 650;
}
.delivery-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  text-align: left;
  overflow-wrap: anywhere;
}
.delivery-panel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  border-top: 1px solid var(--theme-border);
  color: var(--theme-muted);
  font-size: 0.72rem;
}
.delivery-panel-footer .delivery-link {
  margin-left: auto;
}
.delivery-link:hover,
.delivery-hero-link:hover {
  text-decoration: underline;
  text-underline-offset: 0.18rem;
}
.delivery-chart-summary {
  display: flex;
  gap: 1rem;
  padding: 0 1rem 0.6rem;
  color: var(--theme-muted);
  font-size: 0.77rem;
}
.delivery-chart-summary > span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.delivery-chart-summary b {
  color: var(--theme-text);
}
.delivery-chart-key {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 0.12rem;
}
.delivery-chart-key.added,
.delivery-bar.added {
  background: var(--delivery-added);
}
.delivery-chart-key.finished,
.delivery-bar.finished {
  background: var(--delivery-finished);
}
.delivery-chart {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.35rem;
  margin: 0.4rem 1rem 0;
  background: repeating-linear-gradient(to top, var(--theme-border) 0 1px, transparent 1px 2rem)
    bottom 1.9rem left / 100% calc(100% - 1.9rem) no-repeat;
}
.delivery-trend {
  display: flex;
  flex-direction: column;
}
.delivery-trend .delivery-chart {
  flex: 1;
}
.delivery-chart-group {
  min-width: 0;
  text-align: center;
  display: flex;
  flex-direction: column;
}
.delivery-chart-bars {
  display: flex;
  gap: 0.18rem;
  align-items: end;
  justify-content: center;
  height: 8rem;
  flex: 1;
  min-height: 8rem;
}
.delivery-bar {
  width: min(1.1rem, 35%);
  position: relative;
  border-radius: 0.25rem 0.25rem 0 0;
}
.delivery-bar small {
  position: absolute;
  bottom: calc(100% + 2px);
  left: 50%;
  transform: translateX(-50%);
  color: var(--theme-muted);
  font-size: 0.64rem;
}
.delivery-chart-label {
  display: grid;
  place-items: center;
  height: 1.9rem;
  flex-shrink: 0;
  line-height: 1.05;
  color: var(--theme-muted);
  font-size: 0.635rem;
}
.delivery-chart-table {
  padding: 0.55rem 1rem 0.75rem;
  color: var(--theme-muted);
  font-size: 0.75rem;
}
.delivery-chart-table summary {
  cursor: pointer;
  width: fit-content;
  color: var(--delivery-link);
}
.delivery-chart-table table {
  width: 100%;
  margin-top: 0.55rem;
  text-align: left;
}
.delivery-chart-table th,
.delivery-chart-table td {
  padding: 0.2rem;
}
.delivery-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0 1rem 0.65rem;
}
.delivery-filters button {
  border-radius: 0.4rem;
  padding: 0.36rem 0.55rem;
  background: var(--theme-subtle);
  color: var(--theme-text);
  font-size: 0.73rem;
}
.delivery-filters button[aria-pressed="true"] {
  background: color-mix(in srgb, var(--delivery-link) 13%, var(--theme-surface));
  color: var(--delivery-link);
}
.delivery-filters b {
  margin-left: 0.15rem;
}
.delivery-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.delivery-list li {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
  border-top: 1px solid var(--theme-border);
  padding: 0.64rem 1rem;
  font-size: 0.77rem;
}
.delivery-list li > div {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}
.delivery-list strong {
  font-weight: 700;
}
.delivery-list small,
.delivery-list p {
  display: block;
  color: var(--theme-muted);
  font-size: 0.72rem;
  margin-top: 0.15rem;
}
.delivery-list .delivery-list-meta {
  flex: 0 0 auto;
  max-width: 34%;
  text-align: right;
  font-size: 0.73rem;
  color: var(--theme-muted);
}
.delivery-dot {
  border-radius: 50%;
  width: 0.43rem;
  height: 0.43rem;
  flex-shrink: 0;
  background: #6554c0;
}
.delivery-dot.overdue {
  background: #cf4265;
}
.delivery-dot.blocked {
  background: #b97717;
}
.delivery-empty,
.delivery-panel-note {
  color: var(--theme-muted);
  font-size: 0.78rem;
  padding: 0.65rem 1rem 0.85rem;
}
.delivery-panel-note {
  font-size: 0.72rem;
  border-top: 1px solid var(--theme-border);
}
.delivery-table-scroll {
  position: relative;
  overflow: auto;
}
.delivery-table {
  border-collapse: collapse;
  min-width: 30rem;
  width: 100%;
  text-align: left;
  font-size: 0.76rem;
}
.delivery-table thead {
  background: var(--delivery-subtle);
}
.delivery-table th,
.delivery-table td {
  padding: 0.64rem 0.6rem;
  vertical-align: middle;
  overflow-wrap: anywhere;
}
.delivery-table :is(th, td):first-child {
  max-width: 13rem;
  padding-left: 1rem;
}
.delivery-table tr + tr,
.delivery-table tbody {
  border-top: 1px solid var(--theme-border);
}
.delivery-table th button {
  text-align: left;
}
.delivery-health {
  display: inline-block;
  border-radius: 0.3rem;
  padding: 0.2rem 0.35rem;
  white-space: nowrap;
  background: var(--theme-subtle);
  color: var(--theme-text);
  font-size: 0.68rem;
  font-weight: 700;
}
.delivery-health.risk {
  color: #942943;
  background: #f9e2e8;
}
.delivery-health.watch {
  color: #794a0e;
  background: #faebc9;
}
.delivery-health.good {
  color: #126450;
  background: #dff1e9;
}
.delivery-risk-count {
  display: block;
  margin-top: 0.23rem;
  color: var(--theme-muted);
}
.delivery-progress {
  display: grid;
  gap: 0.15rem;
  min-width: 5rem;
}
.delivery-progress progress {
  appearance: none;
  width: 100%;
  height: 0.4rem;
  border: 0;
  border-radius: 1rem;
  color: var(--delivery-finished);
  background: var(--theme-subtle);
  overflow: hidden;
}
.delivery-progress progress::-webkit-progress-bar {
  background: var(--theme-subtle);
}
.delivery-progress progress::-webkit-progress-value {
  background: var(--delivery-finished);
}
.delivery-progress progress::-moz-progress-bar {
  background: var(--delivery-finished);
}
.delivery-progress small {
  color: var(--theme-muted);
}
.delivery-sprints .delivery-progress {
  margin-top: 0.4rem;
}
.delivery-activity-icon {
  width: 1.9rem;
}
.delivery-no-projects {
  padding: 2rem;
  display: grid;
  gap: 0.5rem;
  justify-items: start;
}
.delivery-no-projects h2 {
  font-weight: 720;
}
.delivery-no-projects p {
  color: var(--theme-muted);
  font-size: 0.85rem;
}
.delivery-alert {
  display: flex;
  gap: 0.55rem;
  align-items: center;
  border: 1px solid var(--theme-border);
  border-radius: 0.5rem;
  padding: 0.65rem;
  margin-bottom: 0.8rem;
  color: var(--theme-text);
  font-size: 0.8rem;
}
@media (max-width: 1050px) {
  .delivery-grid {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  }
}
@media (max-width: 850px) {
  .delivery-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .delivery-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 480px) {
  .delivery-metric {
    padding: 0.65rem;
    gap: 0.4rem;
  }
  .delivery-metric-icon {
    width: 1.8rem;
  }
  .delivery-metric-icon svg {
    width: 1rem;
  }
  .delivery-hero {
    gap: 0.6rem;
  }
  .delivery-list li {
    gap: 0.4rem;
  }
  .delivery-activity-list li {
    flex-wrap: wrap;
  }
  .delivery-activity-list .delivery-list-meta {
    flex-basis: 100%;
    max-width: none;
    padding-left: 2.3rem;
    text-align: left;
  }
}
`;
