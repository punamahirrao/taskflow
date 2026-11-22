import { createContext, type ReactNode } from "react";

export type StoryFeatureFlags = Record<string, boolean>;
const StoryFeatureFlagsContext = createContext<StoryFeatureFlags>({});

export function FeatureFlagsProvider({
  children,
  flags = {},
}: {
  children: ReactNode;
  flags?: StoryFeatureFlags;
}) {
  return (
    <StoryFeatureFlagsContext.Provider value={flags}>{children}</StoryFeatureFlagsContext.Provider>
  );
}
