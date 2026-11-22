import { useCallback, useMemo, useLayoutEffect, type ReactNode } from "react";
import { dataScope, unwrapRequest } from "../../api/queryApi";
import { useAppDispatch } from "../../store";
import { TypographyContext } from "./TypographyContext";
import {
  useTypographyPreferencesQuery,
  useSaveTypographyPreferencesMutation,
  typographyCache,
} from "./api/typographyQuery";
import { DEFAULT_TYPOGRAPHY, fontStack, type TypographyPreferences } from "./localFonts";

export default function TypographyProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { organizationId, userId } = dataScope();
  const scope = useMemo(
    () => ({ organizationId, userId, projectId: null }),
    [organizationId, userId],
  );
  const query = useTypographyPreferencesQuery(scope);
  const preferences = query.currentData ?? DEFAULT_TYPOGRAPHY;
  const [savePreferences] = useSaveTypographyPreferencesMutation();
  const error = query.error
    ? ("message" in query.error && query.error.message) || "Font settings could not be loaded."
    : "";
  const refetch = query.refetch;
  const reload = useCallback(async () => {
    await unwrapRequest(refetch(), "Font settings could not be loaded.");
  }, [refetch]);
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousSize = root.style.fontSize;
    const previousFamily = root.style.getPropertyValue("--taskflow-font-family");
    const previousScale = root.style.getPropertyValue("--taskflow-font-scale");
    if (preferences.font_size !== 16) root.style.fontSize = `${preferences.font_size}px`;
    root.style.setProperty("--taskflow-font-scale", String(preferences.font_size / 16));
    if (preferences.font_family)
      root.style.setProperty("--taskflow-font-family", fontStack(preferences.font_family));
    return () => {
      root.style.fontSize = previousSize;
      if (previousFamily) root.style.setProperty("--taskflow-font-family", previousFamily);
      else root.style.removeProperty("--taskflow-font-family");
      if (previousScale) root.style.setProperty("--taskflow-font-scale", previousScale);
      else root.style.removeProperty("--taskflow-font-scale");
    };
  }, [preferences]);

  const save = useCallback(
    async (value: TypographyPreferences) => {
      const saved = await unwrapRequest(
        savePreferences(value),
        "Font settings could not be applied.",
      );
      await dispatch(typographyCache.upsertQueryData("typographyPreferences", scope, saved));
    },
    [dispatch, savePreferences, scope],
  );

  return (
    <TypographyContext.Provider
      value={{ preferences, loading: query.isLoading, error, save, reload }}
    >
      {children}
    </TypographyContext.Provider>
  );
}
