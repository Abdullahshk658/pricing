export const AUTH_COOKIE_NAME = "ppp_auth";

export function hasAuthCookie(value: string | undefined): boolean {
  return value === "1";
}