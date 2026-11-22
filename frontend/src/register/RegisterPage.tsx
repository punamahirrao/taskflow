import { useNavigate } from "react-router-dom";
import { useRegister } from "./features/auth/hooks/useRegister";
import {
  AuthPromoSection,
  AuthFooter,
  AuthPage,
  AuthContent,
  AuthBrand,
  AuthPanel,
  AuthHeading,
  AuthSubtitle,
} from "../common/sections/auth";
import TaskflowLogo from "../common/components/TaskflowLogo";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";
import RegisterForm from "./components/RegisterForm";
import type { RegisterValues } from "./entities/register";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { error, loading, submit } = useRegister();

  async function handleSubmit(values: RegisterValues) {
    if (await submit(values)) navigate("/login");
  }

  return (
    <AuthPage>
      <AuthPromoSection />
      <AuthContent $compact>
        <AuthBrand $compact>
          <TaskflowLogo />
        </AuthBrand>
        <AuthPanel data-testid="register-panel">
          <AuthHeading>{t("register.title")}</AuthHeading>
          <AuthSubtitle>{t("register.subtitle")}</AuthSubtitle>
          <RegisterForm error={error} loading={loading} onSubmit={handleSubmit} />
        </AuthPanel>
        <AuthFooter />
      </AuthContent>
    </AuthPage>
  );
}
