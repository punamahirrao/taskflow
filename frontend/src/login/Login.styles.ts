import styled from "styled-components";

export const LoginPanel = styled.div`
  width: 100%;
  max-width: 28rem;
  border: 1px solid var(--project-dialog-border);
  border-radius: 1rem;
  background: var(--project-card-surface);
  padding: 1.5rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
`;

export const LoginHeading = styled.h1`
  color: var(--auth-label-text);
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
`;

export const LoginSubtitle = styled.p`
  margin: 0.25rem 0 1rem;
  color: var(--project-card-muted-text);
  text-align: center;
  font-size: 0.875rem;
`;

export const LoginFormElement = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const AuthFieldLabel = styled.label`
  display: flex;
  flex-direction: column;
  color: var(--auth-label-text);
  font-size: 0.875rem;
  font-weight: 700;
`;

export const AuthFieldInput = styled.input`
  width: 100%;
  margin-top: 0.25rem;
  border: 1px solid var(--auth-field-border);
  border-radius: 0.5rem;
  background: var(--auth-field-background);
  padding: 0.5rem 0.75rem;
  color: var(--auth-field-text);
  font-weight: 400;
  &:focus { border-color: var(--auth-focus); outline: 2px solid var(--auth-focus); }
`;

export const LoginForgotButton = styled.button`
  align-self: flex-start;
  border: 0;
  background: transparent;
  color: var(--auth-muted-text);
  font-size: 0.875rem;
  &:disabled { cursor: not-allowed; }
`;

export const LoginError = styled.p`
  color: var(--auth-danger);
  font-size: 0.875rem;
`;

export const LoginSubmitButton = styled.button`
  width: 100%;
  border: 0;
  border-radius: 0.5rem;
  background: var(--auth-accent);
  padding: 0.625rem;
  color: var(--auth-white);
  font-weight: 500;
  &:hover:not(:disabled) { background: var(--auth-accent-hover); }
  &:disabled { opacity: 0.7; }
`;

export const LoginOrgSection = styled.div`
  margin-top: 1.25rem;
  border-top: 1px solid var(--project-dialog-border);
  padding-top: 1.25rem;
`;

export const LoginOrgButton = styled.button`
  width: 100%;
  border: 1px solid var(--auth-accent-border);
  border-radius: 0.5rem;
  background: var(--auth-white);
  padding: 0.625rem;
  color: var(--auth-accent);
  font-weight: 500;
  &:hover:not(:disabled) { background: var(--auth-accent-soft); }
  &:disabled { opacity: 0.6; }
`;

export const LoginAlternative = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1rem 0;
  color: var(--auth-muted-text);
  font-size: 0.75rem;
  &::before, &::after { height: 1px; flex: 1; background: var(--auth-field-border); content: ""; }
`;

export const LoginSocialStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const LoginMicrosoftButton = styled.button`
  width: 100%;
  border: 0;
  border-radius: 0.5rem;
  background: var(--auth-social-background);
  padding: 0.5rem;
  color: var(--auth-white);
  font-size: 0.875rem;
  font-weight: 500;
  &:disabled { cursor: not-allowed; opacity: 0.6; }
`;

export const LoginMicrosoftContent = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

export const LoginMicrocopy = styled.p`
  color: var(--auth-muted-text);
  font-size: 0.75rem;
`;

export const LoginTerms = styled.p`
  margin-top: 1rem;
  color: var(--auth-muted-text);
  text-align: center;
  font-size: 0.75rem;
`;

export const LoginTermsLink = styled.a`
  color: var(--auth-accent);
  font-weight: 700;
  &:hover { text-decoration: underline; }
`;
