import styled, { createGlobalStyle } from "styled-components";
import type { Project } from "../common/entities/project";

export const ProjectDirectoryStyles = createGlobalStyle`
  .project-directory {
    --project-link: var(--theme-accent);
    max-width: 1580px;
    margin-inline: auto;
    min-width: 0;
    padding: clamp(1rem, 2.5vw, 2.25rem);
    color: var(--theme-text);
  }
  [data-theme="night"] .project-directory { --project-link: #c3bafc; }
  .project-directory-header, .project-directory-tools, .project-section-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .project-directory-header { margin-bottom: 1.25rem; }
  .project-directory-header h1 { font-size: 2rem; font-weight: 750; letter-spacing: -0.04em; }
  .project-directory-search { display: flex; align-items: center; gap: 0.5rem; width: 100%; max-width: 32rem; margin-bottom: 1.5rem; border: 1px solid var(--theme-border); border-radius: 0.5rem; padding: 0.6rem 0.75rem; background: var(--theme-surface); color: var(--theme-muted); }
  .project-directory-search input { flex: 1; width: 100%; min-width: 0; background: transparent; color: var(--theme-text); font-size: 0.8rem; }
  .project-directory-search:focus-within { outline: 2px solid var(--theme-accent); outline-offset: 2px; }
  .project-directory-search input:focus-visible { outline: none; }
  .project-directory-tools select {
    border: 1px solid var(--theme-border); border-radius: 0.5rem;
    padding: 0.5rem 0.65rem; background: var(--theme-surface); font-size: 0.8rem;
  }
  .project-create-button {
    border-radius: 0.5rem; padding: 0.5rem 0.85rem;
    background: var(--theme-accent); color: white; font-size: 0.8rem; font-weight: 650;
  }
  .project-directory button:disabled { opacity: 0.65; cursor: default; }
  .project-directory :is(button, a, select, input):focus-visible {
    outline: 2px solid var(--theme-accent); outline-offset: 3px;
  }
  .project-directory-section + .project-directory-section { margin-top: 1.75rem; }
  .project-section-heading { margin-bottom: 0.8rem; }
  .project-section-heading h2 { font-size: 1rem; font-weight: 700; }
  .project-section-count { margin-left: 0.45rem; font-size: 0.75rem; color: var(--theme-muted); font-weight: 500; }
  .project-directory-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
  .project-owner { display: flex; align-items: center; gap: 0.45rem; min-width: 0; color: var(--theme-text); }
  .project-owner .avatar, .project-request-inbox .avatar { color: var(--theme-text); background: var(--theme-subtle); }
  .project-card-open { position: absolute; inset: 0; z-index: 1; border-radius: 0.75rem; cursor: pointer; }
  .project-owner > div { display: grid; min-width: 0; }
  .project-owner small { color: var(--theme-muted); font-size: 0.62rem; line-height: 1.2; }
  .project-owner div > span { font-size: 0.72rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .organization-project-card {
    display: flex; flex-direction: column; min-width: 0; gap: 0.7rem;
    padding: 1rem; background: var(--theme-surface); border: 1px solid var(--theme-border); border-radius: 0.75rem;
  }
  .organization-project-card h3 { font-size: 0.875rem; font-weight: 650; overflow-wrap: anywhere; }
  .organization-project-description { color: var(--theme-muted); font-size: 0.78rem; line-height: 1.125rem; min-height: 2.25rem;
    display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;
  }
  .organization-project-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; font-size: 0.7rem; color: var(--theme-muted); }
  .organization-project-meta time { margin-left: auto; }
  .organization-project-footer { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-top: auto; padding-top: 0.25rem; }
  .project-text-link { display: inline-flex; align-items: center; gap: 0.25rem; color: var(--project-link, var(--theme-accent)); font-size: 0.75rem; font-weight: 650; flex-shrink: 0; }
  .project-text-link:hover { text-decoration: underline; }
  .project-request-pending { font-size: 0.7rem; color: var(--theme-muted); flex-shrink: 0; }
  .project-directory-empty { border: 1px dashed var(--theme-border); border-radius: 0.75rem; padding: 1.25rem; font-size: 0.8rem; color: var(--theme-muted); }
  .project-more { display: flex; justify-content: flex-end; margin-top: 0.8rem; }
  .project-request-reason { width: 100%; resize: vertical; min-height: 6rem; max-height: 16rem; padding: 0.65rem; border: 1px solid var(--theme-border); border-radius: 0.5rem; background: var(--theme-surface); color: var(--theme-text); font-size: 0.85rem; }
  .project-request-reason:focus-visible { outline: 2px solid var(--theme-accent); outline-offset: 2px; }
  .project-request-inbox { margin-bottom: 1.5rem; border: 1px solid var(--theme-border); border-radius: 0.75rem; background: var(--theme-surface); padding: 1rem; }
  .project-request-inbox h2 { font-size: 1rem; font-weight: 700; }
  .project-request-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; border-top: 1px solid var(--theme-border); margin-top: 0.75rem; padding-top: 0.75rem; font-size: 0.8rem; }
  .project-request-row > div:first-child { min-width: 0; flex: 1 1 18rem; }
  .project-request-row p { color: var(--theme-muted); overflow-wrap: anywhere; margin-top: 0.25rem; }
  .project-request-row button { padding: 0.35rem 0.6rem; border: 1px solid var(--theme-border); border-radius: 0.4rem; font-size: 0.75rem; }
  @media (max-width: 1150px) { .project-directory-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 650px) {
    .project-directory-grid { grid-template-columns: minmax(0, 1fr); }
    .project-directory-header h1 { font-size: 1.75rem; }
    .project-directory-tools { gap: 0.5rem; }
  }
`;

