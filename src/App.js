import { useCallback, useEffect, useState } from "react";
import "./App.css";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import TextInput from "./components/Input/TextInput";
import { useSubscribe } from "./useSubscribe";

// in PROD use from .env
export const PUBLIC_KEY =
  "BDZJSiMXSJUhryPkjFh_H84ZeEjVNfq5STCXVDEW4bpXye1mybGCjufRFIVmMxJN1wHOGUunGyBra0qvSa0fGJ8";

export const BACKEND_URL = "https://api.dev.e-fact.app/api/v1";

export const accessToken =
  "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJfWDlqTkF2bU5WVUNUWVVaNlBTQWZfX21UdDdQcEJHWk85Z1pCT1ZDc1pNIn0.eyJleHAiOjE3MDg2OTI0OTcsImlhdCI6MTcwODY5MjE5NywianRpIjoiMmY5NDM1OWUtNjNhZS00NWUxLWE3ZmYtNTk3ZTFiNGJjNjlmIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50LmRldi5lLWZhY3QuYXBwL3JlYWxtcy9waWNhcmQiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiMGNjODg3YWEtNWY4Ny00MjdkLWEwMWMtYzAyNDQ0MTA4ZjA2IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoid2ViLWFwcCIsInNlc3Npb25fc3RhdGUiOiJlOGMwNWNlMC0wYmFkLTRmY2YtOGU3ZC1iYjE1NmQ5ZTI2NTEiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vYXBwc3J2LXdldS1mbnQtZGV2LWZlLmF6dXJld2Vic2l0ZXMubmV0IiwiKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1waWNhcmQiLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsInNpZCI6ImU4YzA1Y2UwLTBiYWQtNGZjZi04ZTdkLWJiMTU2ZDllMjY1MSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhc3NldHM5QGFidi5iZyIsImVtYWlsIjoiYXNzZXRzOUBhYnYuYmcifQ.WADRFKIf4idNbm4FussA-3R3Kx7cXjrF_btGybhT6C7B3QtISmjJYxaBUKCjRJQWmCoHGqvPWfQxbbqjyDQBVd8AvGNy2efrgkcIL7PE_JU-qHng-nEXFhRHyYIBFS15wCVkYOnEWCmYDG1CP7mmhsdoC4Ooypi8zNl16h7qW1F_DQaV6ErKNcjlMNA0jiTI5U3LE7M3X42yKlfBy89trU9S1AiQDXW2Emia4NAoMg-pXXbJh6pPrfwapZq0lBLiCxUZoRfE_cIfkqBg3IqulPAcJvZYOjrIypqgN-erXP7HJkr2QHPVIKKbvXQr1YcLgBfGxay_5cBTI8tOctqNkA";

export const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

export const saveSubscription = async (subscription) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  const payload = {
    endpoint: subscription.endpoint,
    p256dh: subscription.toJSON().keys.p256dh,
    auth: subscription.toJSON().keys.auth,
  };

  const body = JSON.stringify(payload);

  await fetch(BACKEND_URL + "/users/notifications/subscribe", {
    method: "POST",
    headers,
    body,
  });
};

