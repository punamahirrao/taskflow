import { createGlobalStyle } from "styled-components";

export const SettingsHubStyles = createGlobalStyle`
.settings-layout {
  display: grid;
  grid-template-columns: 238px minmax(0, 1fr);
  min-height: calc(100vh - 70px);
  background: var(--theme-canvas);
}
.settings-rail {
  min-width: 0;
  padding: 29px 18px;
  border-right: 1px solid var(--theme-border);
  background: color-mix(in srgb, var(--theme-surface) 45%, var(--theme-canvas));
}
.settings-rail h1 {
  display: flex;
  align-items: center;
  gap: 11px;
  font-size: calc(24px * var(--taskflow-font-scale, 1));
  font-weight: 700;
  letter-spacing: -0.7px;
  margin: 0 8px 22px;
}
.settings-rail h1 svg {
  color: #7083a1;
}
.settings-rail .shell-search {
  margin: 0 3px 20px;
  padding-block: 10px;
}
.settings-rail nav a {
  display: flex;
  gap: 11px;
  align-items: center;
  padding: 11px 12px;
  border-radius: 7px;
  margin: 3px 0;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  color: var(--theme-text);
}
.settings-rail nav a svg {
  color: #7a8da9;
  flex-shrink: 0;
}
.settings-rail nav a:hover {
  background: var(--theme-subtle);
}
.settings-rail nav a.active {
  background: color-mix(in srgb, var(--theme-accent) 11%, var(--theme-surface));
  color: var(--theme-accent);
  font-weight: 600;
}
.settings-rail nav a.active svg {
  color: var(--theme-accent);
}
.settings-rail-note {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 22px 12px;
  margin-top: 25px;
  border-top: 1px solid var(--theme-border);
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
}
.settings-note-dot {
  width: 6px;
  height: 6px;
  background: #36b59a;
  border-radius: 50%;
}
.settings-main {
  min-width: 0;
  padding: 27px 30px 36px;
  max-width: 1500px;
  width: 100%;
  margin-inline: auto;
}
.settings-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: var(--theme-muted);
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  margin-bottom: 18px;
}
.settings-breadcrumb a:hover {
  color: var(--theme-accent);
}
.settings-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 26px;
}
.settings-eyebrow {
  color: #8492aa;
  font-size: calc(9px * var(--taskflow-font-scale, 1));
  font-weight: 650;
  letter-spacing: 1.6px;
  margin-bottom: 6px;
}
.settings-heading h2 {
  font-size: calc(29px * var(--taskflow-font-scale, 1));
  font-weight: 720;
  letter-spacing: -0.8px;
  line-height: 1.3;
}
.settings-heading > div > p:last-child {
  margin-top: 9px;
  color: var(--theme-muted);
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  line-height: 1.6;
  max-width: 490px;
}
.settings-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #e1ecfd;
  border: 1px solid #dce8fb;
  padding: 8px 18px;
  border-radius: 10px;
  color: #25436d;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  min-width: 270px;
  line-height: 1.8;
}
.settings-banner svg {
  color: #7293c7;
}
.settings-panel {
  border: 1px solid var(--theme-border);
  border-radius: 11px;
  background: var(--theme-surface);
  padding: 23px;
  margin-bottom: 20px;
}
.settings-section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 19px;
}
.settings-section-heading h3 {
  font-size: calc(16px * var(--taskflow-font-scale, 1));
  font-weight: 650;
  letter-spacing: -0.3px;
}
.settings-section-heading > span {
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
}
.settings-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.settings-category-card {
  display: flex;
  gap: 16px;
  align-items: center;
  border: 1px solid var(--theme-border);
  border-radius: 7px;
  padding: 16px;
  min-height: 96px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.settings-category-card:hover {
  border-color: color-mix(in srgb, var(--theme-accent) 50%, var(--theme-border));
  box-shadow: 0 4px 12px #21335a08;
}
.settings-category-card > span:nth-child(2) {
  flex: 1;
  min-width: 0;
}
.settings-category-card > svg {
  flex-shrink: 0;
  color: #71809c;
}
.settings-category-card h4 {
  font-weight: 650;
  font-size: calc(13px * var(--taskflow-font-scale, 1));
  margin-bottom: 5px;
}
.settings-category-card p {
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  line-height: 1.65;
}
.settings-category-card small {
  display: block;
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  margin-top: 5px;
  color: var(--theme-accent);
}
.settings-category-icon {
  display: grid;
  width: 47px;
  height: 47px;
  place-items: center;
  border-radius: 50%;
  flex-shrink: 0;
  background: #ede9fc;
  color: #7451cc;
}
.settings-category-icon.blue {
  background: #e0f0fe;
  color: #278af0;
}
.settings-category-icon.green {
  background: #def5ea;
  color: #1b9b68;
}
.settings-category-icon.orange {
  background: #fff0df;
  color: #f18b2d;
}
.settings-category-icon.pink {
  background: #fce4ed;
  color: #e05888;
}
.settings-category-icon.slate {
  background: #e8eef5;
  color: #526b87;
}
.settings-footer-banner {
  display: flex;
  align-items: center;
  gap: 23px;
  padding: 20px;
  border: 1px solid #d5eee3;
  border-radius: 7px;
  background: #eff9f5;
  margin-top: 20px;
  color: #284b42;
}
.settings-footer-banner > svg {
  color: #55ae80;
  flex-shrink: 0;
}
.settings-footer-banner b {
  font-size: calc(12px * var(--taskflow-font-scale, 1));
}
.settings-footer-banner p {
  margin-top: 5px;
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  color: #5b7c71;
  line-height: 1.6;
}
.settings-empty {
  padding: 30px;
  text-align: center;
  color: var(--theme-muted);
  font-size: calc(13px * var(--taskflow-font-scale, 1));
}
.settings-back {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--theme-muted);
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  margin-bottom: 16px;
}
.settings-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.settings-options a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 13px;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  border: 1px solid var(--theme-border);
  border-radius: 7px;
}
.settings-options a:hover,
.settings-options a.selected {
  color: var(--theme-accent);
  background: var(--theme-canvas);
  border-color: var(--theme-accent);
}
.settings-options svg {
  flex-shrink: 0;
}
.settings-preferences {
  margin-top: 25px;
}
.setting-detail h3 {
  font-size: calc(20px * var(--taskflow-font-scale, 1));
  font-weight: 650;
  margin: 15px 0 10px;
}
.setting-detail p {
  color: var(--theme-muted);
  font-size: calc(13px * var(--taskflow-font-scale, 1));
  line-height: 1.7;
  margin-top: 12px;
  max-width: 550px;
}
.settings-status {
  display: inline-block;
  padding: 4px 9px;
  border-radius: 20px;
  background: var(--theme-subtle);
  color: var(--theme-muted);
  font-size: calc(10px * var(--taskflow-font-scale, 1));
}
.settings-action {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--theme-accent);
  font-size: calc(13px * var(--taskflow-font-scale, 1));
}
.settings-project-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 22px;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--theme-border);
}
.settings-project-heading h3 {
  font-size: calc(16px * var(--taskflow-font-scale, 1));
  font-weight: 650;
}
.settings-project-heading p {
  margin-top: 7px;
  color: var(--theme-muted);
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  line-height: 1.6;
}
.settings-project-heading label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  max-width: 270px;
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  font-weight: 600;
  color: var(--theme-muted);
}
.settings-project-heading select {
  width: 100%;
  border: 1px solid var(--theme-border);
  border-radius: 7px;
  background: var(--theme-surface);
  color: var(--theme-text);
  padding: 9px 12px;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
}
@media (max-width: 1000px) {
  .settings-project-heading {
    flex-direction: column;
    gap: 16px;
  }
  .settings-project-heading label {
    width: 100%;
    max-width: none;
  }
}
html[data-theme="night"] .settings-banner {
  background: #1a3350;
  border-color: #27476a;
  color: #b8d1fa;
}
html[data-theme="night"] .settings-footer-banner {
  background: #17352d;
  border-color: #285045;
  color: #b5e2ce;
}
html[data-theme="night"] .settings-footer-banner p {
  color: #94b5aa;
}
@media (max-width: 1300px) {
  .settings-banner {
    display: none;
  }
  .settings-main {
    padding: 24px;
  }
  .settings-layout {
    grid-template-columns: 210px minmax(0, 1fr);
  }
  .settings-category-card {
    padding: 15px 12px;
    gap: 12px;
  }
  .settings-panel {
    padding: 18px;
  }
}
@media (max-width: 1100px) {
  .settings-card-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 800px) {
  .settings-layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .settings-rail {
    border-right: 0;
    border-bottom: 1px solid var(--theme-border);
    padding: 18px;
  }
  .settings-rail h1 {
    display: none;
  }
  .settings-rail .shell-search {
    margin-bottom: 10px;
  }
  .settings-rail nav {
    display: flex;
    overflow-x: auto;
    gap: 4px;
  }
  .settings-rail nav a {
    white-space: nowrap;
    padding: 8px 10px;
    flex-shrink: 0;
  }
  .settings-rail-note {
    display: none;
  }
  .settings-main {
    padding: 20px 14px;
  }
  .settings-options {
    grid-template-columns: 1fr;
  }
}
`;