export const ProjectCardFrame = styled.article`
  position: relative;
  height: 100%;
  min-width: 0;
`;

export const ProjectCardSurface = styled.div`
  display: flex;
  height: 100%;
  cursor: pointer;
  flex-direction: column;
  border: 1px solid var(--theme-border);
  border-radius: 0.75rem;
  background: var(--theme-surface);
  color: var(--theme-text);
  padding: 1rem;
  box-shadow: var(--project-card-shadow);
  transition: box-shadow 150ms ease;

  &:hover {
    box-shadow: var(--project-card-shadow-hover);
  }
  &:focus {
    outline: 2px solid var(--project-card-focus);
    outline-offset: 2px;
  }
`;

export const ProjectCardHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-right: 1.5rem;
`;

export const ProjectCardAvatar = styled.span`
  display: flex;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: var(--project-card-avatar-background);
  color: var(--project-card-avatar-text);
  font-size: 1.125rem;
  font-weight: 700;
`;

export const ProjectCardHeadingContent = styled.div`
  min-width: 0;
`;
export const ProjectCardNumber = styled.span``;

export const ProjectCardDescription = styled.p`
  display: -webkit-box;
  min-height: 2.25rem;
  overflow: hidden;
  margin-top: 0.65rem;
  color: var(--theme-muted);
  font-size: 0.78rem;
  line-height: 1.125rem;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`;

export const ProjectCardStatus = styled.span<{ $status: Project["status"] }>`
  display: block;
  width: fit-content;
  border-radius: 9999px;
  padding: 0.15rem 0.45rem;
  font-size: 0.65rem;
  font-weight: 500;
  background: ${({ $status }) => ($status === "archived" ? "var(--project-card-archived-background)" : $status === "upcoming" ? "var(--project-card-upcoming-background)" : "var(--project-card-active-background)")};
  color: ${({ $status }) => ($status === "archived" ? "var(--project-card-archived-text)" : $status === "upcoming" ? "var(--project-card-upcoming-text)" : "var(--project-card-active-text)")};
`;

export const ProjectCardProgressSection = styled.div`
  margin-top: 0.65rem;
`;
export const ProjectCardProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.375rem;
  color: var(--theme-muted);
  font-size: 0.72rem;
  line-height: 1rem;
`;
export const ProjectCardProgressValue = styled.span``;
export const ProjectCardProgressName = styled.span``;

