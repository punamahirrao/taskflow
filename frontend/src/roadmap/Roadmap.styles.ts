import { createGlobalStyle } from "styled-components";

export const RoadmapStyles = createGlobalStyle`
.roadmap-page {
  padding-block: 25px 36px;
  background: var(--theme-canvas);
  min-width: 0;
}
.roadmap-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}
.roadmap-title-group {
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
}
.roadmap-page-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 12px;
  color: white;
  background: linear-gradient(145deg, #a18aea, #7560cb);
  box-shadow: 0 3px 8px #6851b822;
}
.roadmap-title-line {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.roadmap-title-line h1 {
  font-size: calc(25px * var(--taskflow-font-scale, 1));
  font-weight: 720;
  letter-spacing: -0.8px;
  line-height: 1.2;
}
.roadmap-live-badge {
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  font-weight: 600;
  color: #206a54;
  background: #e2f5ec;
  border: 1px solid #ceebdd;
  padding: 3px 7px;
  border-radius: 5px;
}
.roadmap-title-group p {
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  margin-top: 6px;
  line-height: 1.6;
}
.roadmap-project-picker {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--theme-muted);
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  min-width: 0;
}
.roadmap-project-picker select {
  min-width: 0;
  border: 1px solid var(--theme-border);
  border-radius: 7px;
  background: var(--theme-surface);
  padding: 9px 30px 9px 12px;
  color: var(--theme-text);
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  max-width: 260px;
}
.roadmap-page-breadcrumb {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--theme-muted);
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  border-bottom: 1px solid var(--theme-border);
  padding-bottom: 17px;
  margin-bottom: 20px;
}
.roadmap-page-breadcrumb b {
  font-weight: 600;
  color: var(--theme-accent);
}
.roadmap-content {
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  background: var(--theme-surface);
  overflow: hidden;
  min-width: 0;
  padding: 22px;
}
.roadmap-plan-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 22px;
}
.roadmap-eyebrow {
  color: #91a0b7;
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  letter-spacing: 1.6px;
  font-weight: 650;
  margin-bottom: 5px;
}
.roadmap-plan-heading h2 {
  font-size: calc(20px * var(--taskflow-font-scale, 1));
  font-weight: 670;
  letter-spacing: -0.4px;
}
.roadmap-plan-heading p:last-child {
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  margin-top: 6px;
  line-height: 1.6;
}
.roadmap-plan-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
}
.roadmap-date-range {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  padding: 8px 10px;
  border: 1px solid var(--theme-border);
  border-radius: 6px;
  background: var(--theme-canvas);
}
.roadmap-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid var(--theme-border);
  border-radius: 6px;
  padding: 8px 11px;
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  font-weight: 600;
  color: var(--theme-text);
  background: var(--theme-surface);
  cursor: pointer;
  white-space: nowrap;
}
.roadmap-button:hover:enabled {
  border-color: var(--theme-accent);
  color: var(--theme-accent);
}
.roadmap-button.primary {
  background: var(--theme-accent);
  border-color: var(--theme-accent);
  color: white;
  box-shadow: 0 2px 5px #6550b71a;
}
.roadmap-button.primary:hover:enabled {
  color: white;
  background: var(--theme-accent-hover);
}
.roadmap-button:disabled,
.roadmap-edit-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.roadmap-view-tabs {
  display: flex;
  align-items: stretch;
  gap: 2px;
  padding: 3px;
  background: var(--theme-canvas);
  border: 1px solid var(--theme-border);
  border-radius: 7px;
  width: fit-content;
  max-width: 100%;
  margin-bottom: 16px;
}
.roadmap-view-tabs button {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--theme-muted);
  padding: 9px 14px;
  border-radius: 5px;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  cursor: pointer;
}
.roadmap-view-tabs button[aria-pressed="true"] {
  color: var(--theme-accent);
  background: var(--theme-surface);
  box-shadow: 0 1px 4px #16253d12;
  font-weight: 650;
}
.roadmap-view-tabs button > span {
  color: var(--theme-text);
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  padding: 2px 4px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--theme-accent) 8%, var(--theme-surface));
}
.roadmap-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  border: 1px solid var(--theme-border);
  border-radius: 7px;
  padding: 8px 10px;
  margin-bottom: 12px;
  background: var(--theme-canvas);
}
.roadmap-toolbar > .roadmap-button {
  margin-left: auto;
}
.roadmap-filter {
  display: flex;
  gap: 8px;
  align-items: center;
  color: var(--theme-muted);
  width: 245px;
  max-width: 100%;
}
.roadmap-filter input {
  outline: none;
  width: 100%;
  min-width: 0;
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  background: transparent !important;
  color: var(--theme-text);
}
.roadmap-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  cursor: pointer;
}
.roadmap-checkbox input,
.roadmap-dependency-options input {
  accent-color: var(--theme-accent);
}
.roadmap-checkbox i {
  width: 15px;
  height: 3px;
  border-radius: 2px;
  background: #e35f6b;
}
.roadmap-planning-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 205px;
  gap: 14px;
  align-items: start;
}
.roadmap-main-column {
  min-width: 0;
}
.roadmap-visual-panel {
  min-width: 0;
  border: 1px solid var(--theme-border);
  border-radius: 8px;
  overflow: hidden;
}
.roadmap-map-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-bottom: 1px solid var(--theme-border);
  background: var(--theme-canvas);
}
.roadmap-map-toolbar > span {
  display: flex;
  align-items: center;
  border: 1px solid var(--theme-border);
  border-radius: 5px;
  background: var(--theme-surface);
}
.roadmap-map-toolbar button {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  padding: 5px 7px;
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  cursor: pointer;
}
.roadmap-map-toolbar button:hover {
  color: var(--theme-accent);
}
.roadmap-map-toolbar output {
  min-width: 35px;
  text-align: center;
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
}
.roadmap-map-toolbar small {
  margin-left: auto;
  color: var(--theme-muted);
  font-size: calc(9px * var(--taskflow-font-scale, 1));
}
.roadmap-map-viewport {
  overflow: auto;
  min-height: 310px;
  max-height: 540px;
  padding: 15px 10px;
  background-color: var(--theme-surface);
  background-image:
    linear-gradient(
      to right,
      color-mix(in srgb, var(--theme-border) 35%, transparent) 1px,
      transparent 1px
    ),
    linear-gradient(
      to bottom,
      color-mix(in srgb, var(--theme-border) 35%, transparent) 1px,
      transparent 1px
    );
  background-size: 17px 17px;
}
.roadmap-scaled-world {
  position: relative;
  margin: 0 auto;
}
.roadmap-map-world {
  position: absolute;
  inset: 0 auto auto 0;
  transform-origin: 0 0;
}
.roadmap-connectors {
  position: absolute;
  inset: 0;
  overflow: visible;
  pointer-events: none;
}
.roadmap-edge {
  fill: none;
  stroke: #93a2b9;
  stroke-width: 1.8px;
}
.roadmap-edge.critical {
  stroke: #e96573;
  stroke-width: 2.3px;
}
.roadmap-edge.conflict {
  stroke: #de982e;
  stroke-width: 2px;
  stroke-dasharray: 5 3;
}
.roadmap-arrow {
  fill: #93a2b9;
}
.roadmap-arrow.critical {
  fill: #e96573;
}
.roadmap-arrow.conflict {
  fill: #de982e;
}
.roadmap-feature-node {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 8px 10px;
  text-align: center;
  border: 1.5px solid #a4c3f6;
  border-radius: 8px;
  background: #edf4ff;
  color: #25416b;
  box-shadow: 0 2px 5px #2b4b7b08;
  cursor: pointer;
}
.roadmap-feature-node.critical {
  border-color: #f08b96;
  background: #fff0f2;
  color: #7f3541;
}
.roadmap-feature-node.complete {
  border-color: #99d3b6;
  background: #edf9f3;
  color: #2f765a;
}
.roadmap-feature-node.selected {
  outline: 3px solid var(--theme-accent);
  outline-offset: 3px;
}
.roadmap-feature-node > b {
  font-size: calc(13px * var(--taskflow-font-scale, 1));
  font-weight: 650;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.25;
}
.roadmap-feature-node > small {
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  font-weight: 650;
}
.roadmap-node-id {
  display: flex;
  justify-content: space-between;
  color: #7487a4;
  font-size: calc(8px * var(--taskflow-font-scale, 1));
}
.roadmap-node-dates {
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  color: #7487a4;
}
.roadmap-boundary {
  position: absolute;
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 60px;
  height: 60px;
  border: 1.5px solid #7ac79d;
  border-radius: 50%;
  background: #e1f5e8;
  color: #326d4c;
  text-align: center;
}
.roadmap-boundary b {
  font-size: calc(10px * var(--taskflow-font-scale, 1));
}
.roadmap-boundary small {
  font-size: calc(8px * var(--taskflow-font-scale, 1));
  margin-top: 4px;
}
.roadmap-legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  padding: 13px 15px;
  background: var(--theme-canvas);
  border-top: 1px solid var(--theme-border);
}
.roadmap-legend span {
  display: flex;
  align-items: center;
  gap: 5px;
}
.roadmap-legend i {
  display: inline-block;
  width: 10px;
  height: 10px;
  border: 1px solid #a4c3f6;
  border-radius: 50%;
  background: #edf4ff;
}
.roadmap-legend i.critical {
  background: #fff0f2;
  border-color: #ef8b96;
}
.roadmap-legend i.milestone {
  background: #e1f5e8;
  border-color: #7ac79d;
}
.roadmap-legend i.complete {
  background: #edf9f3;
  border-color: #99d3b6;
  border-radius: 3px;
}
.roadmap-legend i.line {
  height: 2px;
  width: 17px;
  background: #93a2b9;
  border: 0;
}
.roadmap-legend i.warning {
  height: 2px;
  width: 17px;
  border: 0;
  background: #de982e;
}
.roadmap-insights {
  border: 1px solid var(--theme-border);
  background: var(--theme-canvas);
  border-radius: 8px;
  padding: 12px;
}
.roadmap-insights > h3 {
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  font-weight: 650;
  margin-bottom: 10px;
}
.roadmap-insight {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 10px;
  border: 1px solid var(--theme-border);
  border-radius: 6px;
  background: var(--theme-surface);
  margin: 6px 0;
}
.roadmap-insight > svg {
  color: #8794aa;
  flex-shrink: 0;
}
.roadmap-insight > span {
  min-width: 0;
  overflow-wrap: anywhere;
}
.roadmap-insight small {
  display: block;
  color: var(--theme-muted);
  font-size: calc(9px * var(--taskflow-font-scale, 1));
}
.roadmap-insight b {
  display: block;
  margin-top: 3px;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  font-weight: 650;
  color: #389572;
}
.roadmap-insight.critical {
  background: #fff0f2;
  border-color: #f9dbe0;
}
.roadmap-insight.critical b,
.roadmap-insight.critical > svg {
  color: #db5f72;
}
.roadmap-completion {
  border: 1px solid var(--theme-border);
  background: var(--theme-surface);
  border-radius: 6px;
  padding: 12px 10px;
  margin-top: 6px;
}
.roadmap-completion > span {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--theme-muted);
  font-size: calc(10px * var(--taskflow-font-scale, 1));
}
.roadmap-completion b {
  margin-left: auto;
  color: var(--theme-accent);
}
.roadmap-completion > div {
  height: 5px;
  background: var(--theme-subtle);
  border-radius: 4px;
  margin: 9px 0 5px;
  overflow: hidden;
}
.roadmap-completion i {
  height: 100%;
  display: block;
  background: var(--theme-accent);
  border-radius: 4px;
}
.roadmap-completion small {
  font-size: calc(8px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
}
.roadmap-critical-list {
  margin-top: 12px;
  padding: 12px 10px;
  border-radius: 6px;
  background: color-mix(in srgb, #ed7183 9%, var(--theme-surface));
}
.roadmap-critical-list h4 {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  font-weight: 650;
  margin-bottom: 8px;
}
.roadmap-critical-list button {
  display: flex;
  text-align: left;
  align-items: flex-start;
  gap: 7px;
  width: 100%;
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  padding-block: 4px;
  cursor: pointer;
}
.roadmap-critical-list button span {
  font-size: calc(8px * var(--taskflow-font-scale, 1));
  flex-shrink: 0;
  color: #c25668;
  border-radius: 4px;
  padding: 2px 3px;
  background: color-mix(in srgb, #ed7183 18%, var(--theme-surface));
}
.roadmap-critical-list p,
.roadmap-critical-list small {
  display: block;
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  line-height: 1.7;
  color: var(--theme-muted);
}
.roadmap-critical-list small {
  margin-top: 10px;
  font-size: calc(8px * var(--taskflow-font-scale, 1));
}
.roadmap-selected-feature {
  margin-top: 12px;
  border: 1px solid var(--theme-border);
  background: var(--theme-surface);
  border-radius: 6px;
  padding: 12px 10px;
}
.roadmap-selected-feature header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.roadmap-selected-feature h4,
.roadmap-selected-feature h5 {
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  font-weight: 650;
}
.roadmap-selected-feature h5 {
  margin-top: 12px;
}
.roadmap-selected-feature header button {
  cursor: pointer;
  color: var(--theme-muted);
}
.roadmap-selected-feature > b {
  display: block;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  margin: 4px 0 10px;
}
.roadmap-feature-id {
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
}
.roadmap-selected-feature p {
  margin-top: 6px;
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  line-height: 1.6;
  color: var(--theme-muted);
  overflow-wrap: anywhere;
}
.roadmap-selected-feature .roadmap-button {
  width: 100%;
  margin-top: 13px;
}
.roadmap-detail-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 21px;
  border-bottom: 1px solid var(--theme-border);
}
.roadmap-detail-tabs button {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  border-bottom: 2px solid transparent;
  padding: 10px 12px;
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  cursor: pointer;
}
.roadmap-detail-tabs button[aria-pressed="true"] {
  color: var(--theme-accent);
  border-bottom-color: var(--theme-accent);
  font-weight: 650;
}
.roadmap-detail-tabs button > span {
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  background: var(--theme-subtle);
  border-radius: 4px;
  padding: 1px 4px;
}
.roadmap-detail-tabs p {
  margin-left: auto;
  color: var(--theme-muted);
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  padding: 0 7px;
}
.roadmap-table-scroll {
  overflow: auto;
  width: 100%;
  border: 1px solid var(--theme-border);
  border-radius: 0 0 7px 7px;
  max-height: 400px;
}
.roadmap-feature-table {
  width: 100%;
  border-collapse: collapse;
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  text-align: left;
}
.roadmap-feature-table th {
  background: var(--theme-canvas);
  position: sticky;
  top: 0;
  z-index: 1;
  color: var(--theme-muted);
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  font-weight: 650;
  white-space: nowrap;
}
.roadmap-feature-table th,
.roadmap-feature-table td {
  padding: 11px 10px;
  border-bottom: 1px solid var(--theme-border);
}
.roadmap-feature-table td {
  white-space: nowrap;
}
.roadmap-feature-table tbody tr:last-child td {
  border-bottom: 0;
}
.roadmap-feature-table tbody tr.selected {
  background: color-mix(in srgb, var(--theme-accent) 6%, var(--theme-surface));
}
.roadmap-table-name {
  color: var(--theme-text);
  font-weight: 550;
  max-width: 240px;
  display: block;
  text-align: left;
  white-space: normal;
  min-width: 140px;
  cursor: pointer;
}
.roadmap-table-name:hover {
  color: var(--theme-accent);
}
.roadmap-week-chip {
  display: inline-block;
  border: 1px solid var(--theme-border);
  border-radius: 4px;
  color: var(--theme-accent);
  background: color-mix(in srgb, var(--theme-accent) 5%, var(--theme-surface));
  padding: 3px 6px;
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  white-space: nowrap;
}
.roadmap-status {
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  background: var(--theme-canvas);
  padding: 3px 6px;
  border-radius: 4px;
}
.roadmap-status.complete {
  color: #206a54;
  background: #e2f5ec;
}
.roadmap-critical-mark {
  color: #df6777;
}
.roadmap-edit-button {
  display: grid;
  place-items: center;
  padding: 5px;
  color: var(--theme-muted);
  cursor: pointer;
}
.roadmap-edit-button:hover:enabled {
  color: var(--theme-accent);
}
.roadmap-overlap {
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  color: #a5701b;
  border-radius: 4px;
  padding: 3px 5px;
  background: #fff6df;
}
.roadmap-muted {
  color: var(--theme-muted);
  font-size: calc(10px * var(--taskflow-font-scale, 1));
}
.roadmap-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--theme-muted);
  background: var(--theme-canvas);
  border: 1px solid var(--theme-border);
  border-radius: 6px;
  padding: 10px;
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  line-height: 1.6;
  margin-bottom: 12px;
}
.roadmap-notice > svg {
  flex-shrink: 0;
  margin-top: 1px;
}
.roadmap-notice.warning {
  color: var(--theme-warning);
  background: var(--theme-warning-soft);
  border-color: color-mix(in srgb, var(--theme-warning) 20%, var(--theme-border));
}
.roadmap-empty {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
  padding: 55px 25px;
  min-height: 260px;
  text-align: center;
  color: var(--theme-muted);
  font-size: calc(12px * var(--taskflow-font-scale, 1));
}
.roadmap-empty > svg {
  color: #98a6c8;
}
.roadmap-empty h3,
.roadmap-empty h2 {
  color: var(--theme-text);
  font-size: calc(18px * var(--taskflow-font-scale, 1));
  font-weight: 650;
}
.roadmap-empty p {
  max-width: 500px;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  line-height: 1.8;
}
.roadmap-error {
  margin-block: 12px;
  border: 1px solid color-mix(in srgb, var(--theme-danger) 25%, transparent);
  color: var(--theme-danger);
  background: var(--theme-danger-soft);
  border-radius: 6px;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  padding: 12px;
}
.roadmap-error button {
  margin-left: 15px;
  cursor: pointer;
  text-decoration: underline;
}
.roadmap-week-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--theme-border);
  background: var(--theme-canvas);
  font-size: calc(11px * var(--taskflow-font-scale, 1));
}
.roadmap-week-toolbar small {
  color: var(--theme-muted);
  margin-left: 4px;
}
.roadmap-week-toolbar > div {
  display: flex;
  align-items: center;
  gap: 8px;
}
.roadmap-week-toolbar button {
  cursor: pointer;
  color: var(--theme-muted);
  font-size: calc(10px * var(--taskflow-font-scale, 1));
}
.roadmap-timeline-scroll {
  overflow: auto;
  max-height: 560px;
}
.roadmap-timeline-inner {
  position: relative;
}
.roadmap-week-header {
  display: flex;
  border-bottom: 1px solid var(--theme-border);
  position: sticky;
  top: 0;
  z-index: 5;
  background: var(--theme-canvas);
}
.roadmap-week-header > b {
  display: flex;
  align-items: center;
  padding-left: 15px;
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  letter-spacing: 0.5px;
  color: var(--theme-muted);
  background: var(--theme-canvas);
  position: sticky;
  left: 0;
  z-index: 6;
  flex-shrink: 0;
}
.roadmap-week-header > span {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  border-left: 1px solid var(--theme-border);
}
.roadmap-week-header span b {
  color: var(--theme-accent);
  font-size: calc(11px * var(--taskflow-font-scale, 1));
}
.roadmap-week-header small {
  color: var(--theme-muted);
  font-size: calc(9px * var(--taskflow-font-scale, 1));
}
.roadmap-timeline-row {
  display: flex;
  border-bottom: 1px solid var(--theme-border);
}
.roadmap-timeline-label {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  text-align: left;
  padding: 7px 15px;
  position: sticky;
  left: 0;
  z-index: 4;
  background: var(--theme-surface);
  flex-shrink: 0;
  cursor: pointer;
}
.roadmap-timeline-label b {
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  font-weight: 550;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.roadmap-timeline-label small {
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
}
.roadmap-week-cells {
  position: relative;
  background-image: linear-gradient(to right, var(--theme-border) 1px, transparent 1px);
}
.roadmap-timeline-edges {
  position: absolute;
  z-index: 2;
  pointer-events: none;
}
.roadmap-timeline-edges .roadmap-edge {
  opacity: 0.65;
  stroke-width: 1.4px;
}
.roadmap-timeline-bar {
  position: absolute;
  top: 15px;
  height: 28px;
  border: 1px solid #a4c3f6;
  border-radius: 5px;
  background: #e7f0ff;
  color: #3e639e;
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  text-align: left;
  padding-inline: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 3;
  cursor: pointer;
}
.roadmap-timeline-bar.critical {
  background: #ffe5ea;
  border-color: #efa1ad;
  color: #b94d63;
}
.roadmap-timeline-bar.complete {
  background: #e0f2e8;
  border-color: #99d3b6;
  color: #3d8b65;
}
.roadmap-timeline-bar[aria-pressed="true"] {
  outline: 2px solid var(--theme-accent);
  outline-offset: 2px;
}
.roadmap-unscheduled {
  position: absolute;
  top: 21px;
  left: 15px;
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
}
.roadmap-timeline-note {
  padding: 13px;
  color: var(--theme-muted);
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  line-height: 1.7;
  background: var(--theme-canvas);
  border-top: 1px solid var(--theme-border);
}
.roadmap-dialog {
  position: fixed;
  margin: auto;
  width: min(580px, calc(100vw - 32px));
  max-height: calc(100dvh - 40px);
  overflow-y: auto;
  padding: 26px;
  border: 1px solid var(--theme-border);
  border-radius: 14px;
  background: var(--theme-surface);
  color: var(--theme-text);
  box-shadow: 0 20px 75px #07142740;
}
.roadmap-dialog::backdrop {
  background: #11223966;
  backdrop-filter: blur(3px);
}
.roadmap-dialog header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 22px;
}
.roadmap-dialog h2 {
  font-size: calc(23px * var(--taskflow-font-scale, 1));
  font-weight: 650;
  letter-spacing: -0.5px;
}
.roadmap-dialog header button {
  color: var(--theme-muted);
  padding: 4px;
  cursor: pointer;
}
.roadmap-form-fields {
  display: flex;
  flex-direction: column;
  gap: 13px;
  border: 0;
  padding: 0;
  min-width: 0;
}
.roadmap-form-fields > label,
.roadmap-form-dates label {
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  font-weight: 550;
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}
.roadmap-form-fields input:not([type="checkbox"]),
.roadmap-form-fields textarea {
  width: 100%;
  min-width: 0;
  border: 1px solid var(--theme-border);
  background: var(--theme-canvas);
  border-radius: 7px;
  padding: 10px 12px;
  color: var(--theme-text);
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  font-weight: 400;
}
.roadmap-form-fields input:focus,
.roadmap-form-fields textarea:focus {
  outline: 2px solid color-mix(in srgb, var(--theme-accent) 25%, transparent);
  outline-offset: 1px;
}
.roadmap-form-dates {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px;
}
.roadmap-form-week {
  display: flex;
  gap: 7px;
  align-items: center;
  flex-wrap: wrap;
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  color: var(--theme-accent);
}
.roadmap-form-week > span {
  color: var(--theme-muted);
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  margin-left: auto;
}
.roadmap-dependency-label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  margin-top: 5px;
}
.roadmap-dependency-label > span {
  margin-left: auto;
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
}
.roadmap-dependency-options {
  max-height: 155px;
  overflow-y: auto;
  border: 1px solid var(--theme-border);
  border-radius: 7px;
}
.roadmap-dependency-options label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--theme-border);
}
.roadmap-dependency-options label:last-child {
  border: 0;
}
.roadmap-dependency-options b {
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  font-weight: 550;
}
.roadmap-dependency-options small {
  display: block;
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  margin-top: 3px;
}
.roadmap-dependency-options p {
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  padding: 15px;
}
.roadmap-dialog footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid var(--theme-border);
  margin-top: 24px;
  padding-top: 18px;
}
.roadmap-page button:focus-visible {
  outline: 2px solid var(--theme-focus);
  outline-offset: 3px;
}
html[data-theme="night"] .roadmap-feature-node {
  background: #162c48;
  border-color: #446896;
  color: #c6dbfc;
}
html[data-theme="night"] .roadmap-feature-node.critical {
  background: #38212c;
  border-color: #a95668;
  color: #efc1cb;
}
html[data-theme="night"] .roadmap-feature-node.complete {
  background: #16392d;
  border-color: #4f8e70;
  color: #b8e5cc;
}
html[data-theme="night"] .roadmap-insight.critical {
  background: #38212c;
  border-color: #5b3341;
}
html[data-theme="night"] .roadmap-timeline-bar {
  background: #223b5c;
  color: #c6dbfc;
  border-color: #446896;
}
html[data-theme="night"] .roadmap-timeline-bar.critical {
  background: #4b2837;
  color: #efc1cb;
  border-color: #a95668;
}
html[data-theme="night"] .roadmap-timeline-bar.complete {
  background: #1e4937;
  color: #b8e5cc;
  border-color: #4f8e70;
}
@media (max-width: 1250px) {
  .roadmap-planning-grid {
    grid-template-columns: minmax(0, 1fr) 180px;
    gap: 10px;
  }
  .roadmap-content {
    padding: 16px;
  }
  .roadmap-map-toolbar small,
  .roadmap-detail-tabs > p {
    display: none;
  }
}
@media (max-width: 950px) {
  .roadmap-page-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 15px;
  }
  .roadmap-project-picker {
    width: 100%;
  }
  .roadmap-project-picker select {
    width: 100%;
    max-width: 360px;
  }
  .roadmap-planning-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .roadmap-insights {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }
  .roadmap-insights > h3 {
    grid-column: 1 / -1;
    margin-bottom: 0;
  }
  .roadmap-insight,
  .roadmap-completion {
    margin: 0;
  }
  .roadmap-critical-list,
  .roadmap-selected-feature {
    grid-column: 1 / -1;
    margin-top: 0;
  }
}
@media (max-width: 600px) {
  .roadmap-page {
    padding-block: 20px;
  }
  .roadmap-title-line h1 {
    font-size: calc(24px * var(--taskflow-font-scale, 1));
  }
  .roadmap-page-icon {
    width: 35px;
    height: 38px;
    border-radius: 8px;
  }
  .roadmap-title-group {
    gap: 10px;
  }
  .roadmap-title-group p {
    font-size: calc(11px * var(--taskflow-font-scale, 1));
  }
  .roadmap-live-badge {
    display: none;
  }
  .roadmap-content {
    padding: 13px;
  }
  .roadmap-plan-actions {
    width: 100%;
  }
  .roadmap-date-range {
    padding-inline: 7px;
  }
  .roadmap-view-tabs {
    width: 100%;
  }
  .roadmap-view-tabs button {
    padding: 8px;
    flex: 1;
    font-size: calc(10px * var(--taskflow-font-scale, 1));
  }
  .roadmap-view-tabs button > span {
    display: none;
  }
  .roadmap-toolbar {
    gap: 12px;
  }
  .roadmap-filter {
    width: 100%;
    padding-bottom: 6px;
  }
  .roadmap-checkbox {
    font-size: calc(9px * var(--taskflow-font-scale, 1));
  }
  .roadmap-insights {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .roadmap-insight {
    gap: 8px;
    padding: 9px 8px;
  }
  .roadmap-insight b {
    font-size: calc(11px * var(--taskflow-font-scale, 1));
  }
  .roadmap-week-toolbar {
    flex-wrap: wrap;
    font-size: calc(10px * var(--taskflow-font-scale, 1));
  }
  .roadmap-map-viewport {
    min-height: 250px;
  }
  .roadmap-detail-tabs {
    gap: 0;
  }
  .roadmap-detail-tabs button {
    padding-inline: 8px;
    font-size: calc(10px * var(--taskflow-font-scale, 1));
  }
  .roadmap-dialog {
    padding: 20px;
  }
  .roadmap-form-dates {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* Editable calendar timeline and progress from linked stories. */
.roadmap-time-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--theme-border);
  background: var(--theme-canvas);
}
.roadmap-time-toolbar > label {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--theme-muted);
  font-size: calc(10px * var(--taskflow-font-scale, 1));
}
.roadmap-time-toolbar select {
  border: 1px solid var(--theme-border);
  border-radius: 6px;
  color: var(--theme-text);
  background: var(--theme-surface);
  padding: 6px 8px;
  font-size: calc(11px * var(--taskflow-font-scale, 1));
}
.roadmap-time-toolbar > span {
  color: var(--theme-muted);
  font-size: calc(10px * var(--taskflow-font-scale, 1));
}
.roadmap-time-toolbar > div {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-left: auto;
}
.roadmap-time-toolbar button {
  color: var(--theme-muted);
  cursor: pointer;
  font-size: calc(10px * var(--taskflow-font-scale, 1));
}
.roadmap-time-toolbar button:disabled {
  opacity: 0.4;
  cursor: wait;
}
.roadmap-timeline-label b {
  display: flex;
  align-items: center;
  gap: 7px;
}
.roadmap-timeline-label b i {
  display: block;
  flex: 0 0 7px;
  height: 7px;
  border-radius: 2px;
}
.roadmap-timeline-bar.interactive {
  top: 15px;
  height: 34px;
  padding: 0;
  border: 1px solid var(--feature-color);
  background: color-mix(in srgb, var(--feature-color) 12%, var(--theme-surface));
  color: var(--feature-text);
  overflow: visible;
  border-radius: 6px;
}
.roadmap-timeline-bar.interactive.critical {
  outline: 1px solid #e96573;
  outline-offset: 3px;
}
.roadmap-timeline-bar.interactive.selected {
  outline: 2px solid var(--theme-accent);
  outline-offset: 3px;
}
.roadmap-timeline-bar.interactive.is-dragging {
  z-index: 8;
  box-shadow: 0 4px 13px #13284d28;
}
.roadmap-bar-body {
  display: flex;
  position: relative;
  align-items: center;
  gap: 6px;
  width: 100%;
  height: 100%;
  padding: 0 11px;
  overflow: hidden;
  border-radius: inherit;
  color: var(--feature-text);
  cursor: grab;
  user-select: none;
  touch-action: none;
}
.roadmap-bar-body:active {
  cursor: grabbing;
}
.roadmap-bar-body:focus-visible {
  outline: 2px solid var(--theme-focus);
  outline-offset: 2px;
}
.roadmap-progress-fill {
  position: absolute;
  inset: 0 auto 0 0;
  height: 100%;
  background: var(--feature-color);
  opacity: 0.55;
  pointer-events: none;
}
.roadmap-timeline-bar.complete .roadmap-progress-fill {
  opacity: 1;
}
.roadmap-bar-title {
  position: relative;
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  font-weight: 550;
}
.roadmap-bar-percent {
  position: relative;
  flex: 0 0 auto;
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  font-weight: 650;
}
.roadmap-resize-handle {
  position: absolute;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 1px;
  bottom: 1px;
  width: 10px;
  padding: 0;
  color: var(--feature-text);
  cursor: ew-resize;
  touch-action: none;
  opacity: 0;
  border-radius: 3px;
  background: transparent;
}
.roadmap-resize-handle.start {
  left: -5px;
}
.roadmap-resize-handle.end {
  right: -5px;
}
.roadmap-timeline-bar:hover .roadmap-resize-handle,
.roadmap-timeline-bar:focus-within .roadmap-resize-handle,
.roadmap-timeline-bar.selected .roadmap-resize-handle {
  opacity: 1;
}
.roadmap-resize-handle:disabled {
  cursor: wait;
}
.roadmap-drag-dates {
  display: inline-block;
  margin-left: 12px;
  color: var(--theme-accent);
}
.roadmap-color-heading {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: calc(11px * var(--taskflow-font-scale, 1));
}
.roadmap-color-heading > label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--theme-muted);
  margin-left: auto;
  font-size: calc(10px * var(--taskflow-font-scale, 1));
}
.roadmap-color-heading input[type="color"] {
  width: 38px;
  height: 29px;
  padding: 2px;
  border: 1px solid var(--theme-border);
  border-radius: 5px;
  cursor: pointer;
}
.roadmap-color-swatches {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
  padding-bottom: 4px;
}
.roadmap-color-swatches button {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  border: 3px solid var(--theme-surface);
  box-shadow: 0 0 0 1px var(--theme-border);
  cursor: pointer;
}
.roadmap-color-swatches button[aria-pressed="true"] {
  outline: 2px solid var(--theme-accent);
  outline-offset: 2px;
}
.roadmap-story-options label:has(input:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}
.roadmap-table-progress {
  display: block;
  position: relative;
  min-width: 66px;
  height: 18px;
  background: var(--theme-canvas);
  border: 1px solid var(--theme-border);
  border-radius: 4px;
  overflow: hidden;
}
.roadmap-table-progress i {
  display: block;
  height: 100%;
  opacity: 0.3;
}
.roadmap-table-progress b {
  position: absolute;
  inset: 2px 6px;
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  font-weight: 600;
}
.roadmap-stories {
  border: 1px solid var(--theme-border);
  border-radius: 0 0 8px 8px;
  padding: 18px;
  background: var(--theme-surface);
}
.roadmap-stories > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 17px;
}
.roadmap-stories h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: calc(14px * var(--taskflow-font-scale, 1));
  font-weight: 650;
}
.roadmap-stories header p {
  margin-top: 6px;
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  line-height: 1.6;
}
.roadmap-stories header label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  min-width: 0;
}
.roadmap-stories select {
  min-width: 0;
  max-width: 230px;
  padding: 7px 8px;
  border: 1px solid var(--theme-border);
  border-radius: 6px;
  color: var(--theme-text);
  background: var(--theme-canvas);
  font-size: calc(11px * var(--taskflow-font-scale, 1));
}
.roadmap-story-progress {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  margin-bottom: 15px;
}
.roadmap-story-progress > b {
  margin-left: auto;
  color: var(--theme-accent);
}
.roadmap-story-progress > div {
  width: 100%;
  height: 6px;
  background: var(--theme-canvas);
  border-radius: 6px;
  overflow: hidden;
}
.roadmap-story-progress i {
  display: block;
  height: 100%;
  border-radius: inherit;
  transition: width 0.15s ease;
}
.roadmap-story-list {
  max-height: 300px;
  overflow-y: auto;
}
.roadmap-story-list label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 0;
  border-top: 1px solid var(--theme-border);
  cursor: pointer;
}
.roadmap-story-list input {
  accent-color: var(--theme-accent);
  flex-shrink: 0;
}
.roadmap-story-list b {
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  font-weight: 550;
}
.roadmap-story-list small {
  display: block;
  color: var(--theme-muted);
  margin-top: 4px;
  font-size: calc(9px * var(--taskflow-font-scale, 1));
}
.roadmap-story-list label.complete b {
  color: var(--theme-muted);
  text-decoration: line-through;
}
.roadmap-story-list svg {
  margin-left: auto;
  flex-shrink: 0;
  color: var(--theme-positive);
}
.roadmap-story-empty {
  padding: 20px 0;
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
}
.roadmap-story-create {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  border-top: 1px solid var(--theme-border);
  margin-top: 12px;
  padding-top: 15px;
}
.roadmap-story-create input {
  flex: 1 1 220px;
  min-width: 0;
  padding: 9px 11px;
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  border: 1px solid var(--theme-border);
  border-radius: 6px;
  background: var(--theme-canvas);
  color: var(--theme-text);
}
.roadmap-feature-node.custom-color > b {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  -webkit-line-clamp: unset;
}
.roadmap-feature-node.custom-color.critical {
  box-shadow: 0 0 0 2px #e9657366;
}
.roadmap-feature-node.custom-color > .roadmap-node-id,
.roadmap-feature-node.custom-color > .roadmap-node-dates {
  color: inherit;
  opacity: 0.7;
}
@media (hover: none) {
  .roadmap-resize-handle {
    opacity: 1;
  }
}
@media (max-width: 600px) {
  .roadmap-time-toolbar {
    gap: 9px;
  }
  .roadmap-time-toolbar > div {
    margin-left: 0;
    width: 100%;
    justify-content: space-between;
  }
  .roadmap-detail-tabs {
    flex-wrap: wrap;
  }
  .roadmap-detail-tabs button {
    padding-inline: 7px;
  }
  .roadmap-stories {
    padding: 13px;
  }
  .roadmap-stories header label {
    width: 100%;
  }
  .roadmap-stories select {
    flex: 1;
    max-width: 100%;
  }
  .roadmap-story-create input {
    flex-basis: 100%;
  }
}

.roadmap-bar-body[data-movable="false"] {
  cursor: default;
  touch-action: pan-x;
}
html[data-theme="night"] .roadmap-timeline-bar.interactive {
  background: color-mix(in srgb, var(--feature-color) 12%, var(--theme-surface));
  border-color: var(--feature-color);
  color: var(--feature-text);
}

.roadmap-bar-compact-caption {
  display: none;
}
.roadmap-timeline-bar.compact .roadmap-bar-title,
.roadmap-timeline-bar.compact .roadmap-bar-percent {
  visibility: hidden;
}
.roadmap-timeline-bar.compact .roadmap-bar-compact-caption {
  display: flex;
  position: absolute;
  top: -15px;
  left: 0;
  gap: 7px;
  align-items: center;
  width: max-content;
  max-width: 260px;
  color: var(--theme-text);
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  line-height: 12px;
  white-space: nowrap;
  pointer-events: none;
}
.roadmap-bar-compact-caption > span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.roadmap-bar-compact-caption > b {
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  font-weight: 650;
  color: var(--theme-muted);
  flex-shrink: 0;
}

/* Product-roadmap calendar: features sit directly on the time grid. */
.roadmap-content.is-calendar-view {
  padding: 0;
}
.is-calendar-view > .roadmap-plan-heading,
.is-calendar-view > .roadmap-toolbar {
  display: none;
}
.is-calendar-view > .roadmap-view-tabs {
  width: 100%;
  margin: 0;
  padding: 8px 16px;
  border: 0;
  border-bottom: 1px solid var(--theme-border);
  border-radius: 0;
  background: var(--theme-canvas);
}
.roadmap-view-tabs .roadmap-insights-toggle {
  margin-left: auto;
}
.is-calendar-view .roadmap-planning-grid {
  display: block;
}
.is-calendar-view .roadmap-visual-panel {
  border: 0;
  border-radius: 0;
}
.is-calendar-view .roadmap-insights {
  display: none;
}
.is-calendar-view.show-insights .roadmap-insights {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin: 16px;
  padding: 16px;
}
.is-calendar-view.show-insights .roadmap-insights > h3 {
  grid-column: 1 / -1;
}
.is-calendar-view.show-insights .roadmap-insight,
.is-calendar-view.show-insights .roadmap-completion {
  margin: 0;
}
.is-calendar-view.show-insights .roadmap-selected-feature {
  grid-column: span 2;
}
.is-calendar-view.show-insights .roadmap-critical-list {
  grid-column: span 3;
  margin: 0;
}
.is-calendar-view .roadmap-detail-tabs {
  margin: 17px 16px 0;
}
.is-calendar-view .roadmap-table-scroll,
.is-calendar-view .roadmap-stories {
  margin: 0 16px 16px;
  width: calc(100% - 32px);
}
.is-calendar-view > .roadmap-notice,
.is-calendar-view > .roadmap-error {
  margin: 12px 16px;
}
.product-roadmap-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding: 20px 18px 12px;
}
.product-roadmap-heading h2 {
  font-size: calc(18px * var(--taskflow-font-scale, 1));
  font-weight: 700;
  letter-spacing: -0.5px;
}
.product-roadmap-heading p {
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  margin-top: 5px;
  line-height: 1.6;
}
.product-roadmap-time-controls {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}
.roadmap-scale-segments {
  display: inline-flex;
  padding: 2px;
  border: 1px solid var(--theme-border);
  border-radius: 6px;
  background: var(--theme-canvas);
}
.roadmap-scale-segments button {
  min-width: 48px;
  padding: 7px 10px;
  border-radius: 4px;
  color: var(--theme-muted);
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  cursor: pointer;
}
.roadmap-scale-segments button[aria-pressed="true"] {
  background: var(--theme-accent);
  color: white;
  font-weight: 600;
  box-shadow: 0 1px 4px #414d7420;
}
.roadmap-scale-segments button:disabled {
  cursor: wait;
  opacity: 0.5;
}
.roadmap-control-divider {
  width: 1px;
  height: 24px;
  margin-inline: 3px;
  background: var(--theme-border);
}
.product-roadmap-time-controls .icon-only {
  padding-inline: 8px;
}
.product-roadmap-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
  padding: 0 18px 17px;
}
.roadmap-calendar-filter {
  position: relative;
}
.roadmap-calendar-filter summary {
  display: flex;
  align-items: center;
  gap: 7px;
  list-style: none;
  border: 1px solid var(--theme-border);
  border-radius: 6px;
  background: var(--theme-surface);
  color: var(--theme-muted);
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  padding: 8px 11px;
  cursor: pointer;
}
.roadmap-calendar-filter summary::-webkit-details-marker {
  display: none;
}
.roadmap-calendar-filter[open] summary {
  border-color: var(--theme-accent);
  color: var(--theme-accent);
}
.roadmap-calendar-filter > div {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 30;
  width: 260px;
  padding: 17px;
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 9px;
  box-shadow: 0 12px 35px #11243b22;
}
.roadmap-calendar-filter > div > label:not(.roadmap-calendar-check) {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 13px;
  color: var(--theme-muted);
  font-size: calc(11px * var(--taskflow-font-scale, 1));
}
.roadmap-calendar-filter input[type="search"],
.roadmap-calendar-filter select {
  width: 100%;
  padding: 9px;
  border: 1px solid var(--theme-border);
  border-radius: 6px;
  background: var(--theme-canvas);
  color: var(--theme-text);
  font-size: calc(11px * var(--taskflow-font-scale, 1));
}
.roadmap-calendar-check {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  margin: 12px 0;
}
.roadmap-calendar-check input {
  accent-color: var(--theme-accent);
}
.roadmap-calendar-select {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  min-height: 33px;
  border: 1px solid var(--theme-border);
  border-radius: 6px;
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
}
.roadmap-calendar-select select {
  padding: 3px 18px 3px 4px;
  min-width: 0;
  color: var(--theme-text);
  background: var(--theme-surface);
  font-size: calc(10px * var(--taskflow-font-scale, 1));
}
.roadmap-calendar-export {
  margin-left: auto;
}
.product-roadmap-scroll {
  max-height: 690px;
  border-block: 1px solid var(--theme-border);
  background: var(--theme-surface);
  overscroll-behavior-x: contain;
}
.roadmap-calendar-year {
  display: flex;
  align-items: center;
  padding: 0 15px;
  position: sticky;
  top: 0;
  z-index: 12;
  background: var(--theme-canvas);
  border-bottom: 1px solid var(--theme-border);
  color: var(--theme-muted);
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  font-weight: 600;
}
.product-roadmap-periods {
  top: 25px;
  z-index: 11;
  background: var(--theme-canvas);
}
.product-roadmap-periods > span {
  flex-shrink: 0;
  gap: 2px;
}
.product-roadmap-periods span b {
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  font-weight: 550;
}
.product-roadmap-periods small {
  font-size: calc(8px * var(--taskflow-font-scale, 1));
}
.roadmap-calendar-milestones {
  position: relative;
  border-bottom: 1px solid var(--theme-border);
  background-color: var(--theme-canvas);
  background-image: linear-gradient(to right, var(--theme-border) 1px, transparent 1px);
}
.roadmap-calendar-target {
  position: absolute;
  top: 17px;
  width: 1px;
  z-index: 4;
}
.roadmap-calendar-target > i {
  position: absolute;
  width: 9px;
  height: 9px;
  left: -4px;
  top: 0;
  transform: rotate(45deg);
  background: #9771df;
  border: 1px solid #8c61d5;
  box-shadow: 0 0 0 3px #9771df16;
}
.roadmap-calendar-target > span {
  position: absolute;
  left: 11px;
  top: -5px;
  width: 160px;
}
.roadmap-calendar-target b {
  display: block;
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.roadmap-calendar-target small {
  display: block;
  margin-top: 3px;
  font-size: calc(8px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
}
.roadmap-calendar-target.reverse > span {
  left: auto;
  right: 11px;
  text-align: right;
}
.roadmap-calendar-body {
  position: relative;
  background-color: var(--theme-surface);
  background-image: linear-gradient(
    to right,
    color-mix(in srgb, var(--theme-border) 70%, transparent) 1px,
    transparent 1px
  );
}
.product-roadmap-row {
  position: absolute;
  left: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--theme-border) 65%, transparent);
}
.product-roadmap-row .roadmap-week-cells {
  height: 100%;
  background: none;
}
.product-roadmap-row .roadmap-timeline-bar.interactive {
  top: 12px;
  height: 28px;
  border-radius: 4px;
}
.product-roadmap-row .roadmap-bar-body {
  gap: 5px;
  padding-inline: 9px;
}
.product-roadmap-row .roadmap-bar-title {
  font-size: calc(10px * var(--taskflow-font-scale, 1));
}
.product-roadmap-row .roadmap-bar-title em {
  font-style: normal;
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  font-weight: 400;
}
.roadmap-bar-assignees {
  display: inline-flex;
  position: relative;
  flex-shrink: 0;
  align-items: center;
  padding-left: 4px;
}
.roadmap-bar-assignees .avatar {
  border: 1px solid #ffffffaa;
  box-shadow: 0 1px 3px #15243520;
}
.product-roadmap-row .roadmap-timeline-bar.compact .roadmap-bar-compact-caption {
  top: -11px;
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  line-height: 10px;
}
.roadmap-timeline-bar.compact .roadmap-bar-compact-caption.reverse {
  left: auto;
  right: 0;
}
.roadmap-today-overlay {
  position: absolute;
  z-index: 6;
  width: 0;
  pointer-events: none;
}
.roadmap-today-overlay > b {
  display: block;
  position: absolute;
  top: 42px;
  left: -19px;
  padding: 3px 7px;
  border-radius: 4px;
  background: #3d66c5;
  box-shadow: 0 1px 4px #3d66c530;
  color: white;
  font-size: calc(8px * var(--taskflow-font-scale, 1));
  font-weight: 600;
}
.roadmap-today-overlay > span {
  position: absolute;
  top: 60px;
  bottom: 0;
  left: 0;
  border-left: 1.5px dashed #78a5f5;
  opacity: 0.7;
}
.roadmap-calendar-group {
  position: absolute;
  left: 0;
  width: 100%;
  height: 26px;
  padding: 8px 14px 5px;
  background: var(--theme-canvas);
  border-block: 1px solid var(--theme-border);
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  font-weight: 600;
  color: var(--theme-muted);
  letter-spacing: 0.3px;
}
.roadmap-calendar-no-results {
  padding: 35px 18px;
  color: var(--theme-muted);
  font-size: calc(12px * var(--taskflow-font-scale, 1));
}
.product-roadmap-edges {
  left: 0;
  top: 0;
}
.product-roadmap-legend {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 17px;
  padding: 15px 18px;
  background: var(--theme-canvas);
  border-bottom: 1px solid var(--theme-border);
}
.product-roadmap-legend > span {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
}
.product-roadmap-legend i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8b5cf6;
}
.product-roadmap-legend i.progress {
  width: 17px;
  border-radius: 2px;
  background: linear-gradient(to right, #8b5cf6 55%, #8b5cf62a 55%);
}
.product-roadmap-legend i.diamond {
  width: 7px;
  height: 7px;
  border-radius: 0;
  background: #9771df;
  transform: rotate(45deg);
}
.product-roadmap-legend i.today {
  height: 13px;
  width: 0;
  border-radius: 0;
  border-left: 1.5px dashed #78a5f5;
  background: none;
}
.product-roadmap-legend > small {
  margin-left: auto;
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
}
.product-roadmap .roadmap-timeline-note {
  border: 0;
  background: var(--theme-surface);
  padding: 10px 18px;
  font-size: calc(9px * var(--taskflow-font-scale, 1));
}
@media (max-width: 950px) {
  .is-calendar-view.show-insights .roadmap-insights {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .is-calendar-view.show-insights .roadmap-selected-feature,
  .is-calendar-view.show-insights .roadmap-critical-list {
    grid-column: 1 / -1;
  }
}
@media (max-width: 600px) {
  .is-calendar-view > .roadmap-view-tabs {
    padding-inline: 10px;
    gap: 3px;
  }
  .roadmap-view-tabs .roadmap-insights-toggle {
    flex: 0 0 auto;
  }
  .product-roadmap-heading {
    padding: 17px 13px 12px;
  }
  .product-roadmap-time-controls {
    gap: 5px;
  }
  .roadmap-scale-segments button {
    min-width: 43px;
    padding: 7px;
  }
  .roadmap-control-divider {
    display: none;
  }
  .product-roadmap-toolbar {
    padding: 0 13px 13px;
    gap: 7px;
  }
  .roadmap-calendar-select {
    flex: 1;
  }
  .roadmap-calendar-export {
    margin-left: 0;
  }
  .roadmap-calendar-filter > div {
    left: -85px;
    width: 240px;
  }
  .product-roadmap-legend {
    padding: 13px;
    gap: 12px;
  }
  .product-roadmap-heading h2 {
    font-size: calc(17px * var(--taskflow-font-scale, 1));
  }
}

/* Panning the calendar navigates time without changing feature schedules. */
.product-roadmap-scroll {
  cursor: grab;
  touch-action: pan-y;
}
.product-roadmap-scroll.is-panning {
  cursor: grabbing;
  user-select: none;
}
.product-roadmap-scroll:focus-visible {
  outline: 2px solid var(--theme-focus);
  outline-offset: -2px;
}
.product-roadmap-periods {
  overflow: hidden;
}
`;
