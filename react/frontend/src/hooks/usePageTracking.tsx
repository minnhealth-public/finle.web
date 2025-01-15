import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { logEventWithTimestamp } from "../lib/analytics";
import { useStore } from "../store";
import uuidv4 from "../lib/uuid";

export function usePageTracking(): null {
  const location = useLocation();
  const { session, setSession } = useStore();

  const getUTCNow = () => {
    var now = new Date;
    var utc_timestamp = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(),
      now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
    return utc_timestamp;
  }

  useEffect(() => {
    logEventWithTimestamp("screen_view", {
      firebase_screen: location.pathname, // <- In my case I do not want to include search params, so "location.pathname" is just what I want
      firebase_params: location.search,
      firebase_screen_class: "firebase-routes-analytics", // <- name is up to you
    });
  }, [location]);


  useEffect(() => {
    let timer: NodeJS.Timeout;
    const inactive = () => {
      logEventWithTimestamp("inactive", {
        id: session.id,
        start_time: session.startTime,
        end_time: getUTCNow(),
      });
      // this session has ended
      setSession(null);
    }

    const inactiveWait = () => {
      timer = setTimeout(() => inactive(), 1000 * 60 * 30); // wait 30 minutes
      return timer;
    }

    const handleInteraction = () => {
      clearTimeout(timer);
      timer = inactiveWait();
      // If we have cleared a session or this is the first itneraction create a new session
      if (session == null) {
        const random_uuid = uuidv4();
        setSession({
          id: random_uuid,
          startTime: getUTCNow()
        });
      }

    }

    timer = inactiveWait();

    document.body.addEventListener("mousemove", handleInteraction);
    document.body.addEventListener("scroll", handleInteraction);
    document.body.addEventListener("keydown", handleInteraction);
    document.body.addEventListener("click", handleInteraction);
    document.body.addEventListener("touchstart", handleInteraction);
    window.addEventListener("beforeunload", inactive);

    return () => {
      clearTimeout(timer);
      document.body.removeEventListener("mousemove", handleInteraction);
      document.body.removeEventListener("scroll", handleInteraction);
      document.body.removeEventListener("keydown", handleInteraction);
      document.body.removeEventListener("click", handleInteraction);
      document.body.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  return null;
}
