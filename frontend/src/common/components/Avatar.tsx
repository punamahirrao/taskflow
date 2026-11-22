import { useState } from "react";
import styled from "styled-components";

const AvatarFrame = styled.span`
  display: inline-flex;
  position: relative;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  background: color-mix(in srgb, var(--theme-accent) 12%, var(--theme-surface));
  color: var(--theme-accent);
  font-weight: 600;
  line-height: 1;
  vertical-align: middle;
  img {
    display: block;
    width: 100%;
    height: 100%;
    max-width: none;
    object-fit: cover;
    object-position: center;
    border-radius: inherit;
  }
`;

interface AvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: number;
  initials?: string;
}

function resolvePhotoUrl(photoUrl?: string | null) {
  if (!photoUrl?.trim()) return null;
  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
    return new URL(photoUrl, new URL(`${apiBase.replace(/\/+$/, "")}/`, window.location.origin))
      .href;
  } catch {
    return null;
  }
}

export default function Avatar({ name, photoUrl, size = 40, initials }: AvatarProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const source = resolvePhotoUrl(photoUrl);
  const words = name.trim().split(/\s+/);
  const fallback =
    initials ||
    `${words[0]?.charAt(0) ?? ""}${words.length > 1 ? (words.at(-1)?.charAt(0) ?? "") : ""}`.toUpperCase() ||
    "?";
  return (
    <AvatarFrame
      className="avatar"
      role="img"
      aria-label={`${name} profile picture`}
      style={{
        width: size,
        height: size,
        aspectRatio: "1 / 1",
        fontSize: Math.max(12, size * 0.32),
      }}
    >
      {source && source !== failedSource ? (
        <img key={source} src={source} alt="" onError={() => setFailedSource(source)} />
      ) : (
        fallback
      )}
    </AvatarFrame>
  );
}
