import { createGlobalStyle } from "styled-components";

export const FontSettingsStyles = createGlobalStyle`
.font-settings-heading {
  display: flex;
  align-items: center;
  gap: 14px;
}
.font-settings-heading > span {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--theme-subtle);
  color: var(--theme-accent);
}
.font-settings-heading h3 {
  font-size: calc(18px * var(--taskflow-font-scale, 1));
  font-weight: 650;
}
.font-settings-heading p {
  margin-top: 5px;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  line-height: 1.7;
  color: var(--theme-muted);
}
.font-defaults {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
  border: 1px solid var(--theme-border);
  background: var(--theme-canvas);
  border-radius: 9px;
  padding: 16px 20px;
  margin: 24px 0;
}
.font-defaults small {
  display: block;
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  letter-spacing: 1px;
  color: var(--theme-muted);
  margin-bottom: 5px;
}
.font-defaults b {
  font-size: calc(14px * var(--taskflow-font-scale, 1));
  font-weight: 600;
}
.font-defaults p {
  margin-left: auto;
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
}
.font-settings-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 30px;
}
.font-controls {
  border: 0;
  min-width: 0;
}
.font-field-heading,
.font-size-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: calc(13px * var(--taskflow-font-scale, 1));
  font-weight: 600;
}
.font-field-heading span,
.font-size-label span {
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  font-weight: 400;
}
.font-controls > input,
.font-size-control {
  width: 100%;
  margin-top: 10px;
  border: 1px solid var(--theme-border);
  border-radius: 7px;
  background: var(--theme-canvas);
  color: var(--theme-text);
  padding: 11px 12px;
  font-size: calc(13px * var(--taskflow-font-scale, 1));
}
.font-controls input:focus-visible {
  outline: 2px solid var(--theme-accent);
  outline-offset: 2px;
}
.font-controls input[aria-invalid="true"] {
  border-color: #dc2626;
}
.font-help {
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  line-height: 1.8;
  margin-top: 9px;
}
.font-load,
.font-reset,
.font-apply {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 13px;
  border-radius: 7px;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  font-weight: 600;
  cursor: pointer;
}
.font-load,
.font-reset {
  border: 1px solid var(--theme-border);
  background: var(--theme-surface);
  color: var(--theme-text);
}
.font-load {
  margin-top: 17px;
}
.font-apply {
  border: 1px solid var(--theme-accent);
  background: var(--theme-accent);
  color: #fff;
}
.font-load:disabled,
.font-reset:disabled,
.font-apply:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.font-size-label {
  margin-top: 25px;
}
.font-size-control {
  display: flex;
  align-items: center;
  width: 120px;
}
.font-size-control input {
  width: 100%;
  min-width: 0;
  background: transparent;
}
.font-size-control > span {
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
}
.font-size-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 14px;
}
.font-size-presets button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 47px;
  border: 1px solid var(--theme-border);
  border-radius: 6px;
  padding: 6px 9px;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  cursor: pointer;
  background: var(--theme-canvas);
}
.font-size-presets button[aria-pressed="true"] {
  border-color: var(--theme-accent);
  color: var(--theme-accent);
  background: var(--theme-subtle);
}
.font-size-presets small {
  font-size: calc(8px * var(--taskflow-font-scale, 1));
  margin-top: 3px;
}
.font-validation {
  color: #dc2626;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  margin-top: 8px;
}
.font-list-message {
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  line-height: 1.7;
  margin-top: 9px;
}
.font-preview-panel {
  min-width: 0;
  border: 1px solid var(--theme-border);
  border-radius: 10px;
  background: var(--theme-canvas);
  overflow: hidden;
}
.font-preview-heading {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  padding: 15px 18px;
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  border-bottom: 1px solid var(--theme-border);
}
.font-preview-heading > span:first-child {
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  letter-spacing: 1.1px;
}
.font-preview {
  padding: 26px;
  color: var(--theme-text);
  line-height: 1.75;
  overflow-wrap: anywhere;
}
.font-preview p {
  margin-bottom: 18px;
}
.font-preview-alphabet {
  font-size: 2.4em;
  color: var(--theme-accent);
  line-height: 1.3;
}
.font-preview h4 {
  font-size: 1.35em;
  font-weight: 650;
  margin-bottom: 16px;
}
.font-preview-numbers {
  color: var(--theme-muted);
}
.font-preview-sample {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px;
  border: 1px solid var(--theme-border);
  border-radius: 7px;
  background: var(--theme-surface);
}
.font-preview-sample svg {
  flex-shrink: 0;
  color: var(--theme-positive);
}
.font-preview-note {
  padding: 0 20px 18px;
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  line-height: 1.7;
  color: var(--theme-muted);
}
.font-settings-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 26px;
  padding-top: 20px;
  border-top: 1px solid var(--theme-border);
  font-size: calc(12px * var(--taskflow-font-scale, 1));
}
.font-settings-footer > div:last-child {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-left: auto;
}
@media (max-width: 1100px) {
  .font-settings-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .font-defaults p {
    margin-left: 0;
  }
}
`;
