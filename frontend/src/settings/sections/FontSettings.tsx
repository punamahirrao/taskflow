import { useState, type FormEvent } from "react";
import { Check, Download, RotateCcw, Type } from "lucide-react";
import { useTypography } from "../../common/features/typography/TypographyContext";
import {
  DEFAULT_FONT_NAME,
  DEFAULT_TYPOGRAPHY,
  detectedLocalFonts,
  fontStack,
  isLocalFontAvailable,
  listInstalledFontFamilies,
  supportsLocalFontList,
} from "../../common/features/typography/localFonts";
import { useOrganization } from "../../organizations/context/OrganizationContext";
import { FontSettingsStyles } from "./FontSettings.styles";

function FontEditor() {
  const { preferences, save } = useTypography();
  const { activeOrganization } = useOrganization();
  const [family, setFamily] = useState(preferences.font_family);
  const [size, setSize] = useState(String(preferences.font_size));
  const [fonts, setFonts] = useState(detectedLocalFonts);
  const [listing, setListing] = useState(false);
  const [listed, setListed] = useState(false);
  const [fontMessage, setFontMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const fontName = family.trim();
  const validFont =
    !fontName ||
    fonts.some((font) => font.toLocaleLowerCase() === fontName.toLocaleLowerCase()) ||
    isLocalFontAvailable(fontName);
  const fontSize = Number(size);
  const validSize =
    size.trim() !== "" && Number.isInteger(fontSize) && fontSize >= 12 && fontSize <= 24;
  const dirty = fontName !== preferences.font_family || fontSize !== preferences.font_size;
  function changed() {
    setMessage("");
    setError("");
  }
  async function loadFonts() {
    setListing(true);
    setFontMessage("");
    try {
      const installed = await listInstalledFontFamilies();
      setFonts(installed);
      setListed(true);
      setFontMessage(
        installed.length
          ? `${installed.length} installed font families loaded.`
          : "The browser did not return any fonts. You can enter an installed font name below.",
      );
    } catch (cause) {
      setFontMessage(
        cause instanceof DOMException && cause.name === "NotAllowedError"
          ? "Font access wasn’t allowed. Choose a detected font or enter an installed font name."
          : cause instanceof Error
            ? cause.message
            : "The font list could not be loaded. You can use a detected font instead.",
      );
    } finally {
      setListing(false);
    }
  }
  async function apply(event: FormEvent) {
    event.preventDefault();
    if (!validFont || !validSize || !dirty || saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await save({ font_family: fontName, font_size: fontSize });
      setFamily(fontName);
      setMessage("Font and size applied. Your preferences are saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Font settings could not be applied.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <form className="settings-panel font-settings" onSubmit={apply} data-testid="font-settings">
      <FontSettingsStyles />
      <div className="font-settings-heading">
        <span>
          <Type size={25} />
        </span>
        <div>
          <h3>Font & Size</h3>
          <p>Choose how Taskflow text looks for your account in {activeOrganization?.name}.</p>
        </div>
      </div>
      <div className="font-defaults">
        <div>
          <small>DEFAULT FONT</small>
          <b>{DEFAULT_FONT_NAME}</b>
        </div>
        <div>
          <small>DEFAULT BASE SIZE</small>
          <b>16 px</b>
        </div>
        <p>Reset to these values at any time.</p>
      </div>
      <div className="font-settings-grid">
        <fieldset disabled={saving} className="font-controls">
          <legend className="sr-only">Font and size preferences</legend>
          <div className="font-field-heading">
            <label htmlFor="taskflow-font-family">Font family</label>
            <span>
              {fonts.length} {listed ? "installed" : "detected"} fonts
            </span>
          </div>
          <input
            id="taskflow-font-family"
            list="taskflow-local-fonts"
            autoComplete="off"
            maxLength={100}
            aria-describedby="local-font-help"
            aria-invalid={!validFont}
            placeholder={`Default (${DEFAULT_FONT_NAME})`}
            value={family}
            onChange={(event) => {
              setFamily(event.target.value);
              changed();
            }}
          />
          <datalist id="taskflow-local-fonts">
            {fonts.map((font) => (
              <option key={font} value={font} />
            ))}
          </datalist>
          <p id="local-font-help" className="font-help">
            Choose a font detected on this device, or type the name of an installed font. Leave
            blank to use the default.
          </p>
          {!validFont && (
            <p role="status" className="font-validation">
              This font wasn’t detected on this device. Choose an installed font.
            </p>
          )}
          <button
            className="font-load"
            type="button"
            disabled={listing || !supportsLocalFontList()}
            onClick={() => {
              void loadFonts();
            }}
          >
            <Download size={15} />
            {listing ? "Loading fonts…" : "Load installed fonts"}
          </button>
          <p className="font-help">
            {supportsLocalFontList()
              ? "Your browser will ask permission to list fonts on this computer. Font files stay on your device."
              : "This browser cannot list all installed fonts. Detected fonts and typed font names still work."}
          </p>
          {fontMessage && (
            <p className="font-list-message" role="status">
              {fontMessage}
            </p>
          )}
          <label className="font-size-label" htmlFor="taskflow-font-size">
            Base font size <span>12–24 px</span>
          </label>
          <div className="font-size-control">
            <input
              id="taskflow-font-size"
              type="number"
              min={12}
              max={24}
              step={1}
              required
              aria-invalid={!validSize}
              value={size}
              onChange={(event) => {
                setSize(event.target.value);
                changed();
              }}
            />
            <span>px</span>
          </div>
          <div className="font-size-presets" aria-label="Font size presets">
            {[12, 14, 16, 18, 20, 24].map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={fontSize === value}
                onClick={() => {
                  setSize(String(value));
                  changed();
                }}
              >
                {value}
                {value === 16 && <small>Default</small>}
              </button>
            ))}
          </div>
          <p className="font-help">
            Headings and smaller labels keep their relative sizes across Taskflow.
          </p>
          {!validSize && (
            <p role="status" className="font-validation">
              Enter a whole number from 12 to 24.
            </p>
          )}
        </fieldset>
        <section className="font-preview-panel" aria-label="Font preview">
          <div className="font-preview-heading">
            <span>LIVE PREVIEW</span>
            <span>
              {fontName || DEFAULT_FONT_NAME} · {validSize ? fontSize : 16} px
            </span>
          </div>
          <div
            className="font-preview"
            data-testid="font-preview"
            style={{
              fontFamily: fontStack(validFont ? fontName : ""),
              fontSize: `${validSize ? fontSize : 16}px`,
            }}
          >
            <p className="font-preview-alphabet">Aa Bb Cc</p>
            <h4>Make work flow.</h4>
            <p>The quick brown fox jumps over the lazy dog.</p>
            <p>Plan your projects, organize tasks and deliver together.</p>
            <p className="font-preview-numbers">0123456789 · @ # &amp; %</p>
            <div className="font-preview-sample">
              <Check size={17} />
              <span>Project planning is ready</span>
            </div>
          </div>
          <p className="font-preview-note">Preview changes here, then apply them to Taskflow.</p>
        </section>
      </div>
      <div className="font-settings-footer">
        <div>
          {error ? (
            <p role="alert" className="font-validation">
              {error}
            </p>
          ) : (
            <p role="status">
              {message ||
                (dirty
                  ? "You have unapplied changes."
                  : `Applied: ${preferences.font_family || DEFAULT_FONT_NAME} · ${preferences.font_size} px`)}
            </p>
          )}
        </div>
        <div>
          <button
            className="font-reset"
            type="button"
            disabled={saving || (!family && fontSize === 16)}
            onClick={() => {
              setFamily(DEFAULT_TYPOGRAPHY.font_family);
              setSize(String(DEFAULT_TYPOGRAPHY.font_size));
              setError("");
              setMessage("Defaults selected. Apply to restore them.");
            }}
          >
            <RotateCcw size={14} />
            Reset to defaults
          </button>
          <button
            className="font-apply"
            type="submit"
            disabled={saving || !dirty || !validFont || !validSize}
          >
            <Check size={15} />
            {saving ? "Applying…" : "Apply font & size"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function FontSettings() {
  const { loading, error, reload } = useTypography();
  const [retryError, setRetryError] = useState("");
  if (loading)
    return (
      <section className="settings-panel" role="status">
        Loading font settings…
      </section>
    );
  if (error)
    return (
      <section className="settings-panel">
        <p role="alert">{retryError || error}</p>
        <button
          type="button"
          onClick={() => {
            void reload().catch((cause: unknown) =>
              setRetryError(
                cause instanceof Error ? cause.message : "Font settings could not be loaded.",
              ),
            );
          }}
        >
          Try again
        </button>
      </section>
    );
  return <FontEditor />;
}
