import styled from "styled-components";

export const EstimatorPageSurface = styled.main`
  min-height: 100vh;
  background: var(--theme-canvas);
  color: var(--theme-text);
  padding: 1.25rem;

  @media (min-width: 768px) { padding: 2rem; }
`;

export const EstimatorPageContent = styled.div`
  max-width: 64rem;
  margin: 0 auto;
`;

export const EstimatorPanel = styled.section`
  border: 1px solid var(--theme-border);
  border-radius: 1rem;
  background: var(--theme-surface);
  padding: 1.5rem;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);

  @media (min-width: 768px) { padding: 2rem; }
`;
