import Cookies from "js-cookie";

const COOKIE_KEY = "activeWorkSession";

export type ActiveWorkSessionCookie = {
  sessionId: string;
  startedAt: string;
};

export const setActiveWorkSessionCookie = (data: ActiveWorkSessionCookie) => {
  Cookies.set(COOKIE_KEY, JSON.stringify(data), {
    sameSite: "lax",
    expires: 1, // 1 day safety
  });
};

export const getActiveWorkSessionCookie = (): ActiveWorkSessionCookie | null => {
  const raw = Cookies.get(COOKIE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearActiveWorkSessionCookie = () => {
  Cookies.remove(COOKIE_KEY);
};
