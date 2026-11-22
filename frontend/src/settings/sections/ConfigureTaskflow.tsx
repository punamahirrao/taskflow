import { Fragment, useState, type FormEvent } from "react";
import { ChevronDown, LayoutList, RotateCcw, Save, Search } from "lucide-react";
import { useNavigation } from "../../common/features/navigation/NavigationContext";
import {
  NAVIGATION_ICONS,
  NAVIGATION_ITEMS,
  ICON_COLORS,
  defaultIconColor,
  type IconColor,
  type NavigationIconId,
  type NavigationItem,
  type NavigationOverrides,
} from "../../common/features/navigation/navigationCatalog";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import { useOrganization } from "../../organizations/context/OrganizationContext";
import { ConfigureTaskflowStyles } from "./ConfigureTaskflow.styles";

function IconPicker({
  itemId,
  label,
  selected,
  onSelect,
}: {
  itemId: string;
  label: string;
  selected: NavigationIconId;
  onSelect: (icon: NavigationIconId) => void;
}) {
  const [query, setQuery] = useState("");
  const icons = (Object.keys(NAVIGATION_ICONS) as NavigationIconId[]).filter((id) =>
    `${id} ${NAVIGATION_ICONS[id].name}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <div className="configure-icon-picker">
      <div className="configure-picker-heading">
        <h4>Choose an icon</h4>
        <label className="shell-search">
          <Search size={15} />
          <input
            type="search"
            placeholder="Search icons…"
            aria-label={`Search icons for ${label}`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>
      <div role="radiogroup" aria-label={`Icon for ${label}`} className="configure-icon-grid">
        {icons.map((id) => {
          const { Icon, name } = NAVIGATION_ICONS[id];
          return (
            <label
              key={id}
              className={`configure-icon-option ${selected === id ? "selected" : ""}`}
            >
              <input
                type="radio"
                name={`icon-${itemId}`}
                value={id}
                checked={selected === id}
                onChange={() => onSelect(id)}
              />
              <span
                className="configure-icon-swatch"
                style={{
                  color: ICON_COLORS[defaultIconColor(id)].value,
                  background: `color-mix(in srgb, ${ICON_COLORS[defaultIconColor(id)].value} 12%, transparent)`,
                }}
              >
                <Icon size={21} aria-hidden="true" />
              </span>
              <span>{name}</span>
            </label>
          );
        })}
      </div>
      {!icons.length && <p className="configure-empty">No icons match your search.</p>}
    </div>
  );
}

function NavigationEditor() {
  const { overrides, save } = useNavigation();
  const { activeOrganization } = useOrganization();
  const { t } = useTranslation();
  const [draft, setDraft] = useState<NavigationOverrides>(overrides);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  function normalize(items: NavigationOverrides) {
    const result: NavigationOverrides = {};
    for (const item of NAVIGATION_ITEMS) {
      const entry = items[item.id];
      if (!entry) continue;
      const label = entry.label?.trim();
      const value = {
        ...(label !== undefined && label !== t(item.labelKey) ? { label } : {}),
        ...(entry.icon && entry.icon !== item.defaultIcon ? { icon: entry.icon } : {}),
        ...(entry.color && entry.color !== defaultIconColor(entry.icon ?? item.defaultIcon)
          ? { color: entry.color }
          : {}),
      };
      if (Object.keys(value).length) result[item.id] = value;
    }
    return result;
  }
  const normalized = normalize(draft);
  const dirty = JSON.stringify(normalized) !== JSON.stringify(normalize(overrides));
  const invalid = NAVIGATION_ITEMS.some((item) => draft[item.id]?.label?.trim() === "");
  const matches = NAVIGATION_ITEMS.filter((item) =>
    `${t(item.labelKey)} ${draft[item.id]?.label ?? ""} ${item.section === "planning" ? t("app.planning") : ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  function update(item: NavigationItem, value: NavigationOverrides[string]) {
    setDraft((previous) => ({ ...previous, [item.id]: { ...previous[item.id], ...value } }));
    setMessage("");
    setError("");
  }
  function reset(id?: string) {
    setDraft((previous) => {
      if (!id) return {};
      const next = { ...previous };
      delete next[id];
      return next;
    });
    setMessage("");
    setError("");
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (invalid || !dirty || saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await save(normalized);
      setDraft(normalized);
      setMessage("Menu updated. Your changes are saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Menu changes could not be saved.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <form
      className="settings-panel configure-taskflow"
      onSubmit={submit}
      data-testid="configure-taskflow"
    >
      <ConfigureTaskflowStyles />
      <div className="configure-heading">
        <span className="configure-heading-icon">
          <LayoutList size={23} />
        </span>
        <div>
          <h3>Left-hand menu</h3>
          <p>
            Customize names and icons for your account in {activeOrganization?.name}. Expand a row
            to choose an icon.
          </p>
        </div>
        <span className="configure-count">{NAVIGATION_ITEMS.length} menu items</span>
      </div>
      <div className="configure-toolbar">
        <label className="shell-search">
          <Search size={17} />
          <input
            type="search"
            aria-label="Search menu items"
            placeholder="Search menu items…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <span>Original menu items are shown on the left.</span>
      </div>
      <fieldset disabled={saving} className="configure-fields">
        <legend className="sr-only">Menu names and icons</legend>
        <div className="configure-table-scroll">
          <table>
            <caption className="sr-only">Configure left-hand menu names and icons</caption>
            <thead>
              <tr>
                <th scope="col">Original menu item</th>
                <th scope="col">Icon</th>
                <th scope="col">Display name</th>
                <th scope="col">
                  <span className="sr-only">Customize</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {matches.map((item) => {
                const defaultLabel = t(item.labelKey);
                const DefaultIcon = NAVIGATION_ICONS[item.defaultIcon].Icon;
                const icon = draft[item.id]?.icon ?? item.defaultIcon;
                const { Icon, name: iconName } = NAVIGATION_ICONS[icon];
                const colorId = draft[item.id]?.color ?? defaultIconColor(icon);
                const color = ICON_COLORS[colorId].value;
                const label = draft[item.id]?.label ?? defaultLabel;
                const open = expanded === item.id;
                return (
                  <Fragment key={item.id}>
                    <tr
                      className={open ? "is-expanded" : ""}
                      data-testid={`configure-row-${item.id}`}
                    >
                      <th scope="row">
                        <span className="configure-original">
                          <DefaultIcon
                            size={19}
                            aria-hidden="true"
                            style={{ color: ICON_COLORS[defaultIconColor(item.defaultIcon)].value }}
                          />
                          <span>
                            {defaultLabel}
                            {item.section === "planning" && <small>Planning submenu</small>}
                          </span>
                        </span>
                      </th>
                      <td>
                        <button
                          type="button"
                          className="configure-current-icon"
                          aria-label={`Change icon for ${defaultLabel}`}
                          aria-expanded={open}
                          aria-controls={`menu-editor-${item.id}`}
                          onClick={() => setExpanded(open ? null : item.id)}
                        >
                          <Icon size={18} aria-hidden="true" style={{ color }} />
                          <span>{iconName}</span>
                        </button>
                      </td>
                      <td>
                        <input
                          className="configure-name-input"
                          type="text"
                          required
                          maxLength={60}
                          aria-label={`Display name for ${defaultLabel}`}
                          aria-invalid={!label.trim()}
                          value={label}
                          onChange={(event) => update(item, { label: event.target.value })}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="configure-expand"
                          aria-label={`${open ? "Collapse" : "Expand"} ${defaultLabel} customization`}
                          aria-expanded={open}
                          aria-controls={`menu-editor-${item.id}`}
                          onClick={() => setExpanded(open ? null : item.id)}
                        >
                          <ChevronDown size={17} className={open ? "rotate-180" : ""} />
                        </button>
                      </td>
                    </tr>
                    {open && (
                      <tr className="configure-expanded-row">
                        <td colSpan={4}>
                          <div id={`menu-editor-${item.id}`} className="configure-expanded-content">
                            <div className="configure-row-summary">
                              <div>
                                <span>MENU PREVIEW</span>
                                <div className="configure-preview">
                                  <Icon
                                    size={19}
                                    style={{ color: `color-mix(in srgb, ${color} 65%, white)` }}
                                  />
                                  <b>{label || "Menu name"}</b>
                                </div>
                              </div>
                              <button
                                className="configure-text-button"
                                type="button"
                                disabled={!normalized[item.id]}
                                onClick={() => reset(item.id)}
                              >
                                <RotateCcw size={14} />
                                Reset {defaultLabel} to default
                              </button>
                            </div>
                            <fieldset className="configure-colors">
                              <legend>Icon color</legend>
                              <div>
                                {(Object.keys(ICON_COLORS) as IconColor[]).map((id) => (
                                  <label key={id}>
                                    <input
                                      type="radio"
                                      name={`color-${item.id}`}
                                      checked={colorId === id}
                                      onChange={() => update(item, { color: id })}
                                    />
                                    <span style={{ background: ICON_COLORS[id].value }} />
                                    {ICON_COLORS[id].name}
                                  </label>
                                ))}
                              </div>
                            </fieldset>
                            <IconPicker
                              itemId={item.id}
                              label={defaultLabel}
                              selected={icon}
                              onSelect={(selected) => update(item, { icon: selected })}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          {!matches.length && <p className="configure-empty">No menu items match your search.</p>}
        </div>
      </fieldset>
      <div className="configure-footer">
        <div>
          {error ? (
            <p className="configure-error" role="alert">
              {error}
            </p>
          ) : (
            <p role="status">
              {message ||
                (invalid
                  ? "Enter a name for every menu item."
                  : dirty
                    ? "You have unsaved changes."
                    : "Using your saved menu preferences.")}
            </p>
          )}
          <small>
            Names, icons and colors change your personal menu appearance. Links keep their
            destinations.
          </small>
        </div>
        <div className="configure-actions">
          <button
            type="button"
            className="configure-reset"
            disabled={saving || !Object.keys(draft).length}
            onClick={() => reset()}
          >
            <RotateCcw size={14} />
            Reset all
          </button>
          <button type="submit" className="configure-save" disabled={saving || !dirty || invalid}>
            <Save size={15} />
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function ConfigureTaskflow() {
  const { loading, error, reload } = useNavigation();
  const [retryError, setRetryError] = useState("");
  if (loading)
    return (
      <section className="settings-panel" role="status">
        Loading menu configuration…
      </section>
    );
  if (error)
    return (
      <section className="settings-panel">
        <ConfigureTaskflowStyles />
        <p role="alert">{retryError || error}</p>
        <button
          type="button"
          className="configure-reset"
          onClick={() => {
            void reload().catch((cause: unknown) =>
              setRetryError(
                cause instanceof Error ? cause.message : "Could not load menu configuration.",
              ),
            );
          }}
        >
          Try again
        </button>
      </section>
    );
  return <NavigationEditor />;
}
