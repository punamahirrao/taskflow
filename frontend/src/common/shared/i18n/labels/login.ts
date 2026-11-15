import { defineLabels } from "./defineLabels";

export const loginLabels = defineLabels({
  "login.googleNoCredential": "Google did not return a sign-in credential.", "login.googleFailed": "Google sign-in failed. Please try again.",
  "login.microsoftFailed": "Microsoft sign-in failed. Please try again.",
  "login.orgSsoNotConfigured": "Organization SSO is not configured yet. Contact your administrator to connect your identity provider.",
  "login.googleCancelled": "Google sign-in was cancelled or could not start. Check the Google client ID and authorized JavaScript origins.",
  "login.chooseAccountType": "Choose account type", "login.privateUser": "Private user", "login.organizationUser": "Organization user",
  "login.microsoftNotConfigured": "Microsoft sign-in is not configured.", "login.microsoftNoIdToken": "Microsoft did not return an ID token.",
  "login.organizationTitle": "Organization sign in", "login.welcomeTitle": "Welcome Back to TaskFlow",
  "login.organizationSubtitle": "Sign in with your organization account or use your organization's single sign-on.",
  "login.welcomeSubtitle": "Access your collaborative planning workspace for all your projects.",
  "login.emailAddress": "Email Address", "login.password": "Password", "login.comingSoon": "Coming soon", "login.forgotPassword": "Forgot Password?",
  "login.signingIn": "Signing in...", "login.signIn": "Sign In", "login.continueOrgSso": "Continue with organization SSO",
  "login.orContinueWith": "OR CONTINUE WITH", "login.microsoftEnableHint": "Set VITE_MICROSOFT_CLIENT_ID to enable Microsoft sign-in",
  "login.continueMicrosoft": "Continue with Microsoft", "login.microsoftNeedsClientId": "Microsoft sign-in needs an app client ID.",
  "login.termsNotice": "Terms of Service · Privacy Policy · Need an account? ", "login.register": "Register",
  "login.errorEnterBoth": "Please enter both email and password.", "login.errorFailed": "Login failed.", "login.signedInToast": "Signed in successfully.",
});
