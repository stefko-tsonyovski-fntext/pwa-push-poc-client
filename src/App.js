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
  "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJfWDlqTkF2bU5WVUNUWVVaNlBTQWZfX21UdDdQcEJHWk85Z1pCT1ZDc1pNIn0.eyJleHAiOjE3MDg2MTY0MDYsImlhdCI6MTcwODYxNjEwNiwianRpIjoiYjY1OGFhYzEtYjg1Yi00ZDAzLTk0ZGEtNDcyNjhiYWM5MjA1IiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50LmRldi5lLWZhY3QuYXBwL3JlYWxtcy9waWNhcmQiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiYmZjMzIzYWItZGQwYy00YTdjLTllMjgtNjRhMGY2MGQ4NzY3IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoid2ViLWFwcCIsInNlc3Npb25fc3RhdGUiOiI2M2RiOWRmYS0xYzFlLTRkNjQtYTAwNS0zNGM2MWU0ZTgxNzciLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vYXBwc3J2LXdldS1mbnQtZGV2LWZlLmF6dXJld2Vic2l0ZXMubmV0IiwiKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1waWNhcmQiLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsInNpZCI6IjYzZGI5ZGZhLTFjMWUtNGQ2NC1hMDA1LTM0YzYxZTRlODE3NyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhc3NldHM0QGFidi5iZyIsImVtYWlsIjoiYXNzZXRzNEBhYnYuYmcifQ.PbFK8ddLtZ95NZbdM6xqbcNwd_74ILW3Rl7qfH79ys2s6q1HecIGSNl6eYBRXkjIIiBUg-yxTaXUNdreEKihULsCJpT6Ex7LKCrdvlOz6zmlwPoCf9Dsmrudm7Y_9Vh73nibFmRY2JnHWG9uVE0MQLxthlmbJk2TRGFDUu1gffSA5t4om0zinkHzrKAxJQWu3BwgzqvTHZvAAHpJgXysObf9CbCEgTbRtmxibp1CxhX1rSlPxYFiY_SiA1ldwnVJXATKFVhI08xEIL2aOTWHzhzM1CA07vqWbh2hfk8Z4wL6NvXl3IpVpCbb5Oh3aujGNFY7JRRU-_qr_dojWSJt6g";

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
