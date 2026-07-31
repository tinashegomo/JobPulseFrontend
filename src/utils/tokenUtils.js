// ============================================================
// tokenUtils.js
//
// We do NOT decode the JWT for roles or user info — the backend
// handles all of that. The only reason we touch the token on
// the frontend is:
//
//   1. Store it in localStorage after login
//   2. Remove it on logout
//   3. Check if it's expired LOCALLY on page refresh
//      so we don't bother calling /current-user with a
//      token we already know is dead (saves a network trip)
//
// Role extraction, validation, and signature verification
// all stay in your Spring Boot JWTUtils — never duplicated here.
// ============================================================

export function getStoredToken() {
  return localStorage.getItem("token");
}

export function saveToken(token) {
  localStorage.setItem("token", token);
}

export function removeToken() {
  localStorage.removeItem("token");
}

// The only JWT "decode" we do — just reading the exp claim
// to avoid a pointless network call with an expired token.
// We are NOT verifying the signature here (only the backend does that).
export function isTokenExpired(token) {
  try {
    // JWT structure: HEADER.PAYLOAD.SIGNATURE
    // atob() base64-decodes the payload segment
    const payload = JSON.parse(atob(token.split(".")[1]));

    // exp is a Unix timestamp in SECONDS, Date.now() is milliseconds
    return payload.exp < Date.now() / 1000;
  } catch {
    // Malformed token → treat as expired
    return true;
  }
}