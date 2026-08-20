// thin wrapper around the API served by server/index.js
//
// locally, relative "/api" paths route through CRA's dev-server "proxy" to http://localhost:4000.
// in production the frontend and API aren't on the same host (e.g. Vercel + Render), so
// REACT_APP_API_BASE must point at the deployed API's full URL - see README for setup.
const API_BASE = process.env.REACT_APP_API_BASE || '/api';

async function request(path, { adminKey, ...options } = {}) {
  const headers = { ...options.headers };
  if (adminKey) headers['X-Admin-Key'] = adminKey;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export function verifyAdmin(adminKey) {
  return request('/admin/verify', { method: 'POST', adminKey });
}

// --- default locations ---

export function getLocations() {
  return request('/locations');
}

export function createLocation({ name, lng, lat }, adminKey) {
  return request('/locations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, lng, lat }),
    adminKey,
  });
}

export function updateLocation(id, { name, lng, lat }, adminKey) {
  return request(`/locations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, lng, lat }),
    adminKey,
  });
}

export function deleteLocation(id, adminKey) {
  return request(`/locations/${id}`, { method: 'DELETE', adminKey });
}

// --- guest recommendations ---

export function submitRecommendation({ name, lng, lat }) {
  return request('/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, lng, lat }),
  });
}

export function getRecommendations(adminKey) {
  return request('/recommendations', { adminKey });
}

export function dismissRecommendation(key, adminKey) {
  return request(`/recommendations/${encodeURIComponent(key)}`, { method: 'DELETE', adminKey });
}