function App() {
  const [loadingSubscribe, setLoadingSubscribe] = useState(false);
  const [loadingPush, setLoadingPush] = useState(false);
  const [pushId, setPushId] = useState("push id");
  const [message, setMessage] = useState("World");
  const [title, setTitle] = useState("Hello");
  const [showSubscribe, setShowSubscribe] = useState(true);
  const [showAskUserButton, setShowAskUserButton] = useState(false);
  const { getSubscription } = useSubscribe({ publicKey: PUBLIC_KEY });

  const onShowSubscribe = () => setShowSubscribe(true);

  const onShowPush = () => {
    setShowSubscribe(false);
  };

  const onSubscribe = useCallback(async () => {
    try {
      toast.success("Subscribe in progress...");

      await window?.Notification.requestPermission();
      toast.success("Notification permission granted...");

      const subscription = await getSubscription();
      toast.success("Subscription acquired...");

      await saveSubscription(subscription);

      toast.success("Subscribed successfully...");
      console.log("Subscribed successfully");
    } catch (e) {
      if (e.errorCode === "ExistingSubscription") {
        toast.success("Existing subscription block...");
        const registration = await navigator.serviceWorker.ready;

        const existingSubscription =
          await registration.pushManager.getSubscription();

        console.log(
          "Existing subscription",
          e,
          existingSubscription.toJSON(),
          existingSubscription.subscriptionId
        );

        await saveSubscription(existingSubscription);

        toast.success("Subscribed successfully...");
        console.log("Subscribed successfully");
      } else {
        toast.error("Subscribe to push failed: " + JSON.stringify(e));
        console.error("Subscribe to push failed", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmitPush = async (e) => {
    e.preventDefault();
    setLoadingPush(true);

    try {
      const sendPayload = {
        message: JSON.stringify({
          title: "Miroslab",
          message: "Miroslabbbbbb",
        }),
      };

      await axios.post(BACKEND_URL + "/users/notifications/send", sendPayload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      toast.success("Push success");
    } catch (e) {
      toast.error("Details console");
    } finally {
      setLoadingPush(false);
    }
  };

  const onAskUserPermissions = async () => {
    const result = await Notification.requestPermission();
    toast.success("Ask user for permissions: " + result);

    if (result === "granted") {
      toast.success("Access granted");

      const registration = await navigator.serviceWorker.ready;

      if (registration) {
        const convertedVapidKey = urlBase64ToUint8Array(PUBLIC_KEY);

        const subscription = await registration.pushManager.subscribe({
          applicationServerKey: convertedVapidKey,
          userVisibleOnly: true,
        });

        toast.success("Subscribed to service worker");

        await saveSubscription(subscription);
        setShowAskUserButton(false);

        toast.success("Successful subscription");
      } else {
        toast.error("Service worker registration not found");
      }
    } else {
      toast.error("Access not granted");
    }
  };

  const checkForUserPermissions = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Service worker and push manager not supported");
      return;
    }

    toast.success("Service worker supported");

    const registration = await navigator.serviceWorker.ready;

    if (!registration) {
      toast.error("Service worker registration failed");
      return;
    }

    if (!registration.pushManager) {
      toast.error("Push manager unavailable");
      return;
    }

    toast.success("Push manager found");

    const existingSubscription =
      await registration.pushManager.getSubscription();

    if (!existingSubscription) {
      setShowAskUserButton(true);
    } else {
      await saveSubscription(existingSubscription);
      toast.success("Successful subscription");
    }
  }, []);

  const onChange = useCallback(
    (setState) => (e) => {
      setState(e.target.value);
    },
    []
  );

  useEffect(() => {
    checkForUserPermissions();
  }, [checkForUserPermissions]);

  return (
    <div className="App">
      <main>
        <div>
          <div className="message">
            <div className="title">Use as PWA</div>
            <div>
              You need to install the site on your home screen. Subscribe to
              push notifications. Then you can test sending notifications.
            </div>
          </div>
        </div>
        <div className="tabs">
          <div className={`tab-item`}>
            <button
              className={`tab ${showSubscribe ? "active" : ""}`}
              onClick={onShowSubscribe}
            >
              Subscribe
            </button>
            {showAskUserButton && (
              <button
                id="ask-user-permissions"
                className={`tab`}
                onClick={onAskUserPermissions}
              >
                Ask user permissions
              </button>
            )}
          </div>
          <div className={`tab-item`}>
            <button
              className={`tab ${!showSubscribe ? "active" : ""}`}
              onClick={onShowPush}
            >
              Push
            </button>
          </div>
        </div>
        {!showSubscribe && (
          <div className="send">
            <form onSubmit={onSubmitPush}>
              <div className="title">Notification</div>
              <TextInput
                id="idSubscribe"
                placeholder="id"
                value={pushId}
                onChange={onChange(setPushId)}
              />
              <TextInput
                id="title"
                placeholder="title"
                value={title}
                onChange={onChange(setTitle)}
              />
              <TextInput
                id="message"
                placeholder="message"
                value={message}
                onChange={onChange(setMessage)}
              />
              <button className={loadingPush ? "loading" : ""} type="submit">
                Send
              </button>
            </form>
          </div>
        )}
        {showSubscribe && (
          <div className="send">
            <form onSubmit={onSubscribe}>
              <button
                className={loadingSubscribe ? "loading" : ""}
                type="submit"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </main>
      <Toaster />
    </div>
  );
}

export default App;