export const ProjectCardProgressTrack = styled.div`
  height: 0.375rem;
  overflow: hidden;
  border-radius: 9999px;
  background: var(--project-card-progress-track);
`;

export const ProjectCardProgressFill = styled.div`
  height: 100%;
  border-radius: 9999px;
  background: var(--project-card-progress-fill);
`;

export const ProjectCardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.8rem;
`;

export const ProjectCardDefaultBadge = styled.span`
  border-radius: 0.25rem;
  background: var(--project-card-default-background);
  padding: 0.125rem 0.375rem;
  color: var(--project-card-default-text);
  font-size: calc(10px * var(--taskflow-font-scale, 1));
  font-weight: 500;
`;

export const ProjectCardDue = styled.span<{ $urgent: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: 0.5rem;
  padding: 0.3rem 0.4rem;
  font-size: 0.68rem;
  background: ${({ $urgent }) => ($urgent ? "var(--project-card-urgent-background)" : "var(--theme-subtle)")};
  color: ${({ $urgent }) => ($urgent ? "var(--project-card-urgent-text)" : "var(--theme-muted)")};
`;

export const CreateProjectOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--project-dialog-overlay);
  padding: 1rem;
`;

export const CreateProjectPanel = styled.div`
  width: 100%;
  max-width: 32rem;
  overflow: hidden;
  max-height: calc(100dvh - 2rem);
  overflow-y: auto;
  border-radius: 1rem;
  background: var(--theme-surface);
  color: var(--theme-text);
  box-shadow: var(--project-dialog-panel-shadow);
`;

export const CreateProjectHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--theme-border);
  padding: 1rem 1.5rem;
`;

export const CreateProjectTitle = styled.h2`
  color: var(--theme-text);
  font-size: 1.25rem;
  font-weight: 600;
`;

export const CreateProjectCloseButton = styled.button`
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  padding: 0.375rem;
  color: var(--project-dialog-close-text);
  transition:
    background-color 150ms ease,
    color 150ms ease;

  &:hover:not(:disabled) {
    background: var(--project-dialog-close-hover-background);
    color: var(--project-dialog-close-hover-text);
  }
  &:focus-visible {
    outline: 2px solid var(--project-card-focus);
    outline-offset: 2px;
  }
  &:disabled {
    opacity: 0.5;
  }
`;

export const CreateProjectForm = styled.form`
  padding: 1.25rem 1.5rem;
`;
export const CreateProjectFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
export const CreateProjectField = styled.div``;

export const CreateProjectLabel = styled.label`
  display: block;
  margin-bottom: 0.25rem;
  color: var(--theme-text);
  font-size: 0.875rem;
  font-weight: 500;
`;

const projectFieldStyle = `
  width: 100%;
  border: 1px solid var(--theme-border);
  border-radius: 0.5rem;
  background: var(--theme-surface);
  color: var(--theme-text);
  padding: 0.625rem;
  &:focus { outline: 2px solid var(--project-card-focus); outline-offset: 1px; }
`;

export const CreateProjectInput = styled.input`
  ${projectFieldStyle}
`;
export const CreateProjectSelect = styled.select`
  ${projectFieldStyle} margin-top: 0.25rem;
`;

export const CreateProjectError = styled.p`
  margin-top: 0.75rem;
  color: var(--project-dialog-error);
  font-size: 0.875rem;
`;

export const CreateProjectActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

export const CreateProjectCancelButton = styled.button`
  border: 0;
  border-radius: 0.5rem;
  background: var(--project-dialog-cancel-background);
  padding: 0.5rem 1rem;
  color: var(--project-dialog-cancel-text);
  &:hover:not(:disabled) {
    background: var(--project-dialog-cancel-hover-background);
  }
  &:disabled {
    opacity: 0.5;
  }
`;

export const CreateProjectSubmitButton = styled.button`
  border: 0;
  border-radius: 0.5rem;
  background: var(--project-dialog-submit-background);
  padding: 0.5rem 1rem;
  color: var(--project-dialog-submit-text);
  &:hover:not(:disabled) {
    background: var(--project-dialog-submit-hover-background);
  }
  &:disabled {
    opacity: 0.5;
  }
`;
