import { useCallback, useEffect, useState } from "react";
import "./App.css";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import TextInput from "./components/Input/TextInput";
import { useServiceWorker } from "./useServiceWorker";

// in PROD use from .env
export const PUBLIC_KEY =
  "BDZJSiMXSJUhryPkjFh_H84ZeEjVNfq5STCXVDEW4bpXye1mybGCjufRFIVmMxJN1wHOGUunGyBra0qvSa0fGJ8";

export const BACKEND_URL = "https://api.dev.e-fact.app/api/v1";

export const accessToken =
  "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJfWDlqTkF2bU5WVUNUWVVaNlBTQWZfX21UdDdQcEJHWk85Z1pCT1ZDc1pNIn0.eyJleHAiOjE3MDg2MDIwOTgsImlhdCI6MTcwODYwMTc5OCwianRpIjoiODcxMGRhNWEtZGU2OS00NDEwLTk3MDgtM2RlMDNjMzllNDIxIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50LmRldi5lLWZhY3QuYXBwL3JlYWxtcy9waWNhcmQiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiMTM4NzNlMTktYjYyYi00ZTQ5LTg1NDQtY2FkM2ZlMjU5MzczIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoid2ViLWFwcCIsInNlc3Npb25fc3RhdGUiOiI2ZTgwMDk4Yi1lMzI3LTQ5MWMtYTM1My0xOWQ2MDdmODA1ZmYiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vYXBwc3J2LXdldS1mbnQtZGV2LWZlLmF6dXJld2Vic2l0ZXMubmV0IiwiKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1waWNhcmQiLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsInNpZCI6IjZlODAwOThiLWUzMjctNDkxYy1hMzUzLTE5ZDYwN2Y4MDVmZiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhc3NldHMzQGFidi5iZyIsImVtYWlsIjoiYXNzZXRzM0BhYnYuYmcifQ.dtGzvIyQFYxDhqDp1ZSI5pFxoKxtL-fg2RQyhkecv5u6l2iIKiRbFNBNTp5bJicfnEGC16-p7MKZ5i6J28j8M4CbhrCOM2hHACJd6GF49YE95tay8iZTASlg4bIoF1ogMwG9IOA_gjJ9erl6NfyEz0r0vpwGhN3hW1uG0hQd82H5WqWteEvgkykqXh0yT82IL7OKv_Ca4pc2hW5ni1UAd0skzfco2HFK_bbGsMIUuK3oYVpFWueVFotcTxJnbRIpGYpTvgWqVwSg9AUpW2Eptn28v7MNZ86TLRfNz5ca8wysIXj4oa5trHJ6v2hXpjaG-egyg3DGDV7quoFoplsrwQ";

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

export const notificationsSupported = () =>
  "Notification" in window &&
  "serviceWorker" in navigator &&
  "PushManager" in window;

export const subscribe = async () => {
  toast.success("Subcribe start...");

  if ("serviceWorker" in navigator) {
    const swRegistration = await navigator.serviceWorker.ready;
    toast.success("Sw registration: " + JSON.stringify(swRegistration));
    await window?.Notification.requestPermission();
    toast.success("Notifications permission...");

    try {
      const options = {
        applicationServerKey: PUBLIC_KEY,
        userVisibleOnly: true,
      };

      const subscription = await swRegistration.pushManager.subscribe(options);
      toast.success("Handle subscription...");

      await saveSubscription(subscription);
      toast.success("Store subscription...");
    } catch (err) {
      console.error(err);
      toast.error("Error during subscription: " + JSON.stringify(err));
    }
  } else {
    toast.error("Service workers are not supported.");
  }
};

const saveSubscription = async (subscription) => {
  const response = await fetch(BACKEND_URL + "/users/notifications/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      p256dh: subscription.toJSON().keys.p256dh,
      auth: subscription.toJSON().keys.auth,
    }),
  });

  return response.json();
};

function App() {
  const [loadingSubscribe, setLoadingSubscribe] = useState(false);
  const [loadingPush, setLoadingPush] = useState(false);
  const [pushId, setPushId] = useState("push id");
  const [message, setMessage] = useState("World");
  const [title, setTitle] = useState("Hello");
  const [showSubscribe, setShowSubscribe] = useState(true);
  const worker = useServiceWorker();

  const onShowPush = () => {
    setShowSubscribe(false);
  };

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

  const onChange = useCallback(
    (setState) => (e) => {
      setState(e.target.value);
    },
    []
  );

  useEffect(() => {
    subscribe()
      .then(() => toast.success("Subscription process successful"))
      .catch((err) => toast.error("Error: " + JSON.stringify(err)));
  }, []);

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
              onClick={subscribe}
            >
              Subscribe
            </button>
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
            <form onSubmit={subscribe}>
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
