import { useState, useCallback, useEffect } from "react";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

export const useServiceWorker = () => {
  const [registration, setRegistration] = useState(null);
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [showReload, setShowReload] = useState(false);

  // simply put, this tells the service
  // worker to skip the waiting phase and then reloads the page
  const reloadPage = useCallback(async () => {
    await registration?.unregister();
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
    setShowReload(false);
    // window.location.reload();
  }, [waitingWorker]);

  // register the service worker
  useEffect(() => {
    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: https://cra.link/PWA
    serviceWorkerRegistration.register();
  }, []);

  return { showReload, waitingWorker, reloadPage };
};
