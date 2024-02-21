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
  "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJfWDlqTkF2bU5WVUNUWVVaNlBTQWZfX21UdDdQcEJHWk85Z1pCT1ZDc1pNIn0.eyJleHAiOjE3MDg1MTY0MjIsImlhdCI6MTcwODUxNjEyMiwianRpIjoiMmYyN2VlYmQtZjIyZi00MzRiLWJhMzUtYjVlOWQ0MmEzYTExIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50LmRldi5lLWZhY3QuYXBwL3JlYWxtcy9waWNhcmQiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiODZhZmY1MjAtODI4ZC00ODM2LWFlYzktYjk0MmQxMDU3ODk4IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoid2ViLWFwcCIsInNlc3Npb25fc3RhdGUiOiJkN2JlZTU0Zi1jNzY0LTRmODktODBhMi1iOTg1ZjYxZmNjMDEiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vYXBwc3J2LXdldS1mbnQtZGV2LWZlLmF6dXJld2Vic2l0ZXMubmV0IiwiKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1waWNhcmQiLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsInNpZCI6ImQ3YmVlNTRmLWM3NjQtNGY4OS04MGEyLWI5ODVmNjFmY2MwMSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhc3NldHMyQGFidi5iZyIsImVtYWlsIjoiYXNzZXRzMkBhYnYuYmcifQ.OwQZvWVrvBfgc2pauATvCSresCLB1SqWkP97RZ6qOLeYUZsvZdH5V99HONKOnWMq0gg-eaWUyTGEp5NIME957bZHIduPRXghkC5Ww9zkI6RlSm5CGXOy_XrzKllrAHAIuMHztW5RN61Ktxub-oCFEIumjQ_gwL3eRIihAq0233sbJMQx8RkCgcbcgOw-zUkZXeNna7P5GzMNq79UrnV6-l770SaDKjBfDqsp7YjcZ12Kq_Gh7j7xH0nxNaoGKxzacFyRiBpCTBq-jrtCAVLjSCUGkSWS8wRLpl_nq2Muth_bDV7f3XpzGUe-oBPWGcOpZYHIiwrm18aHbWMdls5XtA";

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
  const [error, setError] = useState("")

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
        setError(e)
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
            <div className="title"> Use as PWAAA</div>
  {error?.errorCode}
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
