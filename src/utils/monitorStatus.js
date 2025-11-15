import { useState, useEffect, useRef } from "react";

export const HEARTBEAT_TTL = 60; // seconds

export function useMonitorStatus() {
  const [monitorOnline, setMonitorOnline] = useState(null);
  const [lastHeartbeat, setLastHeartbeat] = useState(0);
  const offlineTimeoutRef = useRef(null);

  // On first load, read last heartbeat from localStorage
  useEffect(() => {
    const savedTs = parseInt(localStorage.getItem("monitor_heartbeat"), 10);
    if (savedTs) {
      console.log("savedTs", savedTs);
      setLastHeartbeat(savedTs);

      const now = Math.floor(Date.now() / 1000);
      const monitorStatus = now <= savedTs + HEARTBEAT_TTL;
      if (!monitorStatus) localStorage.removeItem("monitor_heartbeat");

      setMonitorOnline(monitorStatus);
    } else {
      console.warn("No previous heartbeat found");
    }
  }, []);

  // Keep monitorOnline updated and handle delayed offline logic
  useEffect(() => {
    if (offlineTimeoutRef.current) {
      clearTimeout(offlineTimeoutRef.current); // Clear any previous offline timeout
      offlineTimeoutRef.current = null;
    }

    if (!lastHeartbeat) {
      offlineTimeoutRef.current = setTimeout(() => { // Start a 60-second timer before marking offline
        setMonitorOnline(false);
      }, 60000);
    } else {
      setMonitorOnline(true); // Heartbeat received → immediately online

      // Also check TTL continuously every 5 seconds
      const interval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const stillOnline = now <= lastHeartbeat + HEARTBEAT_TTL;
        setMonitorOnline(stillOnline);

        if (!stillOnline) {
          clearInterval(interval);
        }
      }, 5000);

      return () => clearInterval(interval);
    }

    // Cleanup timeout on unmount or lastHeartbeat change
    return () => {
      if (offlineTimeoutRef.current) clearTimeout(offlineTimeoutRef.current);
    };
  }, [lastHeartbeat]);

  return { monitorOnline, setMonitorOnline, lastHeartbeat, setLastHeartbeat };
}
