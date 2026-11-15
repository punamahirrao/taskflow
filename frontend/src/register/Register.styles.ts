import styled from "styled-components";

export const RegisterFieldLabel = styled.label`
  display: flex;
  flex-direction: column;
  color: var(--auth-label-text);
  font-size: 0.875rem;
  font-weight: 700;
`;

export const RegisterFieldInput = styled.input`
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

export const RegisterFormElement = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const RegisterError = styled.p`
  color: var(--auth-danger);
  font-size: 0.875rem;
`;

export const RegisterSubmitButton = styled.button`
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
