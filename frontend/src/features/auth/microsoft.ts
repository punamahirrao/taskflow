import { PublicClientApplication } from "@azure/msal-browser";
import { microsoftLogin } from "../../api/auth";

const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;

export const isMicrosoftConfigured = Boolean(clientId);

export async function signInWithMicrosoft(): Promise<void> {
  if (!clientId) throw new Error("Microsoft sign-in is not configured.");

  const application = new PublicClientApplication({
    auth: {
      clientId,
      authority: "https://login.microsoftonline.com/common",
      redirectUri: window.location.origin,
    },
  });
  await application.initialize();

  const result = await application.loginPopup({ scopes: ["openid", "profile", "email"] });
  if (!result.idToken) throw new Error("Microsoft did not return an ID token.");
  await microsoftLogin(result.idToken);
}
