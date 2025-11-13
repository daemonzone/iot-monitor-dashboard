export function isDeviceOnline(lastStatusUpdate, thresholdSeconds = 60) {
  if (!lastStatusUpdate) return false;

  const lastHeartbeat = new Date(lastStatusUpdate).getTime(); // milliseconds
  const now = Date.now(); // milliseconds

  return now <= lastHeartbeat + thresholdSeconds * 1000;
}