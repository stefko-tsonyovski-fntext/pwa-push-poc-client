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

const BACKEND_URL = "https://pwa-push-poc-server.vercel.app";

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
        await axios.post(BACKEND_URL + "/subscribe", {
          subscription: subscription,
          id: subscribeId,
        });
        toast.success("Subscribe success");
      } catch (e) {
        console.warn(e);
        toast.error("Details console");
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
        await axios.post(BACKEND_URL + "/send", {
          message,
          title,
          id: pushId,
        });
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
