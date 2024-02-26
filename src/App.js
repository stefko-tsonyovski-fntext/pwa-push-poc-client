import { useCallback, useState } from "react";
import "./App.css";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import TextInput from "./components/Input/TextInput";
import { useSubscribe } from "react-pwa-push-notifications";

// in PROD use from .env
export const PUBLIC_KEY =
  "BDZJSiMXSJUhryPkjFh_H84ZeEjVNfq5STCXVDEW4bpXye1mybGCjufRFIVmMxJN1wHOGUunGyBra0qvSa0fGJ8";

// export const BACKEND_URL = "https://api.dev.e-fact.app/api/v1";
export const BACKEND_URL = "https://pwa-push-server-zrn3.onrender.com/api/v1";

export const accessToken = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJfWDlqTkF2bU5WVUNUWVVaNlBTQWZfX21UdDdQcEJHWk85Z1pCT1ZDc1pNIn0.eyJleHAiOjE3MDg5NTMwMzIsImlhdCI6MTcwODk1MjczMiwianRpIjoiZWMyOGQxNmMtNzVlMi00ZTQyLWIyZGItYzAwNzU1MjQ3NGE5IiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50LmRldi5lLWZhY3QuYXBwL3JlYWxtcy9waWNhcmQiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiYzJmZjg0ZjQtNzE4Yi00NTdkLWE0NjMtNTAzZDRlZGEzOGJlIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoid2ViLWFwcCIsInNlc3Npb25fc3RhdGUiOiI0ZGNhZDMzOC00NDA1LTQ1MTYtOGU4Ny0xOTYyNGM2MDI1MzkiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vYXBwc3J2LXdldS1mbnQtZGV2LWZlLmF6dXJld2Vic2l0ZXMubmV0IiwiKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1waWNhcmQiLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsInNpZCI6IjRkY2FkMzM4LTQ0MDUtNDUxNi04ZTg3LTE5NjI0YzYwMjUzOSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhc3NldHM4QGFidi5iZyIsImVtYWlsIjoiYXNzZXRzOEBhYnYuYmcifQ.yKAADfMX7vl2pGBaP7P_kTnk_L0VBRFPZ8iATT2CG-hNKE5CirgRVsOQn_5bSn-qukcujrVPbfaahwqryjOFRGGRsSkH_068c0Wl1H5d1K2VYlnHNaeVPx4Fp1N53jEeGV4w8p5DEjQxnU30DyF3PXEMB0XZ1hvCwqAdbsK5fB1pKzmbmj6a_oKMhQRRXEZcc1dSzKjR1Aen4gWPPf5uAGEjwJ5m1NThyiEOWvQtK36pG2M9bSsZ5mboKPMNeRD2TADqh6txzzKzGbP-AEkL-PTAcro2CALuv26e7yu3mIN6G-pJg6bNd0Jt2XCbGcgOMPWu-kYauxRKRLNgsf7R_g";

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
    e.preventDefault();
    setLoadingPush(true);

    try {
      const sendPayload = {
        // message: JSON.stringify({
        //   title: "Miroslab",
        //   message: "Miroslabbbbbb",
        // }),
        userId: "1",
        title: "Miroslab",
        message: "Miroslabbbbbb",
      };

      // await axios.post(BACKEND_URL + "/users/notifications/send", sendPayload, {
      //   headers: { Authorization: `Bearer ${accessToken}` },
      // });

      await axios.post(BACKEND_URL + "/notifications/send", sendPayload);

      toast.success("Push success");
    } catch (e) {
      toast.error("Details console");
    } finally {
      setLoadingPush(false);
    }
  };

  const onSubscribe = useCallback(
    async (e) => {
      e.preventDefault();
      setLoadingSubscribe(true);
      try {
        const subscription = await getSubscription();

        toast.success("Subscription acquired");
        console.log(subscription.toJSON());

        await axios.post(BACKEND_URL + "/notifications/subscribe", {
          userId: "1",
          endpoint: subscription.endpoint,
          p256dh: subscription.toJSON().keys.p256dh,
          auth: subscription.toJSON().keys.auth,
        });

        // await axios.post(
        //   BACKEND_URL + "/users/notifications/subscribe",
        //   {
        //     endpoint: subscription.endpoint,
        //     p256dh: subscription.toJSON().keys.p256dh,
        //     auth: subscription.toJSON().keys.auth,
        //   },
        //   { headers: { Authorization: `Bearer ${accessToken}` } }
        // );

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

          console.log(
            e,
            existingSubscription.toJSON(),
            existingSubscription.subscriptionId
          );

          // await axios.post(
          //   BACKEND_URL + "/users/notifications/subscribe",
          //   {
          //     endpoint: existingSubscription.endpoint,
          //     p256dh: existingSubscription.toJSON().keys.p256dh,
          //     auth: existingSubscription.toJSON().keys.auth,
          //   },
          //   { headers: { Authorization: `Bearer ${accessToken}` } }
          // );

          toast.success("Existing subscription");
        } else {
          console.warn(e);
          toast.error("Something went wrong");
        }
      } finally {
        setLoadingSubscribe(false);
      }
    },
    [getSubscription]
  );

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
