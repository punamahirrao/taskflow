import styled from "styled-components";
import type { Project } from "../common/entities/project";

export const ProjectCardFrame = styled.div`
  position: relative;
  height: 100%;
`;

export const ProjectCardSurface = styled.div`
  display: flex;
  height: 100%;
  cursor: pointer;
  flex-direction: column;
  border: 1px solid var(--project-card-border);
  border-radius: 1rem;
  background: var(--project-card-surface);
  padding: 1.25rem;
  box-shadow: var(--project-card-shadow);
  transition: box-shadow 150ms ease;

  &:hover { box-shadow: var(--project-card-shadow-hover); }
  &:focus { outline: 2px solid var(--project-card-focus); outline-offset: 2px; }
`;

export const ProjectCardHeading = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding-right: 2.25rem;
`;

export const ProjectCardAvatar = styled.span`
  display: flex;
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: var(--project-card-avatar-background);
  color: var(--project-card-avatar-text);
  font-size: 1.125rem;
  font-weight: 700;
`;

export const ProjectCardHeadingContent = styled.div`min-width: 0;`;
export const ProjectCardNumber = styled.span``;

export const ProjectCardDescription = styled.p`
  display: -webkit-box;
  min-height: 2.5rem;
  overflow: hidden;
  margin-top: 1rem;
  color: var(--project-card-muted-text);
  font-size: 0.875rem;
  line-height: 1.25rem;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`;

export const ProjectCardStatus = styled.span<{ $status: Project["status"] }>`
  display: block;
  width: fit-content;
  margin-top: 0.75rem;
  border-radius: 9999px;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${({ $status }) => $status === "archived" ? "var(--project-card-archived-background)" : $status === "upcoming" ? "var(--project-card-upcoming-background)" : "var(--project-card-active-background)"};
  color: ${({ $status }) => $status === "archived" ? "var(--project-card-archived-text)" : $status === "upcoming" ? "var(--project-card-upcoming-text)" : "var(--project-card-active-text)"};
`;

export const ProjectCardProgressSection = styled.div`margin-top: 1rem;`;
export const ProjectCardProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.375rem;
  color: var(--project-card-muted-text);
  font-size: 0.875rem;
  line-height: 1.25rem;
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
  margin-top: auto;
  padding-top: 1.25rem;
`;

export const ProjectCardDefaultBadge = styled.span`
  border-radius: 0.25rem;
  background: var(--project-card-default-background);
  padding: 0.125rem 0.375rem;
  color: var(--project-card-default-text);
  font-size: 10px;
  font-weight: 500;
`;

export const ProjectCardDue = styled.span<{ $urgent: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: 0.5rem;
  padding: 0.375rem 0.625rem;
  font-size: 0.75rem;
  background: ${({ $urgent }) => $urgent ? "var(--project-card-urgent-background)" : "var(--project-card-calm-background)"};
  color: ${({ $urgent }) => $urgent ? "var(--project-card-urgent-text)" : "var(--project-card-muted-text)"};
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
  border-radius: 1rem;
  background: var(--project-dialog-input-background);
  box-shadow: var(--project-dialog-panel-shadow);
`;

export const CreateProjectHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--project-dialog-border);
  padding: 1rem 1.5rem;
`;

export const CreateProjectTitle = styled.h2`
  color: var(--project-dialog-title);
  font-size: 1.25rem;
  font-weight: 600;
`;

export const CreateProjectCloseButton = styled.button`
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  padding: 0.375rem;
  color: var(--project-dialog-close-text);
  transition: background-color 150ms ease, color 150ms ease;

  &:hover:not(:disabled) {
    background: var(--project-dialog-close-hover-background);
    color: var(--project-dialog-close-hover-text);
  }
  &:focus-visible { outline: 2px solid var(--project-card-focus); outline-offset: 2px; }
  &:disabled { opacity: 0.5; }
`;

export const CreateProjectForm = styled.form`padding: 1.25rem 1.5rem;`;
export const CreateProjectFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
export const CreateProjectField = styled.div``;

export const CreateProjectLabel = styled.label`
  display: block;
  margin-bottom: 0.25rem;
  color: var(--project-dialog-label);
  font-size: 0.875rem;
  font-weight: 500;
`;

const projectFieldStyle = `
  width: 100%;
  border: 1px solid var(--project-dialog-input-border);
  border-radius: 0.5rem;
  background: var(--project-dialog-input-background);
  padding: 0.625rem;
  &:focus { outline: 2px solid var(--project-card-focus); outline-offset: 1px; }
`;

export const CreateProjectInput = styled.input`${projectFieldStyle}`;
export const CreateProjectSelect = styled.select`${projectFieldStyle} margin-top: 0.25rem;`;

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
  &:hover:not(:disabled) { background: var(--project-dialog-cancel-hover-background); }
  &:disabled { opacity: 0.5; }
`;

export const CreateProjectSubmitButton = styled.button`
  border: 0;
  border-radius: 0.5rem;
  background: var(--project-dialog-submit-background);
  padding: 0.5rem 1rem;
  color: var(--project-dialog-submit-text);
  &:hover:not(:disabled) { background: var(--project-dialog-submit-hover-background); }
  &:disabled { opacity: 0.5; }
`;
