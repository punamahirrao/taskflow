import { PublicClientApplication } from "@azure/msal-browser";
import { microsoftLogin } from "../../api/auth";
import { translate } from "../../../common/shared/i18n/translate";

const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;

export const isMicrosoftConfigured = Boolean(clientId);

export async function signInWithMicrosoft(): Promise<boolean> {
  if (!clientId) throw new Error(translate("login.microsoftNotConfigured"));

  const application = new PublicClientApplication({
    auth: {
      clientId,
      authority: "https://login.microsoftonline.com/common",
      redirectUri: window.location.origin,
    },
  });
  await application.initialize();

  const result = await application.loginPopup({ scopes: ["openid", "profile", "email"] });
  if (!result.idToken) throw new Error(translate("login.microsoftNoIdToken"));
  return microsoftLogin(result.idToken);
}
