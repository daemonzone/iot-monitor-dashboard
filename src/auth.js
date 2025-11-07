// Temporary auth check (replace with real logic)
export function isAuthenticated() {
  // e.g., check localStorage token or cookie
  return !!localStorage.getItem("token");
}
