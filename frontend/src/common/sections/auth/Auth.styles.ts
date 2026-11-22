import styled from "styled-components";

export const AuthPanel = styled.div`
  width: 100%;
  max-width: 28rem;
  border: 1px solid var(--project-dialog-border);
  border-radius: 1rem;
  background: var(--project-card-surface);
  padding: 1.5rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
`;

export const AuthHeading = styled.h1`
  color: var(--auth-label-text);
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
`;

export const AuthSubtitle = styled.p`
  margin: 0.25rem 0 1rem;
  color: var(--project-card-muted-text);
  text-align: center;
  font-size: 0.875rem;
`;

export const AuthFormElement = styled.form`
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
  &:focus {
    border-color: var(--auth-focus);
    outline: 2px solid var(--auth-focus);
  }
`;

export const AuthError = styled.p`
  color: var(--auth-danger);
  font-size: 0.875rem;
`;

export const AuthSubmitButton = styled.button`
  width: 100%;
  border: 0;
  border-radius: 0.5rem;
  background: var(--auth-accent);
  padding: 0.625rem;
  color: var(--auth-white);
  font-weight: 500;
  &:hover:not(:disabled) {
    background: var(--auth-accent-hover);
  }
  &:disabled {
    opacity: 0.7;
  }
`;

export const AuthPage = styled.main`
  display: grid;
  min-height: 100dvh;
  grid-template-columns: minmax(0, 1fr);
  @media (min-width: 64rem) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const AuthContent = styled.section<{ $compact?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--theme-canvas);
  padding: ${({ $compact }) => ($compact ? "1rem" : "2rem")} 1.5rem 5rem;
`;

export const AuthBrand = styled.div<{ $compact?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: ${({ $compact }) => ($compact ? "0.75rem" : "1.25rem")};
  color: var(--auth-label-text);
  font-size: 1.875rem;
  font-weight: 700;
`;

export const AuthBrandIcon = styled.span`
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--auth-accent);
  color: var(--auth-white);
  font-size: 1.25rem;
`;

export const AuthCredit = styled.p`
  position: absolute;
  inset: auto 1.5rem 1rem;
  margin: 0;
  color: var(--theme-muted);
  font-size: 0.75rem;
  line-height: 1.625;
  text-align: right;
`;
