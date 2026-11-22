import styled, { createGlobalStyle } from "styled-components";
import { PaddedPage } from "../common/components/styled";

export const BoardPageShell = styled(PaddedPage)<{ $drawerOpen?: boolean }>`
  min-height: calc(100dvh - var(--shell-header-height, 0px));
  display: flex;
  flex-direction: column;
  width: ${({ $drawerOpen }) =>
    $drawerOpen
      ? "calc(100% - min(480px, calc(100vw - var(--shell-sidebar-width, 0px))))"
      : "100%"};
  ${({ $drawerOpen }) =>
    $drawerOpen &&
    `@media (max-width: 640px) {
      width: 100%;
    }`}
  max-width: none;
  padding: 1rem;
  background: var(--theme-canvas);
  color: var(--theme-text);
  overflow-x: clip;
  transition: width 180ms ease;

  @media (min-width: 48rem) {
    padding: 1.25rem;
  }
`;

export const BoardPageStyles = createGlobalStyle`
  .board-workflow-grid {
    grid-template-columns: repeat(var(--board-column-count), minmax(0, 1fr));
  }
  .board-page-details-open .board-workflow-grid {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr)) !important;
  }
  @media (max-width: 900px) {
    .board-workflow-grid {
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr)) !important;
    }
  }
  .sprint-story-drawer.board-task-details-drawer {
    position: fixed;
    top: var(--shell-header-height, 0px);
    right: 0;
    bottom: 0;
    z-index: 60;
    width: min(480px, calc(100vw - var(--shell-sidebar-width, 0px)));
    max-height: calc(100dvh - var(--shell-header-height, 0px));
    border: 0;
    border-left: 1px solid var(--theme-border, #e2e8f0);
    border-radius: 0;
    box-shadow: -16px 0 40px rgb(15 23 42 / 18%);
    animation: board-story-drawer-enter 200ms ease-out both;
  }
  .sprint-story-drawer.board-task-details-drawer.is-closing {
    pointer-events: none;
    animation: board-story-drawer-exit 200ms ease-in both;
  }
  @keyframes board-story-drawer-enter {
    from { transform: translateX(24px); opacity: 0.7; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes board-story-drawer-exit {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(24px); opacity: 0.7; }
  }
  @media (max-width: 640px) {
    .sprint-story-drawer.board-task-details-drawer {
      width: 100vw;
    }
  }
`;

export const BoardPageHeader = styled.header<{ $workspace?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: ${({ $workspace }) => ($workspace ? "1.5rem" : "1.75rem")};
`;

export const BoardPageTitle = styled.h1`
  margin-top: 0.25rem;
  color: var(--theme-text);
  font-size: 1.875rem;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.025em;
`;
