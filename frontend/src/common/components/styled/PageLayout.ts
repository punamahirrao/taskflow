import styled from "styled-components";

export const PaddedPage = styled.main`
  min-width: 0;
  padding: 1.5rem;

  @media (min-width: 48rem) {
    padding: 2rem;
  }
`;

export const SurfacePage = styled(PaddedPage)`
  min-height: 100vh;
  background: var(--theme-surface);
`;
