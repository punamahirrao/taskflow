import styled from "styled-components";

export const LoginForgotButton = styled.button`
  align-self: flex-start;
  border: 0;
  background: transparent;
  color: var(--auth-muted-text);
  font-size: 0.875rem;
  &:disabled {
    cursor: not-allowed;
  }
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
  &:hover:not(:disabled) {
    background: var(--auth-accent-soft);
  }
  &:disabled {
    opacity: 0.6;
  }
`;

export const LoginAlternative = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1rem 0;
  color: var(--auth-muted-text);
  font-size: 0.75rem;
  &::before,
  &::after {
    height: 1px;
    flex: 1;
    background: var(--auth-field-border);
    content: "";
  }
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
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
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
  &:hover {
    text-decoration: underline;
  }
`;
