import React from "react";
import { useCallback, useEffect, useState } from "react";
import "./App.css";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { useSubscribe } from "react-pwa-push-notifications";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import TextInput from "./components/Input/TextInput";

// in PROD use from .env
const PUBLIC_KEY =
  "BDZJSiMXSJUhryPkjFh_H84ZeEjVNfq5STCXVDEW4bpXye1mybGCjufRFIVmMxJN1wHOGUunGyBra0qvSa0fGJ8";

const BACKEND_URL = "https://api.dev.e-fact.app/api/v1";
const accessToken =
  "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJfWDlqTkF2bU5WVUNUWVVaNlBTQWZfX21UdDdQcEJHWk85Z1pCT1ZDc1pNIn0.eyJleHAiOjE3MDg1MTU3NTQsImlhdCI6MTcwODUxNTQ1NCwianRpIjoiMjhjNGQyM2YtYWI2ZC00Njk4LWE3ZjQtNWU4ODZjMjYzODk1IiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50LmRldi5lLWZhY3QuYXBwL3JlYWxtcy9waWNhcmQiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiZTI0NGFjMWEtMTkxNC00MDUzLTg5NzctZjllYmQ3NjQ1ODQ1IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoid2ViLWFwcCIsInNlc3Npb25fc3RhdGUiOiJkNjFiZDQzOC0wYjMyLTRlODItYjBlOS00ZGRiOWE0NGVjNjMiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vYXBwc3J2LXdldS1mbnQtZGV2LWZlLmF6dXJld2Vic2l0ZXMubmV0IiwiKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1waWNhcmQiLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsInNpZCI6ImQ2MWJkNDM4LTBiMzItNGU4Mi1iMGU5LTRkZGI5YTQ0ZWM2MyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhc3NldHNAYWJ2LmJnIiwiZW1haWwiOiJhc3NldHNAYWJ2LmJnIn0.xDAhoaixY8YCp_6AwZYITdw1AlhbkjhSj1fPigCjzJUwh-nONRHHGc9emjXRgjpu64RxDntbSR5kTEdh3EZhU28AXkaVU4pa68bdBxkqtzKCvkGCcvottDjqc_I-ga4C9Z_tyHlVxG5kF2ynPSvKPG_AwxykIDy5PAYQEgz0mEACLwivwsH6uf-7B2AiJdhvMD84wD9tbcGB-L7-xMa1anvT6EqtNy00ESQBjxgYtLTATc0Rihgfd8cL2OpSL1VLOXd1Ms85wiyW8X70GBH5q3YcatEy_1ZXP4H2Yjg0b26EGrCoSrwV-Hrm01jgsIcLYTHADDOxk_fK-NIB2TsBsA";

const urlBase64ToUint8Array = (base64String) => {
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
  const [pushId, setPushId] = useState("");
  const [message, setMessage] = useState("World");
  const [title, setTitle] = useState("Hello");
  const [subscribeId, setSubscribeId] = useState("");
  const [showSubscribe, setShowSubscribe] = useState(true);

  const onShowSubscribe = () => {
    setShowSubscribe(true);
  };
  const onShowPush = () => {
    setShowSubscribe(false);
  };

  const { getSubscription } = useSubscribe({ publicKey: PUBLIC_KEY });

  const onSubmitSubscribe = useCallback(
    async (e) => {
      e.preventDefault();
      setLoadingSubscribe(true);
      try {
        const subscription = await getSubscription();
        console.log(subscription.toJSON());

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
        if (e.errorCode === "ExistingSubscription") {
          const registration = await navigator.serviceWorker.ready;
          const convertedVapidKey = urlBase64ToUint8Array(PUBLIC_KEY);

          const existingSubscription = await registration.pushManager.subscribe(
            {
              applicationServerKey: convertedVapidKey,
              userVisibleOnly: true,
            }
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

          toast.success("Subscribe success");

          console.log(
            e,
            existingSubscription.toJSON(),
            existingSubscription.subscriptionId
          );
        } else {
          console.warn(e);
          toast.error("Details console");
        }
      } finally {
        setLoadingSubscribe(false);
      }
    },
    [getSubscription, subscribeId]
  );

  const onSubmitPush = useCallback(
    async (e) => {
      e.preventDefault();
      setLoadingPush(true);

      try {
        const sendPayload = {
          message: JSON.stringify({
            title: "Miroslab",
            message: "Miroslab e gei",
          }),
        };

        await axios.post(
          BACKEND_URL + "/users/notifications/send",
          sendPayload,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        toast.success("Push success");
      } catch (e) {
        toast.error("Details console");
      } finally {
        setLoadingPush(false);
      }
    },
    [pushId, message, title]
  );

  const onChange = useCallback(
    (setState) => (e) => {
      setState(e.target.value);
    },
    []
  );

  useEffect(() => {
    FingerprintJS.load()
      .then((fp) => fp.get())
      .then((result) => {
        setSubscribeId(result.visitorId);
        setPushId(result.visitorId);
      });
  }, []);

  return (
    <div className="App">
      <main>
        <div>
          <div className="message">
            <div className="title"> Use as PWA</div>
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
            <form onSubmit={onSubmitSubscribe}>
              <div className="title">Your Id</div>
              <TextInput
                id="fingerprint"
                placeholder="Your id"
                value={subscribeId}
                onChange={onChange(setSubscribeId)}
              />
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
