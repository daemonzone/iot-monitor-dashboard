import { useState, useEffect } from "react";

export const HEARTBEAT_TTL = 60; // seconds

export function useMonitorStatus() {
  const [monitorOnline, setMonitorOnline] = useState(null);
  const [lastHeartbeat, setLastHeartbeat] = useState(0);

  // On first load, read from localStorage
  useEffect(() => {
    const savedTs = parseInt(localStorage.getItem("monitor_heartbeat"), 10);
    if (savedTs) {
      setLastHeartbeat(savedTs);
      const now = Math.floor(Date.now() / 1000);
      const monitorStatus = (now <= savedTs + HEARTBEAT_TTL);
      if (!monitorStatus)
      	localStorage.removeItem("monitor_heartbeat");
      setMonitorOnline(monitorStatus);
    }
  }, []);

  // Keep monitorOnline updated every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (!lastHeartbeat) {
      	setMonitorOnline(false);
      	return;
      }
      const now = Math.floor(Date.now() / 1000);
      setMonitorOnline(now <= lastHeartbeat + HEARTBEAT_TTL);
    }, 5000);

    return () => clearInterval(interval);
  }, [lastHeartbeat]); // updates interval whenever lastHeartbeat changes

  return { monitorOnline, setMonitorOnline, lastHeartbeat, setLastHeartbeat };
}
