import { unwrapRequest } from "../../common/api/queryApi";
import { useCallback, useState, type ReactNode } from "react";
import { Building2 } from "lucide-react";
import { useOrganizationsQuery, useSwitchOrganizationMutation } from "../api/organizationQuery";
import { useAppSelector } from "../../common/store";
import { OrganizationContext } from "./OrganizationContext";
import OrganizationForm from "../components/OrganizationForm";
import { OrganizationStyles } from "../Organization.styles";

function OrganizationGate({ children }: { children: ReactNode }) {
  const userId = useAppSelector((state) => state.session.user?.id ?? null);
  const { currentData: directory, error: directoryError, refetch } = useOrganizationsQuery(userId);
  const [setActiveOrganization, { isLoading: switching }] = useSwitchOrganizationMutation();
  const [retryError, setRetryError] = useState("");
  const activeId = directory?.active_organization_id ?? directory?.organizations[0]?.id ?? null;
  const error = directoryError
    ? retryError ||
      ("message" in directoryError && directoryError.message) ||
      "Organizations could not be loaded."
    : "";
  const reload = useCallback(async () => {
    await unwrapRequest(refetch(), "Organizations could not be loaded.");
  }, [refetch]);

  async function switchOrganization(id: number) {
    if (switching || id === activeId) return;
    await unwrapRequest(setActiveOrganization(id), "Could not switch organization.");
    sessionStorage.setItem("active_organization_id", String(id));
    sessionStorage.removeItem("selected_project");
    // Recreate all stores and page state before loading the other company's data.
    window.location.replace("/dashboard");
  }

  if (!directory)
    return (
      <main className="organization-onboarding" aria-live="polite">
        {error ? (
          <>
            <p role="alert">{error}</p>
            <button
              type="button"
              onClick={() => {
                void reload().catch((cause: unknown) =>
                  setRetryError(
                    cause instanceof Error ? cause.message : "Organizations could not be loaded.",
                  ),
                );
              }}
            >
              Try again
            </button>
          </>
        ) : (
          <p>Loading organizations…</p>
        )}
      </main>
    );
  const activeOrganization = directory.organizations.find((item) => item.id === activeId) ?? null;
  if (!activeOrganization)
    return (
      <main className="organization-onboarding">
        <section className="organization-onboarding-card">
          <Building2 size={32} />
          <h1>Create your organization</h1>
          <p>An organization name is required to get started.</p>
          <OrganizationForm onCreated={reload} />
        </section>
      </main>
    );
  return (
    <OrganizationContext.Provider
      value={{
        environment: directory.data_environment,
        organizations: directory.organizations,
        activeOrganization,
        limit: directory.limit,
        switching,
        reload,
        switchOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export default function OrganizationProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <OrganizationStyles />
      <OrganizationGate>{children}</OrganizationGate>
    </>
  );
}
