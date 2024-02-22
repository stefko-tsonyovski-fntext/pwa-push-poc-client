import { useCallback, useEffect, useState } from "react";
import "./App.css";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import TextInput from "./components/Input/TextInput";
import { useServiceWorker } from "./useServiceWorker";
import { useSubscribe } from "react-pwa-push-notifications";

// in PROD use from .env
export const PUBLIC_KEY =
  "BDZJSiMXSJUhryPkjFh_H84ZeEjVNfq5STCXVDEW4bpXye1mybGCjufRFIVmMxJN1wHOGUunGyBra0qvSa0fGJ8";

export const BACKEND_URL = "https://api.dev.e-fact.app/api/v1";

export const accessToken =
  "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJfWDlqTkF2bU5WVUNUWVVaNlBTQWZfX21UdDdQcEJHWk85Z1pCT1ZDc1pNIn0.eyJleHAiOjE3MDg2MTAwMTUsImlhdCI6MTcwODYwOTcxNSwianRpIjoiNjZhZGJhMjUtNzQ5OS00MzRiLTkyMWUtZWEzYTM0NGQ2ZmI5IiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50LmRldi5lLWZhY3QuYXBwL3JlYWxtcy9waWNhcmQiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiYmZjMzIzYWItZGQwYy00YTdjLTllMjgtNjRhMGY2MGQ4NzY3IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoid2ViLWFwcCIsInNlc3Npb25fc3RhdGUiOiIwMDU4MTg1Yi03NzBjLTQ3MDQtOGZhMC1mMDAzNDNiMDI0MjEiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vYXBwc3J2LXdldS1mbnQtZGV2LWZlLmF6dXJld2Vic2l0ZXMubmV0IiwiKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1waWNhcmQiLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsInNpZCI6IjAwNTgxODViLTc3MGMtNDcwNC04ZmEwLWYwMDM0M2IwMjQyMSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhc3NldHM0QGFidi5iZyIsImVtYWlsIjoiYXNzZXRzNEBhYnYuYmcifQ.P9IYajjBrgKjnnz5td_x4HeUg9d7OKg9ufspPihZ0RpvNy4lO2mNuFwW6ku-ZkHvhMTkf3H8xfvFxqWL29e8PijPOATYek5ApJQcLRlGNSbwj9PAoVnRM2yqcFU6BIdu9qKz5PUzL5iCPDHisyGElNNhA0Bll0EW1Ok7n0i-6_ujx68rXlqtuc79mbRI1e0-xHW84SU2bFkOcgyc_FPud744Luv8xSmpSTlAlkE9d51kQKVSvtgSSEtnpu185w5XJNaSCb_fjcKprVTP-ib5vaZAqJoy2AqMuqY7NU_o2zk7WaG_qdGgRMWAuDP_Knf67VcSvSrxCxfhDBAGq4hifg";

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

  const onChange = useCallback(
    (setState) => (e) => {
      setState(e.target.value);
    },
    []
  );

  useEffect(() => {
    onSubscribe();
  }, [onSubscribe]);

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
