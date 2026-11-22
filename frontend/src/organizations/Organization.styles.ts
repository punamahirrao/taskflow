import { createGlobalStyle } from "styled-components";

export const OrganizationStyles = createGlobalStyle`
.organization-mark {
  color: #3245a0;
}
.organization-company {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.organization-popover {
  z-index: 60;
  width: 285px;
  max-width: calc(100vw - 36px);
  padding: 10px;
}
.organization-popover .organization-menu-heading {
  padding: 5px 8px 10px;
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  color: #bacadd;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}
.organization-options {
  display: grid;
  gap: 4px;
}
.organization-options button,
.organization-settings-link {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 9px;
  padding: 11px 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
}
.organization-options button span {
  flex: 1;
  overflow-wrap: anywhere;
}
.organization-options button:hover,
.organization-options button[aria-current="true"],
.organization-settings-link:hover {
  background: #ffffff15;
}
.organization-settings-link {
  margin-top: 8px;
  border-top: 1px solid #ffffff26;
  border-radius: 0;
  text-decoration: none;
}
.organization-table-heading,
.organization-toolbar,
.organization-form-actions,
.organization-dialog-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.organization-table-heading h3 {
  margin: 0;
  font-size: calc(17px * var(--taskflow-font-scale, 1));
}
.organization-table-heading p,
.organization-form p {
  color: var(--theme-muted, #64748b);
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  line-height: 1.6;
}
.organization-primary,
.organization-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border-radius: 7px;
  padding: 10px 14px;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  font-weight: 600;
  cursor: pointer;
}
.organization-primary {
  border: 1px solid #4338ca;
  background: #4338ca;
  color: #fff;
}
.organization-secondary {
  border: 1px solid var(--theme-border, #dbe1ea);
  background: var(--theme-surface, #fff);
  color: var(--theme-text, #334155);
}
.organization-primary:disabled,
.organization-secondary:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.organization-toolbar {
  margin: 24px 0 18px;
  flex-wrap: wrap;
}
.organization-toolbar .shell-search {
  width: min(100%, 340px);
}
.organization-toolbar > span {
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted, #64748b);
}
.organization-table-scroll {
  position: relative;
  overflow-x: auto;
}
.organization-settings table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: calc(13px * var(--taskflow-font-scale, 1));
}
.organization-settings th {
  color: var(--theme-text);
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  font-weight: 600;
  background: var(--theme-subtle, #f8fafc);
}
.organization-settings th,
.organization-settings td {
  padding: 16px;
  border-bottom: 1px solid var(--theme-border, #e5e9f0);
}
.organization-table-name {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  min-width: 160px;
  overflow-wrap: anywhere;
}
.organization-table-name svg {
  flex-shrink: 0;
  color: #6366f1;
}
.organization-active {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 15px;
  background: #ecfdf5;
  color: #047857;
  padding: 4px 9px;
  font-size: calc(11px * var(--taskflow-font-scale, 1));
}
.organization-inactive {
  color: var(--theme-muted, #64748b);
  font-size: calc(12px * var(--taskflow-font-scale, 1));
}
.organization-empty {
  padding: 30px;
  text-align: center;
  color: var(--theme-muted, #64748b);
}
.organization-dialog {
  width: min(460px, calc(100vw - 32px));
  margin: auto;
  border: 1px solid var(--theme-border, #e2e8f0);
  border-radius: 14px;
  padding: 26px;
  color: var(--theme-text, #0f172a);
  background: var(--theme-surface, #fff);
  box-shadow: 0 20px 80px #0f172a30;
}
.organization-dialog::backdrop {
  background: #0f172a70;
}
.organization-dialog-heading {
  margin-bottom: 22px;
}
.organization-dialog-heading h2 {
  font-size: calc(18px * var(--taskflow-font-scale, 1));
  margin: 0;
}
.organization-dialog-heading > button {
  padding: 4px;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.organization-form {
  display: grid;
  gap: 10px;
}
.organization-form label {
  font-size: calc(13px * var(--taskflow-font-scale, 1));
  font-weight: 600;
}
.organization-form label span {
  color: #dc2626;
}
.organization-form input {
  width: 100%;
  border: 1px solid var(--theme-border, #cbd5e1);
  padding: 11px 12px;
  border-radius: 7px;
  font-size: calc(14px * var(--taskflow-font-scale, 1));
  background: var(--theme-surface, #fff);
  color: inherit;
}
.organization-form input:focus-visible {
  outline: 2px solid #818cf8;
  outline-offset: 2px;
}
.organization-form-actions {
  justify-content: flex-end;
  margin-top: 12px;
}
.organization-error,
.organization-form .organization-error {
  color: #dc2626;
  font-size: calc(13px * var(--taskflow-font-scale, 1));
}
.organization-onboarding {
  display: grid;
  place-content: center;
  min-height: 100vh;
  padding: 24px;
  background: var(--theme-subtle, #f8fafc);
}
.organization-onboarding-card {
  width: min(440px, calc(100vw - 48px));
  padding: 30px;
  border: 1px solid var(--theme-border, #e2e8f0);
  border-radius: 14px;
  background: var(--theme-surface, white);
}
.organization-onboarding-card h1 {
  font-size: calc(24px * var(--taskflow-font-scale, 1));
  margin: 12px 0;
}
.organization-onboarding-card > p {
  color: var(--theme-muted, #64748b);
  margin-bottom: 24px;
}
@media (max-width: 700px) {
  .organization-table-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  .organization-settings th,
  .organization-settings td {
    padding: 12px;
  }
}
`;
