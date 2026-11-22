import { createGlobalStyle } from "styled-components";

export const MyWorkStyles = createGlobalStyle`
.my-work {
  --work-action: #3158d3;
  --work-link: #244cce;
  --work-hover: color-mix(in srgb, var(--work-action) 7%, var(--theme-surface));
  --work-header: color-mix(in srgb, var(--work-action) 4%, var(--theme-subtle));
  min-height: 100%;
  max-width: 1600px;
  margin-inline: auto;
  padding: clamp(1rem, 2.4vw, 2rem);
  color: var(--theme-text);
}

[data-theme="night"] .my-work {
  --work-link: #aebfff;
}
.my-work-intro h1 {
  font-size: 2rem;
  font-weight: 750;
  letter-spacing: -0.045em;
  line-height: 1.1;
}
.my-work-intro p {
  margin-block: 0.45rem 0.85rem;
  color: var(--theme-muted);
  font-size: 0.88rem;
}
.my-work-nav {
  display: flex;
  gap: 0.45rem;
  overflow-x: auto;
  border-bottom: 1px solid var(--theme-border);
  margin-bottom: 1rem;
}
.my-work-nav a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.75rem 0.7rem;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  color: var(--theme-muted);
  font-size: 0.8rem;
  font-weight: 650;
}
.my-work-nav a:hover,
.my-work-nav a[aria-current="page"] {
  color: var(--work-link);
}
.my-work-nav a[aria-current="page"] {
  border-bottom-color: var(--work-action);
}
.my-work button:focus-visible,
.my-work a:focus-visible,
.my-work input:focus-visible,
.my-work select:focus-visible,
.my-work textarea:focus-visible {
  outline: 2px solid var(--work-link);
  outline-offset: 2px;
}
.my-work-content {
  display: grid;
  gap: 0.9rem;
}
.my-work-metrics {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.75rem;
}
.my-work-metric {
  --metric-bg: #ede4fc;
  --metric-fg: #6b2abd;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
  text-align: left;
  padding: 0.8rem;
  border: 1px solid color-mix(in srgb, var(--metric-fg) 18%, var(--theme-border));
  border-radius: 0.7rem;
  background: color-mix(in srgb, var(--metric-fg) 4%, var(--theme-surface));
}
.my-work-metric.blue {
  --metric-bg: #deebff;
  --metric-fg: #2151b8;
}
.my-work-metric.rose {
  --metric-bg: #fce1e9;
  --metric-fg: #ad2146;
}
.my-work-metric.teal {
  --metric-bg: #d4f3e6;
  --metric-fg: #08644c;
}
.my-work-metric.amber {
  --metric-bg: #faedce;
  --metric-fg: #8b4c06;
}
.my-work-metric:hover {
  border-color: var(--metric-fg);
}
.my-work-metric-icon {
  display: grid;
  place-items: center;
  width: 2.7rem;
  height: 2.7rem;
  flex-shrink: 0;
  border-radius: 0.65rem;
  background: var(--metric-bg);
  color: var(--metric-fg);
}
.my-work-metric strong,
.my-work-metric small {
  display: block;
}
.my-work-metric strong {
  font-size: 1.45rem;
  line-height: 1;
  letter-spacing: -0.04em;
}
.my-work-metric small {
  font-size: 0.76rem;
  line-height: 1.25;
  margin-top: 0.3rem;
}

.my-work-main-grid {
  display: grid;
  grid-template-columns: minmax(0, 2.15fr) minmax(0, 1fr);
  align-items: start;
  gap: 0.9rem;
}
.my-work-bottom-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: start;
  gap: 0.9rem;
}
.my-work-mentions {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  align-items: start;
  gap: 0.9rem;
}
.my-work-panel {
  min-width: 0;
  border: 1px solid var(--theme-border);
  border-radius: 0.7rem;
  background: var(--theme-surface);
  box-shadow: 0 2px 6px rgb(19 38 80 / 4%);
}
.my-work-panel-heading,
.my-work-agenda-toolbar,
.my-work-panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.55rem;
  padding: 0.72rem 0.85rem;
}
.my-work-panel-heading h2 {
  font-size: 0.93rem;
  font-weight: 740;
  letter-spacing: -0.017em;
}
.my-work-panel-heading h2 span {
  color: var(--theme-muted);
  font-weight: 500;
  font-size: 0.77rem;
}
.my-work-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}
.my-work-button,
.my-work-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border: 1px solid var(--theme-border);
  background: var(--theme-surface);
  color: var(--theme-text);
  border-radius: 0.43rem;
  padding: 0.42rem 0.65rem;
  font-size: 0.76rem;
  font-weight: 650;
  white-space: nowrap;
}
.my-work-icon-button {
  padding: 0.35rem;
}
.my-work-button.compact {
  padding: 0.32rem 0.55rem;
}
.my-work-button:hover,
.my-work-icon-button:hover {
  background: var(--work-hover);
}
.my-work-button.primary {
  background: var(--work-action);
  color: #fff;
  border-color: var(--work-action);
}
.my-work-button.primary:hover {
  background: #2647b4;
}
.my-work button:disabled {
  opacity: 0.55;
  cursor: default;
}
.my-work-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--work-link);
  font-size: 0.75rem;
  font-weight: 650;
}
.my-work-link:hover,
.my-work-item-link:hover,
.my-work-task-title:hover,
.my-work-project-link:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.my-work-task-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.55rem;
  padding: 0 0.85rem 0.65rem;
}
.my-work-filters {
  display: flex;
  gap: 0.32rem;
  flex-wrap: wrap;
}
.my-work-filters button {
  padding: 0.3rem 0.48rem;
  border-radius: 0.4rem;
  background: var(--theme-subtle);
  font-size: 0.7rem;
  color: var(--theme-text);
  white-space: nowrap;
}
.my-work-filters button[aria-pressed="true"] {
  color: var(--work-link);
  background: color-mix(in srgb, var(--work-action) 16%, var(--theme-surface));
  font-weight: 700;
}
.my-work-filters span {
  margin-left: 0.16rem;
  font-size: 0.65rem;
}
.my-work-search {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  margin-left: auto;
  padding: 0.3rem 0.48rem;
  border: 1px solid var(--theme-border);
  border-radius: 0.4rem;
  color: var(--theme-muted);
  font-size: 0.75rem;
}
.my-work-search input {
  min-width: 0;
  width: 7.8rem;
  color: var(--theme-text);
}
.my-work-table-scroll {
  overflow: auto;
}
.my-work-table {
  width: 100%;
  min-width: 36rem;
  border-collapse: collapse;
  font-size: 0.75rem;
  text-align: left;
}
.my-work-table thead {
  background: var(--work-header);
}
.my-work-table th,
.my-work-table td {
  padding: 0.52rem 0.55rem;
  vertical-align: middle;
}
.my-work-table th:first-child,
.my-work-table td:first-child {
  padding-left: 0.85rem;
  width: 2.3rem;
}
.my-work-table td {
  border-top: 1px solid var(--theme-border);
}
.my-work-table tbody tr:hover {
  background: var(--work-hover);
}
.my-work-task-title {
  text-align: left;
  font-weight: 650;
}
.my-work-project-link,
.my-work-muted {
  color: var(--theme-muted);
}
.my-work-complete {
  display: grid;
  place-items: center;
  width: 1.05rem;
  height: 1.05rem;
  border: 1px solid var(--theme-muted);
  border-radius: 0.23rem;
}
.my-work-complete:hover {
  border-color: var(--work-action);
  background: var(--work-hover);
}
.my-work-blocked {
  display: inline;
  margin-left: 0.3rem;
  color: var(--theme-danger);
}
.my-work-due {
  color: var(--theme-danger);
  font-weight: 650;
}
.my-work-badge,
.my-work-demo {
  display: inline-block;
  border-radius: 0.33rem;
  padding: 0.17rem 0.4rem;
  background: var(--theme-subtle);
  color: var(--theme-text);
  font-size: 0.69rem;
  font-weight: 650;
  text-transform: capitalize;
  white-space: nowrap;
}
.my-work-badge.priority-urgent,
.my-work-badge.priority-high {
  background: #fbdce5;
  color: #992340;
}
.my-work-badge.priority-medium,
.my-work-badge.status-review,
.my-work-demo {
  background: #faedca;
  color: #774708;
}
.my-work-badge.priority-low,
.my-work-badge.status-done {
  background: #d6f2e6;
  color: #065c43;
}
.my-work-badge.status-in_progress,
.my-work-badge.status-todo {
  background: #dee8fe;
  color: #2549a8;
}

.my-work-agenda-toolbar {
  background: var(--work-header);
  font-size: 0.77rem;
}
.my-work-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.my-work-list li {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
  border-top: 1px solid var(--theme-border);
  padding: 0.64rem 0.85rem;
  font-size: 0.75rem;
}
.my-work-list time {
  color: var(--theme-muted);
  white-space: nowrap;
}
.my-work-dot {
  width: 0.48rem;
  height: 0.48rem;
  flex-shrink: 0;
  border-radius: 50%;
  background: #4372d9;
}
.my-work-dot.high,
.my-work-dot.urgent {
  background: #dc435d;
}
.my-work-dot.medium {
  background: #b6770c;
}
.my-work-item-link,
.my-work-list-label {
  display: block;
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
  text-align: left;
  font-weight: 650;
}
.my-work-item-link small,
.my-work-list-label small {
  display: block;
  margin-top: 0.18rem;
  color: var(--theme-muted);
  font-weight: 500;
}
.my-work-list-icon {
  color: var(--work-link);
  flex-shrink: 0;
}
.my-work-avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 1.95rem;
  height: 1.95rem;
  border-radius: 50%;
  background: #e2eaff;
  color: #2647ae;
  font-size: 0.64rem;
  font-weight: 750;
}
.my-work-avatar.preview {
  background: #f9ead2;
  color: #864e10;
}
.my-work-agenda-empty,
.my-work-empty {
  padding: 1rem 0.85rem;
  color: var(--theme-muted);
  font-size: 0.8rem;
}
.my-work-agenda-empty {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}
.my-work-agenda-empty svg {
  flex-shrink: 0;
  color: var(--work-link);
}
.my-work-error {
  border: 1px solid var(--theme-danger);
  border-radius: 0.43rem;
  padding: 0.6rem 0.8rem;
  margin-bottom: 0.9rem;
  font-size: 0.8rem;
}
.my-work-week {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.35rem;
  padding: 0.65rem 0.85rem;
}
.my-work-week button {
  display: grid;
  gap: 0.2rem;
  padding: 0.5rem 0.1rem;
  text-align: center;
  border: 1px solid var(--theme-border);
  border-radius: 0.45rem;
  font-size: 0.75rem;
}
.my-work-week button[aria-pressed="true"] {
  background: var(--work-hover);
  border-color: var(--work-action);
  color: var(--work-link);
}
.my-work-week small {
  color: var(--theme-muted);
  font-size: 0.68rem;
}
.my-work-panel-footer {
  border-top: 1px solid var(--theme-border);
  color: var(--theme-muted);
  font-size: 0.72rem;
}
.my-work-panel-footer span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.my-work-time {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.4rem 0.85rem 1rem;
}
.my-work-time-ring {
  display: grid;
  place-items: center;
  width: 6rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--theme-subtle);
  flex-shrink: 0;
}
.my-work-time-ring > div {
  display: grid;
  justify-items: center;
  align-content: center;
  width: 82%;
  height: 82%;
  border-radius: 50%;
  background: var(--theme-surface);
}
.my-work-time-ring strong {
  font-size: 1.22rem;
  letter-spacing: -0.05em;
}
.my-work-time-ring small {
  color: var(--theme-muted);
  font-size: 0.69rem;
}
.my-work-time ul {
  flex: 1;
  max-width: 18rem;
  display: grid;
  gap: 0.43rem;
  font-size: 0.74rem;
}
.my-work-time li {
  display: grid;
  grid-template-columns: 0.53rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.4rem;
}
.my-work-time li span:first-child {
  width: 0.53rem;
  height: 0.53rem;
  border-radius: 50%;
}
.my-work-dialog {
  margin: auto;
  width: min(32rem, calc(100vw - 2rem));
  max-height: calc(100dvh - 2rem);
  background: var(--theme-surface);
  color: var(--theme-text);
  border: 1px solid var(--theme-border);
  border-radius: 0.8rem;
  box-shadow: 0 18px 48px #101c4250;
}
.my-work-dialog::backdrop {
  background: #101c4266;
}
.my-work-dialog .my-work-panel-heading {
  border-bottom: 1px solid var(--theme-border);
}
.my-work-form {
  display: grid;
  gap: 0.75rem;
  padding: 0.85rem;
  font-size: 0.8rem;
}
.my-work-form label {
  display: grid;
  gap: 0.25rem;
  font-weight: 600;
}
.my-work-form label :is(input, textarea, select) {
  width: 100%;
  min-width: 0;
  border: 1px solid var(--theme-border);
  border-radius: 0.4rem;
  padding: 0.5rem;
  background: var(--theme-surface);
  color: var(--theme-text);
  font-weight: 450;
}
.my-work-form-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
}
.my-work-form footer {
  justify-content: flex-end;
}
@media (max-width: 1130px) {
  .my-work-main-grid {
    grid-template-columns: minmax(0, 1.85fr) minmax(0, 1fr);
  }
  .my-work-metric {
    padding: 0.55rem;
    gap: 0.48rem;
  }
  .my-work-metric-icon {
    width: 2.1rem;
    height: 2.1rem;
  }
}
@media (max-width: 960px) {
  .my-work-main-grid,
  .my-work-mentions {
    grid-template-columns: minmax(0, 1fr);
  }
  .my-work-bottom-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 700px) {
  .my-work-bottom-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .my-work-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .my-work-search {
    margin-left: 0;
  }
}
`;
