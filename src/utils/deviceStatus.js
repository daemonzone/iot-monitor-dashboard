export function isDeviceOnline(lastStatusUpdate, thresholdSeconds = 60) {
  if (!lastStatusUpdate) return false;
  const lastUpdate = new Date(lastStatusUpdate);
  const now = new Date();
  return now - lastUpdate <= thresholdSeconds * 1000;
}