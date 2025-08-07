const API_BASE = process.env.API_HOST || 'http://localhost:5001'

export const fileUrl = (filename) => `${API_BASE}/uploads/${filename}`


export const ensureAbsolute = (u) => {
  if (!u) return u;
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  if (u.startsWith('/uploads/')) return `${API_BASE}${u}`;
  return u; // unknown format; leave untouched
};