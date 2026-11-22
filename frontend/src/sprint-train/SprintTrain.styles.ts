import { createGlobalStyle } from "styled-components";

export const SprintTrainStyles = createGlobalStyle`
.sprint-train-page {
  --sprint-page-gutter: clamp(1rem, 2vw, 1.5rem);
  --sprint-drawer-width: clamp(340px, 31vw, 440px);
  min-height: calc(100dvh - var(--shell-header-height, 0px));
  padding: var(--sprint-page-gutter);
}
.sprint-train-page.is-backlog-open {
  padding-right: calc(var(--sprint-drawer-width) + var(--sprint-page-gutter));
}
.sprint-train-layout {
  min-width: 0;
  max-width: 1800px;
  margin-inline: auto;
}
.sprint-train-actions,
.sprint-train-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}
.sprint-train-actions {
  margin-left: auto;
  justify-content: flex-end;
}
.sprint-train-toolbar {
  justify-content: space-between;
}
.sprint-pipeline {
  min-width: 0;
}
.sprint-pipeline-track {
  display: grid;
  grid-template-columns: repeat(var(--sprint-columns, 3), minmax(0, 1fr));
  gap: 0.75rem;
}
.sprint-pipeline-track > [role="button"] {
  min-width: 0;
  overflow-wrap: anywhere;
}
.sprint-pipeline-track > .sprint-selected {
  border: 3px solid var(--theme-accent);
  padding: calc(0.75rem - 2px);
}
.sprint-backlog-card-top {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.45rem;
}
.sprint-backlog-card-badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  flex: 1;
  min-width: 0;
}
.sprint-backlog-card-points {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto;
}
.sprint-backlog-card-label {
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  overflow-wrap: anywhere;
}
.sprint-backlog-metric small {
  display: block;
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  font-weight: 500;
  text-transform: none;
}
.sprint-backlog-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
.sprint-backlog-summary > * {
  min-height: 2.75rem;
}
.sprint-backlog-summary .sprint-backlog-metric {
  min-width: 0;
  padding: 0.25rem 0.5rem;
}
.sprint-backlog-points {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 0.1rem;
  font-size: 0.8125rem;
  line-height: 1.2;
}
.sprint-backlog-points p {
  font-size: 0.75rem;
  color: var(--theme-muted);
}
.sprint-backlog-wishlist {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.1rem;
  font-size: 0.8125rem;
  line-height: 1.2;
  cursor: pointer;
}
.sprint-backlog-wishlist > span {
  font-size: 0.7rem;
  font-weight: 650;
}
.sprint-backlog-wishlist:hover,
.sprint-backlog-wishlist[aria-pressed="true"] {
  box-shadow: inset 0 0 0 1px var(--theme-accent);
}
.sprint-backlog-wishlist:focus-visible {
  outline: 2px solid var(--theme-accent);
  outline-offset: 2px;
}
.sprint-wishlist-toggle,
.sprint-unassigned-avatar {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: var(--theme-muted);
}
.sprint-unassigned-avatar {
  background: var(--theme-subtle);
}
.sprint-wishlist-toggle[aria-pressed="true"] {
  color: var(--theme-accent);
}
.sprint-wishlist-toggle:hover {
  background: var(--theme-subtle);
}
.sprint-stories-heading {
  flex: 1;
  min-width: 0;
}
.sprint-planning-details {
  margin-top: 0.5rem;
  min-width: 0;
}
.sprint-planning-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
}
.sprint-planning-summary > button {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
  font-size: 0.75rem;
  text-align: left;
  color: var(--theme-muted);
}
.sprint-planning-summary > button span {
  overflow-wrap: anywhere;
}
.sprint-planning-summary > button svg {
  flex-shrink: 0;
}
.sprint-planning-summary > button:not(:disabled):hover {
  color: var(--theme-text);
  text-decoration: underline;
}
.sprint-planning-form {
  display: grid;
  gap: 0.6rem;
  font-size: 0.75rem;
}
.sprint-planning-form label {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
  text-align: left;
}
.sprint-planning-form :is(input, textarea) {
  min-width: 0;
  width: 100%;
  border: 1px solid var(--theme-border);
  border-radius: 0.4rem;
  padding: 0.45rem;
  background: var(--theme-surface);
  color: var(--theme-text);
}
.sprint-planning-dates {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}
.sprint-planning-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.sprint-planning-actions button {
  border: 1px solid var(--theme-border);
  border-radius: 0.35rem;
  padding: 0.35rem 0.6rem;
}
.sprint-planning-actions button[type="submit"] {
  background: #4f46e5;
  color: white;
}
.sprint-backlog-add-story {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
  min-height: 2.5rem;
  min-width: 0;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 650;
  border-radius: 0.5rem;
  background: #4f46e5;
  color: #fff;
}
.sprint-backlog-add-story:hover:not(:disabled) {
  background: #4338ca;
}
.sprint-backlog-add-story:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.sprint-backlog-drawer,
.sprint-story-drawer {
  position: fixed;
  top: var(--shell-header-height, 0px);
  bottom: 0;
  min-width: 0;
  min-height: 0;
}
.sprint-backlog-drawer {
  z-index: 30;
  right: 0;
  display: flex;
  flex-direction: column;
  width: min(var(--sprint-drawer-width), calc(100vw - var(--shell-sidebar-width, 0px)));
}
.sprint-story-drawer {
  z-index: 35;
  right: 0;
  width: min(840px, calc(100vw - var(--shell-sidebar-width, 0px)));
}
.sprint-story-drawer.with-backlog {
  right: var(--sprint-drawer-width);
  width: min(840px, calc(100vw - var(--shell-sidebar-width, 0px) - var(--sprint-drawer-width)));
}
.sprint-backlog-header {
  flex-shrink: 0;
}
.sprint-backlog-drawer.is-creating-story .sprint-backlog-header {
  max-height: 70%;
  overflow-y: auto;
}
.sprint-story-drawer > header,
.sprint-story-drawer > nav {
  flex-shrink: 0;
}
@media (max-width: 1100px) {
  .sprint-train-page.is-backlog-open {
    padding-right: var(--sprint-page-gutter);
  }
  .sprint-story-drawer.with-backlog {
    right: 0;
    width: min(840px, calc(100vw - var(--shell-sidebar-width, 0px)));
  }
}
@media (max-height: 650px) {
  .sprint-backlog-header {
    max-height: 65%;
    overflow-y: auto;
  }
}
@media (max-width: 650px) {
  .sprint-backlog-drawer,
  .sprint-story-drawer,
  .sprint-story-drawer.with-backlog {
    right: 0;
    width: 100vw;
  }
  .sprint-backlog-drawer {
    z-index: 51;
  }
  .sprint-story-drawer {
    z-index: 52;
  }
  .sprint-pipeline-track {
    grid-template-columns: minmax(0, 1fr);
  }
}
/* Sprint Train page styles: sprint backlog drawer. */
html:not([data-theme="night"]) .sprint-backlog-drawer {
  border-color: #e2e8f0;
  background-color: #ffffff !important;
  color: #0f172a;
}
html:not([data-theme="night"]) .sprint-backlog-header {
  border-color: #e2e8f0;
}
html:not([data-theme="night"]) .sprint-backlog-metric,
html:not([data-theme="night"]) .sprint-backlog-search,
html:not([data-theme="night"]) .sprint-backlog-filter {
  border-color: #e2e8f0;
  background-color: #f8fafc;
}
html:not([data-theme="night"]) .sprint-backlog-card {
  border-color: #e2e8f0;
  background-color: #ffffff;
}
html:not([data-theme="night"]) .sprint-backlog-card:hover {
  border-color: #818cf8;
}
html:not([data-theme="night"]) .sprint-backlog-category {
  background-color: #f1f5f9;
  color: #475569;
}
html:not([data-theme="night"]) .sprint-backlog-title {
  color: #1e293b;
}
html:not([data-theme="night"]) .sprint-backlog-assignee {
  color: #64748b;
}
html:not([data-theme="night"]) .sprint-backlog-drawer :is(.text-indigo-300, .text-indigo-200) {
  color: #4338ca;
}
html:not([data-theme="night"]) .sprint-backlog-metric p:first-child {
  color: #64748b;
}
html:not([data-theme="night"]) .sprint-backlog-card .text-amber-300 {
  color: #92400e;
}

html[data-theme="night"] .sprint-backlog-drawer {
  border-color: var(--theme-border);
  background-color: var(--theme-canvas) !important;
  color: var(--theme-text);
}
html[data-theme="night"] .sprint-backlog-header {
  border-color: var(--theme-border);
}
html[data-theme="night"] .sprint-backlog-metric,
html[data-theme="night"] .sprint-backlog-search,
html[data-theme="night"] .sprint-backlog-filter {
  border-color: var(--theme-border);
  background-color: var(--theme-surface);
  color: var(--theme-text);
}
html[data-theme="night"] .sprint-backlog-search::placeholder {
  color: #94a3b8;
}
html[data-theme="night"] .sprint-backlog-card {
  border-color: var(--theme-border);
  background-color: var(--theme-surface);
}
html[data-theme="night"] .sprint-backlog-card:hover {
  border-color: var(--theme-selection);
}
html[data-theme="night"] .sprint-backlog-category {
  background-color: var(--theme-secondary);
  color: #c7d2fe;
}
html[data-theme="night"] .sprint-backlog-title {
  color: var(--theme-text);
}
html[data-theme="night"] .sprint-backlog-assignee {
  color: var(--theme-muted);
}
`;
