import { useCallback, useMemo, type ReactNode } from "react";
import { dataScope, unwrapRequest } from "../../api/queryApi";
import { useAppDispatch } from "../../store";
import { NavigationContext } from "./NavigationContext";
import {
  useNavigationPreferencesQuery,
  useSaveNavigationPreferencesMutation,
  navigationCache,
} from "./api/navigationQuery";
import type { NavigationOverrides } from "./navigationCatalog";

const emptyOverrides: NavigationOverrides = {};

export default function NavigationProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { organizationId, userId } = dataScope();
  const scope = useMemo(
    () => ({ organizationId, userId, projectId: null }),
    [organizationId, userId],
  );
  const query = useNavigationPreferencesQuery(scope);
  const overrides = query.currentData?.items ?? emptyOverrides;
  const [savePreferences] = useSaveNavigationPreferencesMutation();
  const error = query.error
    ? ("message" in query.error && query.error.message) || "Menu preferences could not be loaded."
    : "";
  const refetch = query.refetch;
  const reload = useCallback(async () => {
    await unwrapRequest(refetch(), "Menu preferences could not be loaded.");
  }, [refetch]);

  const save = useCallback(
    async (items: NavigationOverrides) => {
      const saved = await unwrapRequest(savePreferences(items), "Menu changes could not be saved.");
      await dispatch(navigationCache.upsertQueryData("navigationPreferences", scope, saved));
    },
    [dispatch, savePreferences, scope],
  );

  return (
    <NavigationContext.Provider
      value={{ overrides, loading: query.isLoading, error, save, reload }}
    >
      {children}
    </NavigationContext.Provider>
  );
}
