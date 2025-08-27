// /src/lib/api.js
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;

  // defaults
  const method = (options.method || "GET").toUpperCase();

  // เตรียม headers + body
  const headers = { ...(options.headers || {}) };
  let body = options.body;

  // ถ้ามี body และไม่ใช่ FormData → แปลงเป็น JSON และใส่ Content-Type ให้อัตโนมัติ
  if (body !== undefined && !(body instanceof FormData)) {
    if (typeof body !== "string") {
      body = JSON.stringify(body);
    }
    if (!headers["Content-Type"] && !headers["content-type"]) {
      headers["Content-Type"] = "application/json";
    }
  }

  const res = await fetch(url, {
    method,
    credentials: "include",     // ส่งคุกกี้ไปด้วย
    headers,
    body: method === "GET" || method === "HEAD" ? undefined : body,
  });

  // อ่าน response (รองรับทั้ง JSON/ข้อความ)
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && data.message) ||
      (typeof data === "string" ? data : null) ||
      res.statusText ||
      "Request failed";

    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// helper (ถ้าชอบเรียกแบบสั้น)
export const get = (p, h) => apiFetch(p, { method: "GET", headers: h });
export const post = (p, b, h) => apiFetch(p, { method: "POST", body: b, headers: h });
export const put  = (p, b, h) => apiFetch(p, { method: "PUT",  body: b, headers: h });
export const del  = (p, h)    => apiFetch(p, { method: "DELETE", headers: h });
