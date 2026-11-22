import { AuthCredit } from "./Auth.styles";
import { useTranslation } from "../../shared/i18n/hooks/useTranslation";

export function AuthFooter() {
  const { t } = useTranslation();
  return (
    <AuthCredit data-testid="auth-company-footer">
      {t("auth.companyFooter", { year: new Date().getFullYear() })}
    </AuthCredit>
  );
}
