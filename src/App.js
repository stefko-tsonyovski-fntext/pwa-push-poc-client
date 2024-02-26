import { useCallback, useState } from "react";
import "./App.css";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import TextInput from "./components/Input/TextInput";
import { useSubscribe } from "react-pwa-push-notifications";

// in PROD use from .env
export const PUBLIC_KEY =
  "BDZJSiMXSJUhryPkjFh_H84ZeEjVNfq5STCXVDEW4bpXye1mybGCjufRFIVmMxJN1wHOGUunGyBra0qvSa0fGJ8";

export const BACKEND_URL = "https://api.dev.e-fact.app/api/v1";
// export const BACKEND_URL = "https://pwa-push-server-zrn3.onrender.com/api/v1";

export const accessToken =
  "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJfWDlqTkF2bU5WVUNUWVVaNlBTQWZfX21UdDdQcEJHWk85Z1pCT1ZDc1pNIn0.eyJleHAiOjE3MDg5NjAyNzksImlhdCI6MTcwODk1OTk3OSwianRpIjoiZTMyZDA4MWEtMDM4YS00MzQ0LThhNDctODU5YjY3YmNlZjUwIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50LmRldi5lLWZhY3QuYXBwL3JlYWxtcy9waWNhcmQiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiYzJmZjg0ZjQtNzE4Yi00NTdkLWE0NjMtNTAzZDRlZGEzOGJlIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoid2ViLWFwcCIsInNlc3Npb25fc3RhdGUiOiJlNTkzOGQ5Mi1mOWQ5LTRhOTgtOTEwOC0yYjI2YjIwODhmNTIiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vYXBwc3J2LXdldS1mbnQtZGV2LWZlLmF6dXJld2Vic2l0ZXMubmV0IiwiKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1waWNhcmQiLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsInNpZCI6ImU1OTM4ZDkyLWY5ZDktNGE5OC05MTA4LTJiMjZiMjA4OGY1MiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhc3NldHM4QGFidi5iZyIsImVtYWlsIjoiYXNzZXRzOEBhYnYuYmcifQ.kevY1bSLJHew1h7rhrZsoQoJSXHiLz9luv_MN_X3iLBl1QVY8NRIg2u6lxJsBknSsFrA6SFABPLlgatuuxXxiXXJuyxc6zvTg-puKCcY8NawYbH-WH1qYA6Tud8SJHzeFudFuuMBw9v9nyqsHw7_bIITqy7XcpORgQnswnvDCTOHMOYvMc_gvmoRhmuyJh_vNRuSGF4wbklEXL6b287Iva6tPNCfPOGOLouKAyOgYgwjxYyLEjkVbMQpiZyCm0vIq5xR1YTWawnmEq-x60uGQzYmKU-35io4Qh2xi5UT1wX9h2QoieSB7pbU_qj8jIjoVe9YEgMzQgeH9Sn7q3D2mg";

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

  const onSubmitPush = async (e) => {
    setLoadingPush(true);

    try {
      const sendPayload = {
        message: JSON.stringify({
          title: "Miroslab",
          message: "Miroslabbbbbb",
        }),
        // userId: "1",
        // title: "Miroslab",
        // message: "Miroslabbbbbb",
      };

      await axios.post(BACKEND_URL + "/users/notifications/send", sendPayload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // await axios.post(BACKEND_URL + "/notifications/send", sendPayload);

      toast.success("Push success");
    } catch (e) {
      toast.error("Details console");
    } finally {
      setLoadingPush(false);
    }
  };

  const onSubscribe = async () => {
    setLoadingSubscribe(true);
    try {
      const subscription = await getSubscription();

      toast.success("Subscription acquired");
      console.log(subscription.toJSON());

      // await axios.post(BACKEND_URL + "/notifications/subscribe", {
      //   userId: "1",
      //   endpoint: subscription.endpoint,
      //   p256dh: subscription.toJSON().keys.p256dh,
      //   auth: subscription.toJSON().keys.auth,
      // });

      await axios.post(
        BACKEND_URL + "/users/notifications/subscribe",
        {
          endpoint: subscription.endpoint,
          p256dh: subscription.toJSON().keys.p256dh,
          auth: subscription.toJSON().keys.auth,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      toast.success("Subscribe success");
    } catch (e) {
      toast.success(e.errorCode);
      if (e.errorCode === "ExistingSubscription") {
        const registration = await navigator.serviceWorker.ready;
        const convertedVapidKey = urlBase64ToUint8Array(PUBLIC_KEY);

        const existingSubscription = await registration.pushManager.subscribe({
          applicationServerKey: convertedVapidKey,
          userVisibleOnly: true,
        });

        console.log(
          e,
          existingSubscription.toJSON(),
          existingSubscription.subscriptionId
        );

        await axios.post(
          BACKEND_URL + "/users/notifications/subscribe",
          {
            endpoint: existingSubscription.endpoint,
            p256dh: existingSubscription.toJSON().keys.p256dh,
            auth: existingSubscription.toJSON().keys.auth,
          },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        toast.success("Existing subscription");
      } else {
        console.warn(e);
        toast.error("Something went wrong");
      }
    } finally {
      setLoadingSubscribe(false);
    }
  };

  const onChange = useCallback(
    (setState) => (e) => {
      setState(e.target.value);
    },
    []
  );

  return (
    <div className="App">
      <main>
        <div>
          <div className="message">
            <div className="title">Use as PWA 2</div>
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
          <div
            className="send"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
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
            <button
              onClick={onSubmitPush}
              className={loadingPush ? "loading" : ""}
              type="submit"
            >
              Send
            </button>
          </div>
        )}
        {showSubscribe && (
          <div className="send">
            <button
              onClick={onSubscribe}
              className={loadingSubscribe ? "loading" : ""}
              type="submit"
            >
              Send Subscription
            </button>
          </div>
        )}
      </main>
      <Toaster />
    </div>
  );
}

export default App;
