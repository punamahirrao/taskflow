import { createGlobalStyle } from "styled-components";

export const AppStyles = createGlobalStyle`
.theme-swatch {
  background-color: var(--swatch);
}

:root,
html[data-theme="original"] {
  --theme-canvas: #f7f7fb;
  --theme-surface: #ffffff;
  --theme-subtle: #f1f2f6;
  --theme-border: #e5e7eb;
  --theme-text: #1f2937;
  --theme-muted: #6b7280;
  --theme-accent: #7c3aed;
  --theme-accent-hover: #6d28d9;
  --theme-focus: #8b5cf6;
  --theme-danger: #be123c;
  --theme-danger-soft: #fff1f2;
  --theme-positive: #047857;
  --theme-positive-soft: #ecfdf5;
  --theme-warning: #b45309;
  --theme-warning-soft: #fffbeb;
  --theme-info: #0369a1;
  --theme-info-soft: #f0f9ff;
  --project-card-border: #e5e7eb;
  --project-card-surface: #ffffff;
  --project-card-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
  --project-card-shadow-hover: 0 4px 8px rgb(0 0 0 / 0.1);
  --project-card-focus: #22d3ee;
  --project-card-avatar-background: #ecfeff;
  --project-card-avatar-text: #0891b2;
  --project-card-muted-text: #4b5563;
  --project-card-progress-track: #f3f4f6;
  --project-card-progress-fill: #22d3ee;
  --project-card-default-background: #f3e8ff;
  --project-card-default-text: #7e22ce;
  --project-card-archived-background: #f3f4f6;
  --project-card-archived-text: #4b5563;
  --project-card-upcoming-background: #eff6ff;
  --project-card-upcoming-text: #1d4ed8;
  --project-card-active-background: #ecfdf5;
  --project-card-active-text: #047857;
  --project-card-urgent-background: #fff7ed;
  --project-card-urgent-text: #ea580c;
  --project-card-calm-background: #f9fafb;
  --project-dialog-overlay: rgb(0 0 0 / 0.5);
  --project-dialog-border: #e5e7eb;
  --project-dialog-title: #111827;
  --project-dialog-label: #374151;
  --project-dialog-input-border: #d1d5db;
  --project-dialog-input-background: #ffffff;
  --project-dialog-panel-shadow:
    0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --project-dialog-close-text: #6b7280;
  --project-dialog-close-hover-background: #f3f4f6;
  --project-dialog-close-hover-text: #374151;
  --project-dialog-error: #ef4444;
  --project-dialog-cancel-background: #e5e7eb;
  --project-dialog-cancel-hover-background: #d1d5db;
  --project-dialog-cancel-text: #374151;
  --project-dialog-submit-background: #06b6d4;
  --project-dialog-submit-hover-background: #0891b2;
  --project-dialog-submit-text: #ffffff;
  --auth-field-background: #f3f4f6;
  --auth-field-border: #d1d5db;
  --auth-field-text: #111827;
  --auth-label-text: #111827;
  --auth-muted-text: #6b7280;
  --auth-accent: #312e81;
  --auth-accent-hover: #3730a3;
  --auth-accent-border: #c7d2fe;
  --auth-focus: #fbbf24;
  --auth-danger: #dc2626;
  --auth-success: #16a34a;
  --auth-white: #ffffff;
  --auth-accent-soft: #eef2ff;
  --auth-social-background: #0284c7;
  --profile-field-background: #f9fafb;
  --profile-field-border: #e5e7eb;
  --profile-field-text: #111827;
  --profile-field-muted: #6b7280;
  --profile-field-label: #374151;
  --profile-focus: #c084fc;
  --profile-focus-ring: #e9d5ff;
  --profile-accent: #9333ea;
  --profile-danger: #dc2626;
  --profile-success: #16a34a;
  --profile-divider: #e5e7eb;
  --profile-panel-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
  --profile-button-text: #ffffff;
  color-scheme: light;
}

/* Professional: quiet neutral interface with a focused business blue accent. */
html[data-theme="professional"] {
  --theme-canvas: #f6f8fc;
  --theme-surface: #ffffff;
  --theme-subtle: #f0f4f9;
  --theme-border: #e2e8f0;
  --theme-text: #202939;
  --theme-muted: #667085;
  --theme-accent: #2563eb;
  --theme-accent-hover: #1d4ed8;
  --theme-focus: #2563eb;
  color-scheme: light;
}

html[data-theme="professional"] {
  --theme-focus: #2563eb;
}
html[data-theme="professional"] {
  --theme-danger: #be123c;
  --theme-danger-soft: #fff1f2;
  --theme-positive: #047857;
  --theme-positive-soft: #ecfdf5;
  --theme-warning: #b45309;
  --theme-warning-soft: #fffbeb;
  --theme-info: #0369a1;
  --theme-info-soft: #f0f9ff;
}

html[data-theme="professional"] body,
html[data-theme="professional"] .min-h-screen,
html[data-theme="professional"] main {
  background: var(--theme-canvas) !important;
  color: var(--theme-text);
}

html[data-theme="professional"] aside {
  background: #ffffff !important;
  border-color: #e2e8f0 !important;
  color: var(--theme-text);
}

html[data-theme="professional"] aside h2 {
  color: #1d4ed8 !important;
}
html[data-theme="professional"] aside [class*="text-gray-600"],
html[data-theme="professional"] aside [class*="text-gray-700"] {
  color: #475467 !important;
}
html[data-theme="professional"] aside [class*="hover:bg-gray-200"]:hover {
  background: #f2f5fa !important;
}
html[data-theme="professional"] aside a[aria-current="page"] {
  background: #eff6ff !important;
  color: #1d4ed8 !important;
  box-shadow: inset 3px 0 #3b82f6;
}

html[data-theme="professional"] header.sticky {
  background: #ffffff !important;
  border-color: var(--theme-border) !important;
}

html[data-theme="professional"] [class*="bg-white"],
html[data-theme="professional"] [class*="bg-gray-50"],
html[data-theme="professional"] [class*="bg-slate-50"] {
  background-color: var(--theme-surface) !important;
}
html[data-theme="professional"] [class*="bg-gray-100"],
html[data-theme="professional"] [class*="bg-slate-100"] {
  background-color: var(--theme-subtle) !important;
}
html[data-theme="professional"] [class*="bg-purple-50"],
html[data-theme="professional"] [class*="bg-purple-100"],
html[data-theme="professional"] [class*="bg-violet-50"],
html[data-theme="professional"] [class*="bg-violet-100"],
html[data-theme="professional"] [class*="bg-indigo-50"],
html[data-theme="professional"] [class*="bg-indigo-100"],
html[data-theme="professional"] [class*="bg-blue-50"],
html[data-theme="professional"] [class*="bg-blue-100"],
html[data-theme="professional"] [class*="bg-[#f7f7fb]"] {
  background-color: #eff6ff !important;
}
html[data-theme="professional"] [class*="text-gray-900"],
html[data-theme="professional"] [class*="text-gray-800"],
html[data-theme="professional"] [class*="text-slate-900"],
html[data-theme="professional"] [class*="text-slate-800"] {
  color: var(--theme-text) !important;
}
html[data-theme="professional"] [class*="text-gray-600"],
html[data-theme="professional"] [class*="text-gray-500"],
html[data-theme="professional"] [class*="text-slate-600"],
html[data-theme="professional"] [class*="text-slate-500"] {
  color: var(--theme-muted) !important;
}
html[data-theme="professional"] [class*="text-slate-950"],
html[data-theme="professional"] [class*="text-gray-950"] {
  color: #172033 !important;
}
html[data-theme="professional"] [class*="border-gray-200"],
html[data-theme="professional"] [class*="border-slate-200"] {
  border-color: var(--theme-border) !important;
}
html[data-theme="professional"] [class*="bg-purple-600"],
html[data-theme="professional"] [class*="bg-violet-600"],
html[data-theme="professional"] [class*="bg-indigo-600"],
html[data-theme="professional"] [class*="bg-blue-600"],
html[data-theme="professional"] [class*="bg-indigo-700"] {
  background-color: var(--theme-accent) !important;
}
html[data-theme="professional"] [class*="hover:bg-purple-700"]:hover,
html[data-theme="professional"] [class*="hover:bg-violet-700"]:hover,
html[data-theme="professional"] [class*="hover:bg-indigo-700"]:hover,
html[data-theme="professional"] [class*="hover:bg-blue-700"]:hover {
  background-color: var(--theme-accent-hover) !important;
}
html[data-theme="professional"] [class*="text-purple-700"],
html[data-theme="professional"] [class*="text-violet-700"],
html[data-theme="professional"] [class*="text-indigo-700"],
html[data-theme="professional"] [class*="text-blue-700"],
html[data-theme="professional"] [class*="text-purple-600"],
html[data-theme="professional"] [class*="text-violet-600"],
html[data-theme="professional"] [class*="text-indigo-600"],
html[data-theme="professional"] [class*="text-blue-600"] {
  color: var(--theme-accent) !important;
}
html[data-theme="professional"] button:focus-visible,
html[data-theme="professional"] a:focus-visible {
  --tw-ring-color: var(--theme-focus);
}
html[data-theme="professional"] input[type="checkbox"],
html[data-theme="professional"] input[type="radio"] {
  accent-color: var(--theme-accent);
}
html[data-theme="professional"] input:focus,
html[data-theme="professional"] select:focus,
html[data-theme="professional"] textarea:focus,
html[data-theme="professional"] button:focus-visible,
html[data-theme="professional"] a:focus-visible {
  outline-color: var(--theme-focus);
}
html[data-theme="professional"] ::selection {
  background: #bfdbfe;
  color: #172554;
}

/* Night: deep navy canvas, slate surfaces, and indigo, mint, and amber accents. */
html[data-theme="night"] {
  --theme-canvas: #090d16;
  --theme-surface: #121829;
  --theme-subtle: #182238;
  --theme-border: #1e293b;
  --theme-text: #f8fafc;
  --theme-muted: #94a3b8;
  --theme-tertiary: #94a3b8;
  --theme-accent: #4f46e5;
  --theme-accent-hover: #595ce5;
  --theme-selection: #38bdf8;
  --theme-secondary: #312e81;
  --theme-success: #10b981;
  --theme-warning: #f59e0b;
  --theme-points-background: #78350f;
  --theme-points-text: #fde047;
  --theme-danger: #ef4444;
  --theme-danger-soft: #3a202c;
  --theme-positive: #34d399;
  --theme-positive-soft: #12352f;
  --theme-warning: #fbbf24;
  --theme-warning-soft: #392d16;
  --theme-info: #7dd3fc;
  --theme-info-soft: #142f45;
  color-scheme: dark;
  background: var(--theme-canvas);
}

html[data-theme="night"] body,
html[data-theme="night"] .min-h-screen,
html[data-theme="night"] main {
  background: var(--theme-canvas) !important;
  color: var(--theme-text);
}

html[data-theme="night"] header.sticky {
  background: var(--theme-surface) !important;
  border-color: var(--theme-border) !important;
}
html[data-theme="night"] [class*="bg-white"],
html[data-theme="night"] [class*="bg-gray-50"],
html[data-theme="night"] [class*="bg-slate-50"] {
  background-color: var(--theme-surface) !important;
}
html[data-theme="night"] [class*="bg-gray-100"],
html[data-theme="night"] [class*="bg-slate-100"] {
  background-color: #1a2437 !important;
}
html[data-theme="night"] [class*="bg-[#f7f7fb]"] {
  background-color: var(--theme-canvas) !important;
}
html[data-theme="night"] [class*="bg-indigo-50"],
html[data-theme="night"] [class*="bg-indigo-100"],
html[data-theme="night"] [class*="bg-violet-50"],
html[data-theme="night"] [class*="bg-violet-100"],
html[data-theme="night"] [class*="bg-purple-50"],
html[data-theme="night"] [class*="bg-purple-100"],
html[data-theme="night"] [class*="bg-blue-50"],
html[data-theme="night"] [class*="bg-blue-100"] {
  background-color: var(--theme-secondary) !important;
}
html[data-theme="night"] [class*="bg-emerald-50"],
html[data-theme="night"] [class*="bg-emerald-100"],
html[data-theme="night"] [class*="bg-green-50"] {
  background-color: #12352f !important;
}
html[data-theme="night"] [class*="bg-amber-50"],
html[data-theme="night"] [class*="bg-amber-100"],
html[data-theme="night"] [class*="bg-yellow-50"] {
  background-color: #392d16 !important;
}
html[data-theme="night"] [class*="bg-rose-50"],
html[data-theme="night"] [class*="bg-rose-100"],
html[data-theme="night"] [class*="bg-red-50"] {
  background-color: #3a202c !important;
}
html[data-theme="night"] [class*="bg-sky-50"] {
  background-color: #142f45 !important;
}

html[data-theme="night"] [class*="text-slate-950"],
html[data-theme="night"] [class*="text-slate-900"],
html[data-theme="night"] [class*="text-slate-800"],
html[data-theme="night"] [class*="text-slate-700"],
html[data-theme="night"] [class*="text-gray-950"],
html[data-theme="night"] [class*="text-gray-900"],
html[data-theme="night"] [class*="text-gray-800"],
html[data-theme="night"] [class*="text-gray-700"] {
  color: var(--theme-text) !important;
}
html[data-theme="night"] [class*="text-slate-600"],
html[data-theme="night"] [class*="text-slate-500"],
html[data-theme="night"] [class*="text-slate-400"],
html[data-theme="night"] [class*="text-gray-600"],
html[data-theme="night"] [class*="text-gray-500"],
html[data-theme="night"] [class*="text-gray-400"] {
  color: var(--theme-muted) !important;
}
html[data-theme="night"] [class*="text-slate-500"],
html[data-theme="night"] [class*="text-gray-500"],
html[data-theme="night"] [class*="text-gray-400"] {
  color: var(--theme-tertiary) !important;
}
html[data-theme="night"] [class*="text-indigo-"],
html[data-theme="night"] [class*="text-violet-"],
html[data-theme="night"] [class*="text-purple-"],
html[data-theme="night"] [class*="text-blue-"] {
  color: #c7d2fe !important;
}
html[data-theme="night"] [class*="text-emerald-"],
html[data-theme="night"] [class*="text-green-"] {
  color: var(--theme-success) !important;
}
html[data-theme="night"] [class*="text-amber-"],
html[data-theme="night"] [class*="text-yellow-"] {
  color: var(--theme-warning) !important;
}
html[data-theme="night"] [class*="text-rose-"],
html[data-theme="night"] [class*="text-red-"] {
  color: var(--theme-danger) !important;
}
html[data-theme="night"] [class*="text-sky-"] {
  color: #7dd3fc !important;
}

html[data-theme="night"] [class*="border-slate-"],
html[data-theme="night"] [class*="border-gray-"],
html[data-theme="night"] [class*="border-indigo-"],
html[data-theme="night"] [class*="border-emerald-"],
html[data-theme="night"] [class*="border-amber-"],
html[data-theme="night"] [class*="border-rose-"] {
  border-color: var(--theme-border) !important;
}
html[data-theme="night"] [class*="bg-indigo-600"] {
  background-color: var(--theme-accent) !important;
  color: #ffffff !important;
}
html[data-theme="night"] [class*="bg-indigo-500"],
html[data-theme="night"] [class*="bg-indigo-700"],
html[data-theme="night"] [class*="bg-purple-600"],
html[data-theme="night"] [class*="bg-violet-600"],
html[data-theme="night"] [class*="bg-blue-600"] {
  background-color: var(--theme-accent-hover) !important;
  color: #ffffff !important;
}
html[data-theme="night"] [class*="bg-amber-500/20"] {
  background-color: var(--theme-points-background) !important;
  color: var(--theme-points-text) !important;
}
html[data-theme="night"] [class*="bg-amber-500/10"] {
  background-color: rgb(245 158 11 / 0.12) !important;
  color: var(--theme-warning) !important;
}
html[data-theme="night"] [class*="ring-indigo-"] {
  --tw-ring-color: var(--theme-selection) !important;
}
html[data-theme="night"] input,
html[data-theme="night"] select,
html[data-theme="night"] textarea {
  background-color: var(--theme-surface);
  border-color: var(--theme-border);
  color: var(--theme-text);
}
html[data-theme="night"] input::placeholder,
html[data-theme="night"] textarea::placeholder {
  color: #7e8ba2;
}
html[data-theme="night"] button:focus-visible,
html[data-theme="night"] a:focus-visible {
  --tw-ring-color: var(--theme-accent);
  outline-color: var(--theme-accent);
}
html[data-theme="night"] [class*="shadow"] {
  --tw-shadow-color: rgb(0 0 0 / 0.32);
}

/* The selected local family inherits into controls, dialogs and page text. */
body {
  font-family: var(
    --taskflow-font-family,
    var(--default-font-family, ui-sans-serif, system-ui, sans-serif)
  );
}
`;
