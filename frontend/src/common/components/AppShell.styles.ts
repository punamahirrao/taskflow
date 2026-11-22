import { createGlobalStyle } from "styled-components";

export const AppShellStyles = createGlobalStyle`
.app-shell {
  --shell-header-height: 70px;
  --shell-sidebar-width: 244px;
  --shell-chrome-background: #122235;
  --shell-corner-radius: 20px;
  display: grid;
  grid-template-columns: var(--shell-sidebar-width) minmax(0, 1fr);
  min-height: 100vh;
  background: var(--shell-chrome-background);
  color: var(--theme-text);
  font-family: var(--taskflow-font-family, "Segoe UI", Arial, sans-serif);
  transition: grid-template-columns 0.2s ease;
}
.app-shell.sidebar-collapsed {
  --shell-sidebar-width: 76px;
  grid-template-columns: var(--shell-sidebar-width) minmax(0, 1fr);
}
.shell-body,
.shell-content {
  min-width: 0;
}
.shell-body {
  background: var(--shell-chrome-background);
}
.shell-content {
  min-height: calc(100dvh - var(--shell-header-height));
  background: var(--theme-canvas);
  border-radius: var(--shell-corner-radius) 0 0 0;
  overflow: clip;
}
.shell-content > main:not(.settings-layout):not(.sprint-train-page) {
  padding-inline: clamp(16px, 2.5vw, 36px);
}
.app-shell .platform-sidebar.shell-sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  padding: 22px 12px 12px;
  background: var(--shell-chrome-background) !important;
  color: #d9e3f0 !important;
  border: 0;
  z-index: 50;
}
.shell-brand {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 4px 24px 8px;
}
.app-shell .shell-sidebar .shell-brand a {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: #fff !important;
  background: transparent !important;
  box-shadow: none;
  font-size: calc(23px * var(--taskflow-font-scale, 1));
  font-weight: 700;
  letter-spacing: -0.8px;
  flex: 1;
}
.shell-brand .taskflow-logo {
  --taskflow-logo-mark-size: 40px;
  --taskflow-logo-font-size: 23px;
  width: 100%;
}
.is-collapsed .shell-brand .taskflow-logo {
  width: 40px;
}
.sidebar-toggle {
  display: grid;
  place-items: center;
  width: 26px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 6px;
  color: #96aac3;
  cursor: pointer;
}
.sidebar-toggle:hover {
  color: #fff;
  background: #243b53;
}
.shell-navigation {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #3b506a transparent;
  padding-bottom: 12px;
}
.app-shell .shell-sidebar nav .shell-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 39px;
  padding: 9px 13px;
  margin: 2px 0;
  border-radius: 7px;
  color: #c8d6e9 !important;
  font-size: calc(13px * var(--taskflow-font-scale, 1));
  text-align: left;
  background: transparent !important;
  box-shadow: none;
  cursor: pointer;
}
.shell-nav-link svg {
  flex-shrink: 0;
}
.shell-nav-link > span {
  min-width: 0;
  overflow-wrap: anywhere;
}
.app-shell .shell-sidebar nav .shell-nav-link:hover {
  background: #20374f !important;
  color: white !important;
}
.app-shell .shell-sidebar nav .shell-nav-link.active {
  background: #315b96 !important;
  color: white !important;
  font-weight: 600;
  box-shadow: inset 3px 0 #8bb5ff;
}
.shell-nav-link:focus-visible,
.organization-switcher button:focus-visible,
.sidebar-toggle:focus-visible {
  outline: 2px solid #a5b4fc;
  outline-offset: -2px;
}
.shell-submenu {
  margin-left: 21px;
  border-left: 1px solid #34465c;
  padding-left: 5px;
}
.shell-submenu .shell-nav-link {
  font-size: calc(12px * var(--taskflow-font-scale, 1)) !important;
}
.shell-nav-divider {
  height: 1px;
  margin: 12px 10px;
  background: #2d4159;
}
.is-collapsed .shell-brand {
  padding: 0 0 24px;
  justify-content: center;
}
.is-collapsed .shell-brand a {
  justify-content: center;
}
.is-collapsed .sidebar-toggle {
  position: absolute;
  right: -23px;
  top: 6px;
  width: 24px;
  height: 26px;
  border: 1px solid #34465c;
  background: #1c3046;
  color: #d9e3f0;
  border-radius: 6px;
  z-index: 1;
}
.is-collapsed nav .shell-nav-link {
  justify-content: center;
  padding-inline: 0;
}
.project-switcher {
  position: relative;
  margin-bottom: 16px;
}
.project-switcher-trigger {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 10px;
  padding: 10px;
  border: 1px solid #34465c;
  border-radius: 8px;
  color: #e2eaf6;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  cursor: pointer;
}
.project-mark {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: #7c66c3;
  color: white;
  flex-shrink: 0;
}
.is-collapsed .project-switcher-trigger {
  padding: 8px;
  justify-content: center;
}
.popover-dismiss {
  position: fixed;
  inset: 0;
  cursor: default;
  z-index: 55;
}
.project-picker {
  position: absolute;
  left: 0;
  top: calc(100% + 7px);
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  background: var(--theme-surface);
  color: var(--theme-text);
  box-shadow: 0 14px 45px #07132326;
  padding: 10px;
  z-index: 60;
}
.project-picker.from-rail {
  left: 56px;
  top: 0;
  width: 335px;
  max-width: calc(100vw - 106px);
}
.picker-caption {
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  font-weight: 700;
  letter-spacing: 1.2px;
  color: var(--theme-muted);
  padding: 14px 8px 5px;
}
.picker-results {
  max-height: min(380px, 55vh);
  overflow-y: auto;
}
.project-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  width: 100%;
  text-align: left;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  border-radius: 6px;
  cursor: pointer;
}
.project-option:hover:enabled {
  background: var(--theme-subtle);
}
.project-option:disabled {
  color: var(--theme-muted);
  cursor: not-allowed;
}
.project-option small,
.restricted-search-result small {
  display: block;
  margin-top: 3px;
  color: var(--theme-muted);
  font-size: calc(10px * var(--taskflow-font-scale, 1));
}
.picker-message {
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  color: var(--theme-muted);
  padding: 12px 8px;
}
.picker-footer {
  display: block;
  padding: 12px 8px 4px;
  border-top: 1px solid var(--theme-border);
  color: var(--theme-accent);
  font-size: calc(12px * var(--taskflow-font-scale, 1));
}
.organization-switcher {
  position: relative;
  padding-top: 12px;
  border-top: 1px solid #2d4159;
}
.organization-switcher > button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 8px;
  width: 100%;
  border: 1px solid #34465c;
  border-radius: 8px;
  text-align: left;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  font-weight: 600;
  cursor: pointer;
}
.organization-mark {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  height: 40px;
  width: 40px;
  overflow: hidden;
  background: white;
  border-radius: 50%;
}
.organization-mark img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.organization-label {
  min-width: 0;
  flex: 1;
}
.organization-company {
  display: block;
  line-height: 1.4;
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  font-weight: 650;
}
.organization-switcher small {
  display: block;
  color: #99adc3;
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  margin-top: 3px;
  font-weight: 400;
}
.is-collapsed .organization-switcher > button {
  justify-content: center;
  padding: 8px 0;
}
.organization-popover {
  position: absolute;
  left: 0;
  bottom: 100%;
  width: 255px;
  padding: 18px;
  background: #20374f;
  color: white;
  border: 1px solid #3c5473;
  box-shadow: 0 8px 30px #0003;
  border-radius: 10px;
  font-size: calc(13px * var(--taskflow-font-scale, 1));
}
.organization-popover p {
  margin-block: 6px;
}
.shell-topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  height: var(--shell-header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 0 28px;
  border: 0;
  background: var(--shell-chrome-background);
  box-shadow: none;
  color: #d9e3f0;
}
.sidebar-collapsed .shell-topbar {
  padding-left: 28px;
}
.global-search {
  width: min(480px, 100%);
  position: relative;
  min-width: 0;
}
.shell-search {
  display: flex;
  align-items: center;
  gap: 9px;
  border: 1px solid var(--theme-border);
  background: var(--theme-canvas);
  color: var(--theme-muted);
  border-radius: 7px;
  padding: 9px 12px;
}
.shell-search:focus-within {
  border-color: var(--theme-accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--theme-accent) 10%, transparent);
}
.shell-search svg {
  flex-shrink: 0;
}
.shell-search input {
  width: 100%;
  min-width: 0;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  background: transparent !important;
  outline: none;
  color: var(--theme-text);
}
.shell-search kbd {
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  border: 1px solid var(--theme-border);
  padding: 0 5px;
  border-radius: 3px;
}
.shell-topbar .shell-search {
  border-color: #3b526c;
  background: #20374f;
  color: #b9cce0;
}
.shell-topbar .shell-search input {
  color: #f1f6fc;
}
.shell-topbar .shell-search input::placeholder {
  color: #b9cce0;
  opacity: 1;
}
.shell-topbar .shell-search:focus-within {
  border-color: #a8b9fb;
  box-shadow: 0 0 0 2px #a8b9fb33;
}
.shell-topbar .shell-search kbd {
  border-color: #526a84;
  color: #d9e3f0;
}
.shell-topbar .profile-menu-trigger,
.shell-topbar .topbar-icon {
  color: #d9e3f0;
}
.shell-topbar .profile-menu-trigger {
  background: #122235;
}
.shell-topbar .profile-menu-trigger:hover,
.shell-topbar .topbar-icon:hover {
  background: #243b53;
  color: #fff;
}
.shell-topbar .topbar-divider {
  background: #3b506a;
}
.shell-topbar .profile-menu-name > span:first-child {
  color: #f1f6fc;
}
.shell-topbar .profile-menu-name > span + span {
  color: #b9cce0;
  background: #122235;
}
.shell-topbar .profile-menu-trigger .avatar {
  background: #344d68;
  color: #f1f6fc;
}
.shell-topbar :is(.global-search-results, .profile-menu-dropdown, .notification-popover) {
  color: var(--theme-text);
}
.global-search-results {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  width: 100%;
  max-height: 70vh;
  overflow-y: auto;
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 10px;
  padding: 8px;
  box-shadow: 0 16px 35px #101a3020;
}
.global-search-results a,
.restricted-search-result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px;
  border-radius: 6px;
  font-size: calc(12px * var(--taskflow-font-scale, 1));
}
.global-search-results a:hover {
  background: var(--theme-subtle);
  color: var(--theme-accent);
}
.restricted-search-result {
  color: var(--theme-muted);
}
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}
.topbar-actions > .relative {
  max-width: 220px;
}
.profile-menu {
  position: relative;
  min-width: 0;
  max-width: 240px;
}
.profile-menu-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
  padding: 5px 8px;
  border-radius: 9px;
  cursor: pointer;
  text-align: left;
}
.profile-menu-trigger:hover {
  background: var(--theme-subtle);
}
.profile-menu-trigger:focus-visible {
  outline: 2px solid var(--theme-focus);
  outline-offset: 2px;
}
.profile-menu-name {
  flex: 1;
  min-width: 0;
}
.profile-menu-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 50;
  width: 256px;
  max-width: calc(100vw - 32px);
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  background: var(--theme-surface);
  padding-block: 8px;
  box-shadow: 0 12px 35px #101a3020;
}
.topbar-divider {
  height: 30px;
  width: 1px;
  background: var(--theme-border);
}
.topbar-icon {
  display: grid;
  place-items: center;
  height: 36px;
  width: 36px;
  border-radius: 50%;
  color: var(--theme-muted);
  cursor: pointer;
}
.topbar-icon:hover {
  background: var(--theme-subtle);
  color: var(--theme-accent);
}
.notification-menu {
  position: relative;
}
.notification-popover {
  position: absolute;
  top: 48px;
  right: 0;
  width: 290px;
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  background: var(--theme-surface);
  box-shadow: 0 12px 40px #101a3020;
  padding: 20px;
  text-align: center;
}
.notification-popover h2 {
  text-align: left;
  font-size: calc(14px * var(--taskflow-font-scale, 1));
  font-weight: 650;
  margin-bottom: 25px;
}
.notification-popover > svg {
  margin: 0 auto 14px;
  color: var(--theme-muted);
}
.notification-popover b {
  font-size: calc(13px * var(--taskflow-font-scale, 1));
}
.notification-popover p {
  color: var(--theme-muted);
  font-size: calc(12px * var(--taskflow-font-scale, 1));
  margin: 7px 0 20px;
}
.notification-popover a {
  font-size: calc(11px * var(--taskflow-font-scale, 1));
  color: var(--theme-accent);
}
@media (max-width: 1000px) {
  .topbar-actions .profile-menu-name {
    display: none;
  }
  .shell-topbar {
    padding-inline: 18px;
  }
}
@media (max-width: 700px) {
  .app-shell {
    --shell-sidebar-width: 205px;
    grid-template-columns: var(--shell-sidebar-width) minmax(0, 1fr);
  }
  .app-shell.sidebar-collapsed {
    --shell-sidebar-width: 76px;
  }
  .shell-sidebar {
    padding-inline: 8px !important;
  }
  .shell-topbar {
    padding-inline: 12px;
    gap: 10px;
  }
  .topbar-actions {
    gap: 5px;
  }
  .topbar-divider,
  .shell-search kbd {
    display: none;
  }
  .shell-search {
    padding: 8px;
  }
  .shell-topbar .shell-search input {
    font-size: calc(11px * var(--taskflow-font-scale, 1));
  }
  .notification-popover {
    right: -50px;
    max-width: calc(100vw - 100px);
  }
  .global-search-results {
    width: min(310px, calc(100vw - 100px));
  }
}
@media (prefers-reduced-motion: reduce) {
  .app-shell {
    transition: none;
  }
}

.data-environment-badge {
  border: 1px solid #c4b5fd;
  background: #ede9fe;
  color: #5b21b6;
  border-radius: 6px;
  padding: 5px 8px;
  font:
    600 11px/1.2 system-ui,
    sans-serif;
  letter-spacing: 0.08em;
}
`;
