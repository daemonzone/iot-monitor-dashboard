import { useState, useEffect } from "react";

export const HEARTBEAT_TTL = 60; // seconds

export function useMonitorStatus() {
  const [monitorOnline, setMonitorOnline] = useState(null);
  const [lastHeartbeat, setLastHeartbeat] = useState(0);

  // On first load, read from localStorage
  useEffect(() => {
    const savedTs = parseInt(localStorage.getItem("monitor_heartbeat"), 10);
    if (savedTs) {
      console.log("savedTs", savedTs);
      setLastHeartbeat(savedTs);
      const now = Math.floor(Date.now() / 1000);
      const monitorStatus = (now <= savedTs + HEARTBEAT_TTL);
      if (!monitorStatus)
      	localStorage.removeItem("monitor_heartbeat");
      setMonitorOnline(monitorStatus);
    } else {
      console.warn("No previous heartbeat found")
    }
  }, []);

  // Keep monitorOnline updated every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!lastHeartbeat) {
      	setMonitorOnline(false);
      	return;
      }
      const now = Math.floor(Date.now() / 1000);
      console.log("Checking heartbeat validity:", now, lastHeartbeat + HEARTBEAT_TTL, lastHeartbeat + HEARTBEAT_TTL - now, now <= lastHeartbeat + HEARTBEAT_TTL);
      setMonitorOnline(now <= lastHeartbeat + HEARTBEAT_TTL);
    }, 5000);

    return () => clearInterval(interval);
  }, [lastHeartbeat]); // updates interval whenever lastHeartbeat changes

  return { monitorOnline, setMonitorOnline, lastHeartbeat, setLastHeartbeat };
}
