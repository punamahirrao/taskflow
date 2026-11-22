import styled from "styled-components";
import markUrl from "../../assets/branding/taskflow-flow-mark-v2.png";

const LogoFrame = styled.span<{ $compact: boolean; $inverse: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  width: ${({ $compact }) => ($compact ? "40px" : "fit-content")};
  max-width: 100%;
  flex-shrink: 0;
  background: transparent;
  color: ${({ $inverse }) => ($inverse ? "#f8fafc" : "var(--theme-text)")};
  line-height: 1;

  img {
    display: block;
    width: var(--taskflow-logo-mark-size, ${({ $compact }) => ($compact ? "40px" : "56px")});
    height: var(--taskflow-logo-mark-size, ${({ $compact }) => ($compact ? "40px" : "56px")});
    flex-shrink: 0;
    object-fit: contain;
  }

  .taskflow-wordmark {
    font-family: "Segoe UI", Arial, sans-serif;
    font-size: var(--taskflow-logo-font-size, 34px);
    font-weight: 750;
    letter-spacing: -0.045em;
    white-space: nowrap;
  }

`;

export default function TaskflowLogo({
  compact = false,
  inverse = false,
}: {
  compact?: boolean;
  inverse?: boolean;
}) {
  return (
    <LogoFrame $compact={compact} $inverse={inverse} className="taskflow-logo">
      <img src={markUrl} alt="Taskflow logo" />
      {!compact && (
        <span className="taskflow-wordmark" aria-hidden="true">
          Taskflow
        </span>
      )}
    </LogoFrame>
  );
}
