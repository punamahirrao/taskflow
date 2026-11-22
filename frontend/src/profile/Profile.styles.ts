import styled from "styled-components";

export const ProfileFormPanel = styled.form`
  border: 1px solid var(--profile-field-border);
  border-radius: 0.75rem;
  background: var(--project-card-surface);
  padding: 1.5rem;
  box-shadow: var(--profile-panel-shadow);
`;

export const ProfileSectionTitle = styled.h2`
  color: var(--profile-field-text);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

export const ProfileFieldLabel = styled.label`
  display: block;
  margin: 1rem 0 0.25rem;
  color: var(--profile-field-label);
  font-size: 0.875rem;
`;

const profileControl = `
  width: 100%;
  border: 1px solid var(--profile-field-border);
  border-radius: 0.5rem;
  background: var(--profile-field-background);
  padding: 0.5rem 0.75rem;
  color: var(--profile-field-text);
  font-size: 0.875rem;
  &:focus { border-color: var(--profile-focus); outline: 2px solid var(--profile-focus-ring); }
  &:read-only { cursor: not-allowed; color: var(--profile-field-muted); }
`;

export const ProfileFieldInput = styled.input`
  ${profileControl}
`;
export const ProfileFieldTextArea = styled.textarea`
  ${profileControl} resize: vertical;
`;

export const ProfileDivider = styled.hr`
  margin: 1.5rem 0;
  border-color: var(--profile-divider);
`;

export const ProfileError = styled.p`
  margin-top: 1rem;
  color: var(--profile-danger);
  font-size: 0.875rem;
`;

export const ProfileSuccess = styled.p`
  margin-top: 1rem;
  color: var(--profile-success);
  font-size: 0.875rem;
`;

export const ProfileSaveButton = styled.button`
  margin-top: 1.5rem;
  cursor: pointer;
  border: 0;
  border-radius: 0.5rem;
  background: var(--profile-accent);
  padding: 0.5rem 1.25rem;
  color: var(--profile-button-text);
  font-size: 0.875rem;
  font-weight: 500;
  &:disabled {
    opacity: 0.5;
  }
`;
