import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./common/common.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import { store } from "./common/store";
import { bindStoreEvents } from "./common/store/sessionEffects";

const stopStoreEvents = bindStoreEvents(store.dispatch);
import.meta.hot?.dispose(stopStoreEvents);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ""}>
        <App />
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>,
);
