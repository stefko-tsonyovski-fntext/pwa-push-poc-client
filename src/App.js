import React from "react";
import { useCallback, useEffect, useState } from "react";
import "./App.css";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import TextInput from "./components/Input/TextInput";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { useServiceWorker } from "./useServiceWorker";

// in PROD use from .env
export const PUBLIC_KEY =
  "BDZJSiMXSJUhryPkjFh_H84ZeEjVNfq5STCXVDEW4bpXye1mybGCjufRFIVmMxJN1wHOGUunGyBra0qvSa0fGJ8";

export const BACKEND_URL = "https://api.dev.e-fact.app/api/v1";

export const accessToken =
  "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJfWDlqTkF2bU5WVUNUWVVaNlBTQWZfX21UdDdQcEJHWk85Z1pCT1ZDc1pNIn0.eyJleHAiOjE3MDg1OTUxMDUsImlhdCI6MTcwODU5NDgwNSwianRpIjoiYjg2YWY2ZTctNGJhYy00N2VkLTgwMjItNGNhNTU5ZWYyNWJiIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50LmRldi5lLWZhY3QuYXBwL3JlYWxtcy9waWNhcmQiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiMTM4NzNlMTktYjYyYi00ZTQ5LTg1NDQtY2FkM2ZlMjU5MzczIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoid2ViLWFwcCIsInNlc3Npb25fc3RhdGUiOiJjZGZhYzdjYS1mMGI5LTRmYmMtYjQ1MC01YThkNzU0NDQwMjYiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vYXBwc3J2LXdldS1mbnQtZGV2LWZlLmF6dXJld2Vic2l0ZXMubmV0IiwiKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1waWNhcmQiLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsInNpZCI6ImNkZmFjN2NhLWYwYjktNGZiYy1iNDUwLTVhOGQ3NTQ0NDAyNiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhc3NldHMzQGFidi5iZyIsImVtYWlsIjoiYXNzZXRzM0BhYnYuYmcifQ.h9cjCyAEz6zlccSp2hFf6tIN2fExP_V0V4sLf2LCQEMk9Z6T03yLbA-NCsJ6_OW8SAwyvTmVkCYvwkUa6BlybMGSjNSDWizHQIsdI0ODnWXZw7sD7Am4e2V62XA0CtyRG88fEl2nDEmXKFzslFmwqV1jAQt6X918xq90NcjBYDeC4xexZ9vo0sCLAs38Hf_pwuNYuPgYpjKJQ7OwndRx0AoF8i8dqLP38qdDbsnQQsGkaryVrFoHGz7A1YtTCmPbQOVwLxVc4vrY1RWz1ghvDrWYQIQK9LDoNO4TH7Yp76pmbExh2fYd5776fdC876cQ0ujeVf4AWcxmKR5zZ6oMfw";

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
  const swRegistration = await navigator.serviceWorker.getRegistration();
  toast.success("Sw registration...");
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
    toast.error("Error during subscription: " + JSON.stringify(err));
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
  const [subscribeId, setSubscribeId] = useState("subcribe id");
  const [showSubscribe, setShowSubscribe] = useState(true);
  const [error, setError] = useState("");
  const [registration, setRegistration] = useState(null);
  const { waitingWorker, showReload, reloadPage } = useServiceWorker();

  const onShowSubscribe = () => {
    setShowSubscribe(true);
  };
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
    // FingerprintJS.load()
    //   .then((fp) => fp.get())
    //   .then((result) => {
    //     setSubscribeId(result.visitorId);
    //     setPushId(result.visitorId);
    //   });
    // serviceWorkerRegistration.register();
    // subscribe()
    //   .then(() => toast.success("Subscription process successful"))
    //   .catch((err) => toast.error("Error: " + JSON.stringify(err)));
  }, []);

  useEffect(() => {
    if (showReload && waitingWorker) {
      console.debug("Update is available");

      subscribe()
        .then(() => {
          reloadPage()
            .then(() => toast.success("Reload success"))
            .catch((err) =>
              toast.error("Reload error: " + JSON.stringify(err))
            );
          toast.success("Success");
        })
        .catch((err) => toast.error("Error: " + JSON.stringify(err)));
    }
  }, [waitingWorker, showReload, reloadPage]);

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
