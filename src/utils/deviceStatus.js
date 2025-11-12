export function isDeviceOnline(lastStatusUpdate, thresholdSeconds = 60) {
  if (!lastStatusUpdate) return false;

    const lastHeartbeat = new Date(lastStatusUpdate); // Date object
    const current_timestamp = Date.now(); // milliseconds

    return current_timestamp <= lastHeartbeat.getTime() + thresholdSeconds * 1000;
}