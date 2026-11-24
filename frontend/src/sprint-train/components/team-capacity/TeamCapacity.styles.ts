import styled from "styled-components";

export const CapacityLayout = styled.section`
  color: var(--theme-text);
  min-width: 0;
  display: grid;
  gap: 1rem;
  font-size: 0.8125rem;
  .capacity-heading,
  .capacity-panel-header,
  .capacity-form-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  h2 {
    font-size: 1.125rem;
    font-weight: 750;
  }
  h3 {
    font-size: 0.9rem;
    font-weight: 700;
  }
  .capacity-heading > label {
    display: grid;
    gap: 0.25rem;
    min-width: min(100%, 260px);
  }
  button,
  input,
  select {
    font: inherit;
  }
  button {
    border: 1px solid var(--theme-border);
    border-radius: 7px;
    padding: 0.4rem 0.65rem;
    display: inline-flex;
    gap: 0.35rem;
    align-items: center;
    justify-content: center;
  }
  button:hover:not(:disabled) {
    background: var(--theme-subtle);
  }
  button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
  .capacity-primary {
    background: var(--theme-accent);
    color: #fff;
    border-color: transparent;
  }
  .capacity-primary:hover:not(:disabled) {
    background: var(--theme-accent-hover);
  }
  :is(input, select) {
    min-width: 0;
    border: 1px solid var(--theme-border);
    border-radius: 6px;
    padding: 0.4rem 0.5rem;
    background: var(--theme-surface);
    color: var(--theme-text);
  }
  :is(button, input, select):focus-visible {
    outline: 2px solid var(--theme-focus);
    outline-offset: 2px;
  }
  .capacity-panel {
    min-width: 0;
    padding: 1rem;
    border: 1px solid var(--theme-border);
    border-radius: 12px;
    background: var(--theme-surface);
  }
  .capacity-muted {
    color: var(--theme-muted);
    font-size: 0.75rem;
  }
  .capacity-metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.75rem;
  }
  .capacity-metric {
    padding: 0.85rem 1rem;
    background: var(--theme-surface);
    border: 1px solid var(--theme-border);
    border-radius: 10px;
    display: grid;
    gap: 0.3rem;
  }
  .capacity-metric strong {
    font-size: 1.5rem;
    font-weight: 750;
    line-height: 1.2;
  }
  .capacity-positive {
    color: var(--theme-positive);
  }
  .capacity-warning {
    color: var(--theme-warning);
  }
  .capacity-danger {
    color: var(--theme-danger);
  }
  .capacity-notice {
    padding: 0.65rem 0.85rem;
    border-radius: 8px;
    background: var(--theme-subtle);
    display: flex;
    gap: 0.6rem;
    align-items: center;
    flex-wrap: wrap;
  }
  .capacity-table-wrap {
    overflow: auto;
    margin-top: 0.75rem;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    text-align: left;
    white-space: nowrap;
  }
  caption {
    text-align: left;
    color: var(--theme-muted);
    font-size: 0.75rem;
    margin-bottom: 0.65rem;
  }
  th {
    color: var(--theme-muted);
    font-size: 0.6875rem;
    font-weight: 600;
    padding: 0.55rem 0.65rem;
    border-bottom: 1px solid var(--theme-border);
  }
  td {
    padding: 0.7rem 0.65rem;
    border-bottom: 1px solid var(--theme-border);
    vertical-align: middle;
  }
  tbody tr:last-child td {
    border-bottom: 0;
  }
  td input {
    width: 76px;
  }
  .capacity-person {
    display: flex;
    gap: 0.55rem;
    align-items: center;
  }
  .capacity-person strong {
    font-weight: 650;
  }
  .capacity-person small {
    display: block;
    color: var(--theme-muted);
    font-size: 0.6875rem;
  }
  .capacity-availability {
    display: grid;
    gap: 0.3rem;
  }
  progress {
    width: 100px;
    height: 5px;
    accent-color: var(--theme-accent);
  }
  .capacity-calendar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(52px, 1fr));
    gap: 0.4rem;
    margin-top: 0.75rem;
  }
  .capacity-calendar li {
    min-width: 0;
    padding: 0.5rem 0.25rem;
    border-radius: 7px;
    background: var(--theme-subtle);
    text-align: center;
    display: grid;
    gap: 0.25rem;
  }
  .capacity-calendar li span {
    font-size: 0.65rem;
    color: var(--theme-text);
  }
  .capacity-calendar li[data-state="off"] {
    opacity: 0.6;
  }
  .capacity-calendar li[data-state="reduced"] {
    background: var(--theme-warning-soft);
    color: var(--theme-warning);
  }
  .capacity-calendar li[data-state="gap"] {
    background: var(--theme-danger-soft);
    color: var(--theme-danger);
  }
  .capacity-log-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }
  .capacity-log-list {
    margin-top: 0.75rem;
    display: grid;
  }
  .capacity-log-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 0;
    border-bottom: 1px solid var(--theme-border);
  }
  .capacity-log-list li:last-child {
    border: 0;
  }
  .capacity-log-list small {
    display: block;
    margin-top: 0.2rem;
    color: var(--theme-muted);
    font-size: 0.7rem;
    overflow-wrap: anywhere;
  }
  .capacity-log-list button {
    padding: 0.35rem;
    flex-shrink: 0;
  }
  .capacity-empty {
    padding: 1rem 0;
    color: var(--theme-muted);
  }
  .capacity-entry-form {
    margin-top: 0.8rem;
    padding: 0.8rem;
    border-radius: 8px;
    background: var(--theme-subtle);
  }
  .capacity-entry-form fieldset {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.65rem;
  }
  .capacity-entry-form legend {
    margin-bottom: 0.65rem;
    font-weight: 650;
  }
  .capacity-entry-form label {
    display: grid;
    gap: 0.25rem;
    font-size: 0.75rem;
    min-width: 0;
  }
  .capacity-form-wide {
    grid-column: 1/-1;
  }
  .capacity-form-actions {
    justify-content: flex-end;
  }
  .capacity-refresh {
    margin-left: auto;
  }
  @media (max-width: 800px) {
    .capacity-metrics {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .capacity-log-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  @media (max-width: 400px) {
    .capacity-entry-form fieldset {
      grid-template-columns: minmax(0, 1fr);
    }
  }
`;
