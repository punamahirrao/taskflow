import { createGlobalStyle } from "styled-components";

export const ConfigureTaskflowStyles = createGlobalStyle`
.configure-heading {
  display: flex;
  align-items: center;
  gap: 13px;
}
.configure-heading-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 11px;
  flex-shrink: 0;
  background: var(--theme-subtle);
  color: var(--theme-accent);
}
.configure-heading h3 {
  font-size: calc(17px * var(--taskflow-font-scale, 1));
  font-weight: 650;
}
.configure-heading p {
  margin-top: 6px;
  max-width: 600px;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  line-height: 1.7;
  color: var(--theme-muted);
}
.configure-count {
  margin-left: auto;
  flex-shrink: 0;
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
}
.configure-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 25px 0 18px;
}
.configure-toolbar .shell-search {
  width: min(100%, 300px);
}
.configure-toolbar > span {
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
}
.configure-fields {
  min-width: 0;
  border: 0;
}
.configure-table-scroll {
  position: relative;
  overflow-x: auto;
  border: 1px solid var(--theme-border);
  border-radius: 8px;
}
.configure-taskflow table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
}
.configure-taskflow thead {
  background: var(--theme-subtle);
  color: var(--theme-muted);
}
.configure-taskflow th,
.configure-taskflow td {
  padding: 13px 16px;
  border-bottom: 1px solid var(--theme-border);
}
.configure-taskflow th {
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  font-weight: 600;
}
.configure-taskflow tbody th {
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  min-width: 175px;
  width: 33%;
}
.configure-original {
  display: flex;
  align-items: center;
  gap: 10px;
}
.configure-original > svg {
  flex-shrink: 0;
  color: var(--theme-muted);
}
.configure-original small {
  display: block;
  margin-top: 4px;
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  font-weight: 400;
  color: var(--theme-muted);
}
.configure-current-icon {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
  padding: 8px 10px;
  border: 1px solid var(--theme-border);
  border-radius: 7px;
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  color: var(--theme-text);
  background: var(--theme-canvas);
  cursor: pointer;
}
.configure-current-icon:hover {
  border-color: var(--theme-accent);
  color: var(--theme-accent);
}
.configure-name-input {
  width: 100%;
  min-width: 150px;
  padding: 9px 11px;
  border: 1px solid var(--theme-border);
  border-radius: 6px;
  color: var(--theme-text);
  background: var(--theme-canvas);
  font-size: calc(12px * var(--taskflow-font-scale, 1));
}
.configure-name-input:focus-visible {
  outline: 2px solid var(--theme-accent);
  outline-offset: 1px;
}
.configure-name-input[aria-invalid="true"] {
  border-color: #dc2626;
}
.configure-expand {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 5px;
  cursor: pointer;
  color: var(--theme-muted);
}
.configure-expand:hover {
  color: var(--theme-accent);
  background: var(--theme-subtle);
}
.configure-taskflow tr.is-expanded {
  background: color-mix(in srgb, var(--theme-accent) 4%, var(--theme-surface));
}
.configure-taskflow .configure-expanded-row > td {
  padding: 0;
}
.configure-expanded-content {
  padding: 20px;
  background: var(--theme-canvas);
}
.configure-row-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
}
.configure-row-summary > div > span {
  display: block;
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  letter-spacing: 1.1px;
  color: var(--theme-muted);
  margin-bottom: 9px;
}
.configure-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 220px;
  max-width: 100%;
  background: #20374f;
  color: #f1f5f9;
  padding: 12px;
  border-radius: 7px;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  overflow-wrap: anywhere;
}
.configure-preview svg {
  flex-shrink: 0;
}
.configure-preview b {
  min-width: 0;
}
.configure-text-button {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  color: var(--theme-accent);
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  cursor: pointer;
}
.configure-text-button:disabled {
  opacity: 0.45;
  cursor: default;
}
.configure-picker-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 14px;
}
.configure-picker-heading h4 {
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  font-weight: 600;
}
.configure-picker-heading .shell-search {
  width: 220px;
  background: var(--theme-surface);
}
.configure-icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(86px, 1fr));
  gap: 8px;
  max-height: 285px;
  overflow-y: auto;
  padding: 3px;
}
.configure-icon-option {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 6px;
  border: 1px solid var(--theme-border);
  border-radius: 7px;
  background: var(--theme-surface);
  cursor: pointer;
  color: var(--theme-muted);
  text-align: center;
}
.configure-icon-option input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
}
.configure-icon-option span {
  font-size: calc(10px * var(--taskflow-font-scale, 1));
}
.configure-icon-option:hover,
.configure-icon-option.selected {
  color: var(--theme-accent);
  border-color: var(--theme-accent);
  background: color-mix(in srgb, var(--theme-accent) 7%, var(--theme-surface));
}
.configure-icon-option:focus-within {
  outline: 2px solid var(--theme-accent);
  outline-offset: 2px;
}
.configure-footer {
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 0 0;
  margin-top: 6px;
  background: var(--theme-surface);
  border-top: 1px solid var(--theme-border);
}
.configure-footer p {
  font-size: calc(12px * var(--taskflow-font-scale, 1));
}
.configure-footer small {
  display: block;
  margin-top: 5px;
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
}
.configure-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}
.configure-save,
.configure-reset {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 7px;
  border-radius: 7px;
  padding: 10px 13px;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  font-weight: 600;
  cursor: pointer;
}
.configure-save {
  background: var(--theme-accent);
  color: white;
  border: 1px solid var(--theme-accent);
}
.configure-reset {
  background: var(--theme-surface);
  color: var(--theme-text);
  border: 1px solid var(--theme-border);
}
.configure-save:disabled,
.configure-reset:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.configure-error {
  color: #dc2626;
}
.configure-empty {
  padding: 25px;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  text-align: center;
}
@media (max-width: 900px) {
  .configure-count {
    display: none;
  }
  .configure-footer {
    flex-wrap: wrap;
  }
  .configure-actions {
    margin-left: auto;
  }
}
@media (max-width: 600px) {
  .configure-taskflow th,
  .configure-taskflow td {
    padding: 10px;
  }
  .configure-heading {
    align-items: flex-start;
  }
  .configure-picker-heading,
  .configure-row-summary {
    align-items: flex-start;
    flex-direction: column;
  }
  .configure-heading p {
    font-size: calc(11px * var(--taskflow-font-scale, 1));
  }
}

.configure-icon-swatch {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 11px;
}
.configure-colors {
  border: 0;
  margin: 0 0 22px;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
}
.configure-colors legend {
  margin-bottom: 10px;
  font-weight: 600;
}
.configure-colors > div {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}
.configure-colors label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.configure-colors label > span {
  width: 15px;
  height: 15px;
  border-radius: 50%;
}
`;
