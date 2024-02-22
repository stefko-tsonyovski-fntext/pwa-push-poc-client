import toast from "react-hot-toast";

/**
 * Converts a base64 string to a Uint8Array.
 *
 * @function
 * @param {string} base64String - The base64 encoded string to convert.
 * @returns {Uint8Array} - The converted Uint8Array.
 */
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

/**
 * Custom hook to manage push notifications subscription.
 *
 * @function
 * @returns {Object} - An object containing the `getSubscription` function.
 */
export const useSubscribe = ({ publicKey }) => {
  /**
   * Gets a push subscription for the current user.
   *
   * @async
   * @function
   * @returns {Promise<PushSubscription>} - A promise that resolves to a PushSubscription.
   * @throws {ErrorObject} - An object containing an error code.
   */
  const getSubscription = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Service worker and push manager not supported");

      throw {
        errorCode: "ExistingSubscription",
      };
    }

    toast.success("Service worker supported");
    const registration = await navigator.serviceWorker.ready;

    if (!registration.pushManager) {
      toast.error("Push manager unavailable");

      throw { errorCode: "PushManagerUnavailable" };
    }

    toast.success("Push manager found");

    const existingSubscription =
      await registration.pushManager.getSubscription();

    if (existingSubscription) {
      toast.error("Subscription exists");

      throw { errorCode: "ExistingSubscription" };
    }

    toast.success("New subscription");

    const convertedVapidKey = urlBase64ToUint8Array(publicKey);

    return await registration.pushManager.subscribe({
      applicationServerKey: convertedVapidKey,
      userVisibleOnly: true,
    });
  };

  return { getSubscription };
};
