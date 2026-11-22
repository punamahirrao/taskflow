import { createContext, useContext } from "react";
import { useTranslation } from "../../shared/i18n/hooks/useTranslation";
import {
  NAVIGATION_ICONS,
  ICON_COLORS,
  defaultIconColor,
  type NavigationItem,
  type NavigationOverrides,
} from "./navigationCatalog";

interface NavigationState {
  overrides: NavigationOverrides;
  loading: boolean;
  error: string;
  save: (items: NavigationOverrides) => Promise<void>;
  reload: () => Promise<void>;
}
export const NavigationContext = createContext<NavigationState | null>(null);
export function useNavigation() {
  const context = useContext(NavigationContext);
  const { t } = useTranslation();
  if (!context) throw new Error("NavigationProvider is required.");
  const { overrides } = context;
  function resolve(item: NavigationItem) {
    const override = overrides[item.id];
    const icon =
      override?.icon && override.icon in NAVIGATION_ICONS ? override.icon : item.defaultIcon;
    const color =
      override?.color && override.color in ICON_COLORS ? override.color : defaultIconColor(icon);
    return {
      label: override?.label ?? t(item.labelKey),
      icon,
      color: ICON_COLORS[color].value,
      Icon: NAVIGATION_ICONS[icon].Icon,
    };
  }
  return { ...context, resolve };
}
