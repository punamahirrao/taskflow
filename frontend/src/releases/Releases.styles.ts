import { createGlobalStyle } from "styled-components";

export const ReleaseStyles = createGlobalStyle`
.release-page {
  --release-action: #4b39bc;
  --release-link: #4b39bc;
  --release-soft: color-mix(in srgb, var(--release-link) 7%, var(--theme-surface));
  max-width: 1500px;
  margin-inline: auto;
  padding: clamp(1rem, 2.5vw, 2.25rem);
  color: var(--theme-text);
}
[data-theme="night"] .release-page {
  --release-link: #c9bfff;
}
.release-header,
.release-panel-heading,
.release-step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.7rem;
}
.release-header {
  margin-bottom: 1rem;
}
.release-header h1 {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  font-weight: 750;
  letter-spacing: -0.04em;
}
.release-header h1 svg,
.release-panel-heading h2 svg {
  color: var(--release-link);
}
.release-header p,
.release-muted {
  color: var(--theme-muted);
  font-size: 0.8rem;
}
.release-header p {
  margin-top: 0.2rem;
}
.release-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-bottom: 1rem;
}
.release-summary span {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid var(--theme-border);
  border-radius: 0.55rem;
  padding: 0.52rem 0.7rem;
  color: var(--theme-text);
  background: var(--release-soft);
  font-size: 0.79rem;
}
.release-summary svg {
  color: var(--release-link);
}
.release-layout {
  display: grid;
  grid-template-columns: minmax(15rem, 0.8fr) minmax(0, 1.6fr);
  gap: 1rem;
  align-items: start;
}
.release-stack {
  display: grid;
  gap: 1rem;
  min-width: 0;
}
.release-panel,
.release-dialog {
  min-width: 0;
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 0.7rem;
}
.release-panel-heading {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--theme-border);
}
.release-panel-heading h2,
.release-links h3 {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  font-weight: 720;
}
.release-panel-heading h2 {
  font-size: 1.05rem;
}
.release-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}
.release-button,
.release-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.43rem 0.65rem;
  border: 1px solid var(--theme-border);
  border-radius: 0.4rem;
  background: var(--theme-surface);
  color: var(--theme-text);
  font-size: 0.78rem;
  font-weight: 650;
}
.release-icon {
  padding: 0.38rem;
}
.release-button:hover,
.release-icon:hover {
  background: var(--release-soft);
}
.release-button.primary {
  background: var(--release-action);
  border-color: var(--release-action);
  color: white;
}
.release-button.primary:hover {
  background: #392991;
}
.release-page button:disabled {
  opacity: 0.55;
  cursor: default;
}
.release-link,
.release-links a {
  color: var(--release-link);
  font-size: 0.76rem;
  font-weight: 680;
}
.release-link:hover,
.release-links a:hover,
.release-task-list a:hover {
  text-decoration: underline;
}
.release-page :is(button, a, select, input, textarea):focus-visible {
  outline: 2px solid var(--release-link);
  outline-offset: 2px;
}
.release-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  padding: 0.7rem 1rem;
}
.release-filters input {
  flex: 1;
  min-width: 10rem;
}
.release-page :is(input:not([type="checkbox"]), select, textarea) {
  border: 1px solid var(--theme-border);
  background: var(--theme-surface);
  color: var(--theme-text);
  border-radius: 0.4rem;
  padding: 0.45rem;
  font-size: 0.78rem;
}
.release-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.release-list li {
  border-top: 1px solid var(--theme-border);
}
.release-list button {
  display: grid;
  gap: 0.36rem;
  width: 100%;
  padding: 0.64rem 1rem;
  text-align: left;
  font-size: 0.82rem;
  overflow-wrap: anywhere;
}
.release-list button > span {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.42rem;
}
.release-list button small,
.release-date {
  font-size: 0.74rem;
  color: var(--theme-text);
}
.release-list button:hover,
.release-list button[aria-pressed="true"] {
  background: var(--release-soft);
}
.release-list button[aria-pressed="true"] {
  box-shadow: inset 3px 0 var(--release-link);
}
.release-badge {
  display: inline-block;
  padding: 0.17rem 0.4rem;
  border-radius: 0.3rem;
  font-size: 0.69rem;
  font-weight: 680;
  color: var(--theme-text);
  background: var(--theme-subtle);
  white-space: nowrap;
}
.release-badge.in_progress {
  background: #e4e7ff;
  color: #36329a;
}
.release-badge.done,
.release-badge.approved,
.release-badge.ready {
  background: #dcf2e9;
  color: #11624c;
}
.release-badge.changes_requested {
  background: #fce4e7;
  color: #902a43;
}
.release-date {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.release-detail-body {
  display: grid;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  overflow-wrap: anywhere;
}
.release-links h3,
.release-task-summary h3,
.release-step-header h3 {
  font-size: 0.85rem;
  font-weight: 710;
}
.release-step-header .release-muted {
  color: color-mix(in srgb, var(--theme-muted) 90%, var(--theme-text));
}
.release-links ul {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.35rem;
}
.release-links a {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.44rem;
  background: var(--release-soft);
  border-radius: 0.35rem;
}
.release-task-summary > div {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.release-task-summary span {
  color: var(--theme-muted);
  font-size: 0.76rem;
}
.release-task-summary progress {
  width: 100%;
  height: 0.48rem;
  accent-color: #26866b;
}
.release-task-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.55rem;
  padding: 0.45rem 0;
  border-top: 1px solid var(--theme-border);
  font-size: 0.77rem;
}
.release-task-list small,
.release-check-list small {
  display: block;
  color: var(--theme-muted);
  font-size: 0.72rem;
}
.release-timeline {
  display: grid;
  gap: 0.5rem;
}
.release-timeline li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.52rem;
  border: 1px solid var(--theme-border);
  border-radius: 0.5rem;
  padding: 0.6rem;
}
.release-timeline li.active {
  background: var(--release-soft);
}
.release-step-number {
  width: 1.5rem;
  height: 1.5rem;
  display: grid;
  place-items: center;
  color: var(--release-link);
  background: var(--theme-subtle);
  border-radius: 50%;
  font-size: 0.73rem;
  font-weight: 720;
}
.release-step-body {
  display: grid;
  gap: 0.4rem;
}
.release-step-body > button {
  justify-self: start;
}
.release-note,
.release-notice {
  padding: 0.45rem 0.6rem;
  background: var(--release-soft);
  border-radius: 0.35rem;
  font-size: 0.79rem;
  white-space: pre-wrap;
}
.release-review {
  display: grid;
  gap: 0.38rem;
}
.release-review label,
.release-form label {
  display: grid;
  gap: 0.28rem;
  font-size: 0.77rem;
  font-weight: 650;
}
.release-review textarea,
.release-form textarea {
  resize: vertical;
}
.release-error {
  color: var(--theme-danger);
  font-size: 0.8rem;
}
.release-dialog {
  margin: auto;
  width: min(42rem, calc(100vw - 1.5rem));
  max-height: calc(100dvh - 1.5rem);
  color: var(--theme-text);
}
.release-dialog::backdrop {
  background: #0d133b88;
}
.release-form {
  display: grid;
  gap: 0.85rem;
  padding: 0.8rem 1rem 1rem;
}
.release-form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}
.release-form legend {
  font-size: 0.82rem;
  font-weight: 720;
  margin-bottom: 0.25rem;
}
.release-form fieldset {
  min-width: 0;
}
.release-form :is(input:not([type="checkbox"]), select, textarea) {
  width: 100%;
  min-width: 0;
}
.release-check-list {
  border: 1px solid var(--theme-border);
  border-radius: 0.4rem;
  max-height: 7.5rem;
  overflow: auto;
  margin-top: 0.3rem;
  padding: 0.4rem;
}
.release-check-list label {
  display: flex;
  gap: 0.4rem;
  align-items: start;
  font-weight: 450;
  padding-block: 0.2rem;
  overflow-wrap: anywhere;
}
.release-check-list input {
  margin-top: 0.16rem;
}
.release-check-list p {
  color: var(--theme-muted);
  font-size: 0.75rem;
}
.release-step-input {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)) auto;
  align-items: end;
  gap: 0.4rem;
  margin: 0.45rem 0;
}
.release-form fieldset > .release-button {
  margin-top: 0.4rem;
}
@media (max-width: 860px) {
  .release-layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .release-list {
    max-height: 16rem;
    overflow: auto;
  }
}
@media (max-width: 500px) {
  .release-form-row,
  .release-step-input {
    grid-template-columns: minmax(0, 1fr);
  }
}
`;
