export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    // Token expired or invalid
    localStorage.removeItem("token"); // clear invalid token
    window.location.href = "/login";  // redirect immediately
    throw new Error("Unauthorized"); // <-- throw error to keep Promise chain valid
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
