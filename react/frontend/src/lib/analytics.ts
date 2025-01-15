import { getAnalytics, logEvent } from '@firebase/analytics';
export function logEventWithTimestamp(eventName: string, eventParams = {}) {
  const analytics = getAnalytics();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localTimestamp = new Date().toLocaleString('en-US', { timeZone: timezone });
  logEvent(analytics, eventName, { ...eventParams, local_timestamp: localTimestamp });
}