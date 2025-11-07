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
    return;
  }

  return response.json();
}
