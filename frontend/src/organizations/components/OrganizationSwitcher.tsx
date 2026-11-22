import { useEffect, useRef, useState } from "react";
import { Building2, Check, ChevronDown, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useOrganization } from "../context/OrganizationContext";
import adviridLogoUrl from "../../assets/advirid-logo.png";

export default function OrganizationSwitcher({ collapsed }: { collapsed: boolean }) {
  const { organizations, activeOrganization, switching, switchOrganization } = useOrganization();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        root.current?.querySelector("button")?.focus();
      }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return (
    <div className="organization-switcher" ref={root}>
      <button
        type="button"
        data-testid="organization-switcher"
        title={activeOrganization?.name}
        aria-label={`Organization: ${activeOrganization?.name}`}
        aria-expanded={open}
        aria-controls="organization-menu"
        onClick={() => setOpen(!open)}
      >
        <span className="organization-mark">
          <img src={adviridLogoUrl} alt="ADVIRID Technologies" />
        </span>
        {!collapsed && (
          <>
            <span className="organization-label">
              <span className="organization-company">{activeOrganization?.name}</span>
              <small>Organization</small>
            </span>
            <ChevronDown size={14} />
          </>
        )}
      </button>
      {open && (
        <div id="organization-menu" className="organization-popover">
          <p className="organization-menu-heading">Switch organization</p>
          <div className="organization-options">
            {organizations.map((organization) => (
              <button
                key={organization.id}
                type="button"
                disabled={switching}
                aria-current={organization.id === activeOrganization?.id ? "true" : undefined}
                onClick={() => {
                  setError("");
                  if (organization.id === activeOrganization?.id) setOpen(false);
                  else
                    void switchOrganization(organization.id).catch((cause: unknown) =>
                      setError(
                        cause instanceof Error ? cause.message : "Could not switch organization.",
                      ),
                    );
                }}
              >
                <Building2 size={17} />
                <span>{organization.name}</span>
                {organization.id === activeOrganization?.id && <Check size={16} />}
              </button>
            ))}
          </div>
          {error && <p role="alert">{error}</p>}
          <Link
            to="/settings/organizations"
            className="organization-settings-link"
            onClick={() => setOpen(false)}
          >
            <Settings size={16} />
            Organization settings
          </Link>
        </div>
      )}
    </div>
  );
}
