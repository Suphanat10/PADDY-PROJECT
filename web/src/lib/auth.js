// /src/lib/auth.js
import { headers, cookies as nextCookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { API_BASE } from './api';

export function getAccessTokenFromCookies() {
  try {
    const cookieStore = nextCookies();
    return cookieStore.get('accessToken')?.value || null;
  } catch {
    return null;
  }
}

export async function getMeServer() {
  const h = headers();
  const cookieHeader = h.get('cookie') || '';
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      cookie: cookieHeader,
    },
    cache: 'no-store',
  });

  if (!res.ok) return null;
  try {
    const data = await res.json();
    return data?.user || null;
  } catch {
    return null;
  }
}

// ใช้ใน Server Component/Layout
export async function requireAuth(nextPath = '/') {
  const user = await getMeServer();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}
