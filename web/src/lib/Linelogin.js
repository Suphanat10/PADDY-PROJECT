import liff from "@line/liff";
import { apiFetch } from "@/lib/api";

export async function ensureLiffLogin() {
  await liff.init({
    liffId: process.env.NEXT_PUBLIC_LIFF_ID,
    withLoginOnExternalBrowser: true,
  });

  if (!liff.isLoggedIn()) {
    liff.login();
    return;
  }

  const profile = await liff.getProfile();
  const token = liff.getAccessToken();

  const res = await apiFetch("/api/auth/login-line", {
    method: "POST",
    body: { userId: profile.userId },
  });

  return {
    token,
    user: res.user,
    profile,
  };
}
